import { Router } from 'express';
import { createAIInsights, createChatCompletion, getAIInsights } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.post('/chat', createChatCompletion);
router.get('/insights', getAIInsights);
router.post('/insights', createAIInsights);

export default router;
