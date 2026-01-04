import { Router } from 'express';
import authRoutes from './auth.routes';
import activitiesRoutes from './activities.routes';
import crmRoutes from './crm.routes';
import financeRoutes from './finance.routes';
import accountingRoutes from './accounting.routes';
import hrRoutes from './hr.routes';
import communicationsRoutes from './communications.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activitiesRoutes);
router.use('/crm', crmRoutes);
router.use('/finance', financeRoutes);
router.use('/v1/accounting', accountingRoutes);
router.use('/v1/hr', hrRoutes);
router.use('/v1/communications', communicationsRoutes);
router.use('/v1/ai', aiRoutes);

export default router;
