import { PrismaClient, Prisma } from '@prisma/client';

(Prisma.Decimal.prototype as any).toJSON = function () {
  return Number(this.toString());
};

export const prisma = new PrismaClient();
