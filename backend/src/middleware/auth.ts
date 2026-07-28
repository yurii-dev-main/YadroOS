import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { OrgRole } from '@prisma/client';
import type { AuthPayload } from '../types/express';
import { env } from '../config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const checkRole = (roles: OrgRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'OWNER')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
