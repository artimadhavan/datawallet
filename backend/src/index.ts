/**
 * DataWallet Backend Architecture
 * ------------------------------
 * Framework: Express.js (Node.js v20+)
 * ORM: Prisma with SQLite (Relational Database Management)
 * Authentication: JWT (JSON Web Tokens) with Bcrypt hashing
 * Middleware: Custom Auth Guard & Error Handling Layers
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import expenseRoutes from './routes/expenses.routes';
import budgetRoutes from './routes/budgets.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setInterval(() => {
  // Keep process alive
}, 1000);

console.log('Main script execution finished, waiting for events...');
