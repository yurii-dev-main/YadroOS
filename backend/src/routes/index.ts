import { Router } from 'express';
import authRoutes from './auth.routes';
import crmRoutes from './crm.routes';
import financeRoutes from './finance.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/crm', crmRoutes);
router.use('/finance', financeRoutes);

export default router;
