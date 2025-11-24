import type { Role } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthPayload;
  }
}
