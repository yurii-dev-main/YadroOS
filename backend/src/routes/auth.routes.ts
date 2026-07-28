import { Router } from 'express';
import { login, logout, me, refresh, switchOrganization, register, updateProfile, changePassword, setPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.patch('/me', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/set-password', setPassword);
router.post('/switch-org', authMiddleware, switchOrganization);

export default router;
