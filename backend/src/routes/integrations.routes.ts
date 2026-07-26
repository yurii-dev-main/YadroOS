import { Router } from 'express';
import { integrationsController } from '../controllers/integrations.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();

// Only ADMIN and MANAGER roles should manage integrations
router.use(authMiddleware);
router.use(checkRole(['ADMIN', 'MANAGER']));

router.get('/', integrationsController.getConnections);
router.post('/', integrationsController.addConnection);
router.delete('/:id', integrationsController.deleteConnection);
router.get('/:id/health', integrationsController.checkHealth);

export default router;
