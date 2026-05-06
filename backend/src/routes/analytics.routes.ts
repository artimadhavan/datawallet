import { Router } from 'express';
import { getSummary, runLeakDetection, getPrediction, downloadReport } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getSummary);
router.post('/detect-leaks', runLeakDetection);
router.get('/prediction', getPrediction);
router.get('/report', downloadReport);

export default router;
