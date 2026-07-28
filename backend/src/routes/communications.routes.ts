import { Router } from 'express';
import {
  createMessage,
  getTelegramStatus,
  handleTelegramWebhook,
  listMessages,
  listMessagesForThread,
  listThreads,
  updateTelegramStatus,
  listEmails,
  createEmail,
  listCannedResponses,
  getAutoResponders,
  getNotificationPreferences
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

router.get('/emails', listEmails);
router.post('/emails', createEmail);
router.get('/canned-responses', listCannedResponses);
router.get('/auto-responders', getAutoResponders);
router.get('/notification-preferences', getNotificationPreferences);

export default router;
