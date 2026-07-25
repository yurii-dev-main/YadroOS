import { Router } from 'express';
import { Role } from '@prisma/client';
import { createInvoice, getProfitAndLoss } from '../controllers/finance.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get(
  '/reports/pnl',
  checkRole([Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER]),
  getProfitAndLoss
);
router.post('/invoices', checkRole([Role.ADMIN, Role.ACCOUNTANT]), createInvoice);

export default router;
