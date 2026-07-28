import { Router } from 'express';
import {
  listApiKeys,
  createApiKey,
  deleteApiKey,
  listWebhooks,
  createWebhook,
  deleteWebhook
} from '../controllers/developer.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/api-keys', listApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:id', deleteApiKey);

router.get('/webhooks', listWebhooks);
router.post('/webhooks', createWebhook);
router.delete('/webhooks/:id', deleteWebhook);

export default router;
