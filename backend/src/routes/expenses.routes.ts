import { Router } from 'express';
import multer from 'multer';
import { getExpenses, createExpense, updateExpense, deleteExpense, uploadExpenses } from '../controllers/expense.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticateToken); // Protect all expense routes

router.get('/', getExpenses);
router.post('/', createExpense);
router.post('/upload', upload.single('file'), uploadExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
