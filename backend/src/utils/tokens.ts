import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthPayload } from '../types/express';

const parseDurationToMs = (duration: string): number => {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) return 0;

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

export const createAccessToken = (payload: AuthPayload) => {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenExpiresIn as any });
};

export const createRefreshToken = (payload: AuthPayload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenExpiresIn as any });
};

export const verifyRefreshToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as AuthPayload;
  } catch (error) {
    return null;
  }
};

export const getRefreshTokenMaxAge = () => parseDurationToMs(env.refreshTokenExpiresIn || '7d');
