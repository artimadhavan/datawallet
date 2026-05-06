import { Router } from 'express';
import { getBudgets, setBudget } from '../controllers/budget.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', setBudget);

export default router;
