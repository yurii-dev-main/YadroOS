import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { createAccessToken, createRefreshToken, getRefreshTokenMaxAge, verifyRefreshToken } from '../utils/tokens';

const refreshCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  maxAge: getRefreshTokenMaxAge(),
  path: '/api/auth'
};

const sanitizeUser = (user: any) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { employee: true }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  res
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({ accessToken, user: sanitizeUser(user) });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { employee: true } });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'User not found or inactive' });
  }

  const accessToken = createAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = createRefreshToken({ userId: user.id, role: user.role });

  res
    .cookie('refreshToken', newRefreshToken, refreshCookieOptions)
    .json({ accessToken, user: sanitizeUser(user) });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/auth' }).json({ message: 'Logged out' });
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { employee: true } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user: sanitizeUser(user) });
};
