import { Router } from 'express';
import { register, login, updateProfile, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
