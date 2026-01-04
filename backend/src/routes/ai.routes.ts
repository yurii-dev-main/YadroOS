import { Router } from 'express';
import { createChatCompletion } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.post('/chat', createChatCompletion);

export default router;
