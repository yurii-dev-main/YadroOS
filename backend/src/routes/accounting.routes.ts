import { Router } from 'express';
import multer from 'multer';
import {
  createAccount,
  deleteAccount,
  getAccountById,
  listAccounts,
  updateAccount,
  transferFunds,
  reconcileAccount
} from '../controllers/accounts.controller';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction
} from '../controllers/transactions.controller';
import {
  listCategories,
  createCategory,
  listBudgets,
  createBudget,
  updateBudget,
  listInvoices,
  createInvoice,
  updateInvoiceStatus,
  getPayroll,
  runPayroll,
  getDashboardAnalytics,
  getCashBalances,
  getCategoryBreakdown,
  getClientProfitability,
  getReports,
  bulkImportTransactions,
  rollbackImport,
  syncAccountTransactions,
  getExchangeRates,
  refreshExchangeRates,
  getRecurringInsights,
  markPayrollPaid,
  searchTransactions,
  getClientPaymentHistory
} from '../controllers/accounting-extended.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(checkRole(['ADMIN', 'MANAGER', 'MEMBER']));

router.get('/accounts', listAccounts);
router.post('/accounts/transfer', transferFunds);
router.get('/accounts/:id', getAccountById);
router.post('/accounts/:id/reconcile', reconcileAccount);
router.post('/accounts/:id/sync', syncAccountTransactions);
router.post('/accounts/:id/import', syncAccountTransactions);
router.post('/accounts', createAccount);
router.put('/accounts/:id', updateAccount);
router.delete('/accounts/:id', deleteAccount);

const upload = multer({ storage: multer.memoryStorage() });

router.get('/transactions', listTransactions);
router.get('/transactions/search', searchTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions/bulk-import', upload.single('file'), bulkImportTransactions);
router.delete('/transactions/import-batch/:batchId', rollbackImport);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

router.get('/categories', listCategories);
router.post('/categories', createCategory);

router.get('/budgets', listBudgets);
router.post('/budgets', createBudget);
router.put('/budgets/:id', updateBudget);

router.get('/invoices', listInvoices);
router.post('/invoices', createInvoice);
router.put('/invoices/:id/status', updateInvoiceStatus);

router.get('/payroll', getPayroll);
router.post('/payroll/run', runPayroll);
router.post('/payroll/pay', markPayrollPaid);

router.get('/dashboard', getDashboardAnalytics);
router.get('/cash-balances', getCashBalances);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/client-profitability', getClientProfitability);
router.get('/reports', getReports);
router.get('/clients/:clientId/payment-history', getClientPaymentHistory);
router.get('/exchange-rates', getExchangeRates);
router.post('/exchange-rates/refresh', refreshExchangeRates);
router.get('/recurring-insights', getRecurringInsights);

export default router;
