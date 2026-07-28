import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenMaxAge,
  verifyRefreshToken
} from '../utils/tokens';

const refreshCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  maxAge: getRefreshTokenMaxAge(),
  path: '/api/auth'
};

const sanitizeUser = (user: any) => {
  const { passwordHash, memberships, ...rest } = user;
  const currentMembership = memberships?.[0];
  return {
    ...rest,
    role: currentMembership?.role,
    organizationId: currentMembership?.organizationId,
    memberships
  };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { memberships: { where: { isActive: true }, take: 1 } }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const membership = user.memberships[0];
  if (!membership) {
    return res.status(403).json({ message: 'User does not belong to any organization' });
  }

  const payload = {
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role
  };
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

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { memberships: { where: { isActive: true }, take: 1 } }
  });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'User not found or inactive' });
  }

  const membership = user.memberships[0];
  if (!membership) {
    return res.status(403).json({ message: 'User does not belong to any organization' });
  }

  const accessToken = createAccessToken({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role
  });
  const newRefreshToken = createRefreshToken({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role
  });

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
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { memberships: { where: { isActive: true } } }
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user: sanitizeUser(user) });
};

export const switchOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: req.user.userId
      }
    }
  });

  if (!membership || !membership.isActive) {
    return res
      .status(403)
      .json({ message: 'Forbidden: You are not a member of this organization' });
  }

  const payload = {
    userId: req.user.userId,
    organizationId: membership.organizationId,
    role: membership.role
  };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  res
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({ accessToken, organizationId, role: membership.role });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name, company } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        company,
        preferences: { language: 'en', theme: 'dark', notifications: { email: true, push: false } }
      }
    });

    const org = await tx.organization.create({
      data: {
        name: company || 'My Company',
        slug: `org-${newUser.id}`
      }
    });

    await tx.organizationMember.create({
      data: {
        userId: newUser.id,
        organizationId: org.id,
        role: 'OWNER'
      }
    });

    return tx.user.findUnique({
      where: { id: newUser.id },
      include: { memberships: true }
    });
  });

  res.status(201).json({ user: sanitizeUser(user) });
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { name, company, avatarUrl, preferences } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: { name, company, avatarUrl, preferences },
    include: { memberships: { where: { isActive: true } } }
  });

  res.json({ user: sanitizeUser(updatedUser) });
};

export const changePassword = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) return res.status(400).json({ message: 'Invalid current password' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { passwordHash }
  });

  res.json({ message: 'Password updated successfully' });
};

export const setPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as any;
    if (decoded.type !== 'invite' || !decoded.email) {
      return res.status(400).json({ message: 'Invalid token type' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: decoded.email },
      data: { passwordHash }
    });
    res.json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};
