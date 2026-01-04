import { Router } from 'express';
import authRoutes from './auth.routes';
import activitiesRoutes from './activities.routes';
import crmRoutes from './crm.routes';
import financeRoutes from './finance.routes';
import accountingRoutes from './accounting.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activitiesRoutes);
router.use('/crm', crmRoutes);
router.use('/finance', financeRoutes);
router.use('/v1/accounting', accountingRoutes);

export default router;
