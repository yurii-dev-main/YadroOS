import type { OrgRole } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  organizationId: string;
  role: OrgRole;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthPayload;
  }
}
