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
  updateEmail,
  bulkMoveFolder,
  listCannedResponses,
  getAutoResponders,
  updateAutoResponder,
  getNotificationPreferences,
  listEmailTemplates,
  createEmailTemplate,
  deleteEmailTemplate
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
router.patch('/emails/:id', updateEmail);
router.put('/emails/bulk-folder', bulkMoveFolder);
router.get('/email-templates', listEmailTemplates);
router.post('/email-templates', createEmailTemplate);
router.delete('/email-templates/:id', deleteEmailTemplate);

router.get('/canned-responses', listCannedResponses);
router.get('/auto-responders', getAutoResponders);
router.put('/auto-responders/:id', updateAutoResponder);

router.get('/notification-preferences', getNotificationPreferences);

export default router;
