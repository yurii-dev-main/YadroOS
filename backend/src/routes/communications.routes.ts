import { Router } from 'express';
import {
  createMessage,
  getTelegramStatus,
  handleTelegramWebhook,
  listMessages,
  listMessagesForThread,
  listThreads,
  updateTelegramStatus
} from '../controllers/communications.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/telegram/webhook', handleTelegramWebhook);

router.use(authMiddleware);
router.get('/threads', listThreads);
router.get('/threads/:threadId/messages', listMessagesForThread);
router.get('/messages', listMessages);
router.post('/messages', createMessage);
router.get('/telegram/status', getTelegramStatus);
router.put('/telegram/status', updateTelegramStatus);

export default router;
