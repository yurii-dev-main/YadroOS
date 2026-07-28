import { Router } from 'express';
import { OrgRole } from '@prisma/client';
import { createInvoice, getProfitAndLoss, sendInvoice, recordInvoicePayment, sendInvoiceReminders } from '../controllers/finance.controller';
import { listInvoices } from '../controllers/accounting-extended.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get(
  '/reports/pnl',
  checkRole([OrgRole.ADMIN, OrgRole.ACCOUNTANT, OrgRole.MANAGER]),
  getProfitAndLoss
);
router.get('/invoices', checkRole([OrgRole.ADMIN, OrgRole.ACCOUNTANT]), listInvoices);
router.post('/invoices', checkRole([OrgRole.ADMIN, OrgRole.ACCOUNTANT]), createInvoice);
router.post('/invoices/:id/send', checkRole([OrgRole.ADMIN, OrgRole.ACCOUNTANT]), sendInvoice);
router.post('/invoices/:id/payments', checkRole([OrgRole.ADMIN, OrgRole.ACCOUNTANT]), recordInvoicePayment);
router.post('/invoices/reminders', checkRole([OrgRole.ADMIN, OrgRole.ACCOUNTANT]), sendInvoiceReminders);

export default router;
