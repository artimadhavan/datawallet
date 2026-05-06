import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const budgets = await prisma.budget.findMany({ where: { userId } });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const setBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { monthlyLimit, month, year } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingBudget = await prisma.budget.findFirst({
      where: { userId, month, year },
    });

    if (existingBudget) {
      const updated = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { monthlyLimit: Number(monthlyLimit) },
      });
      res.status(200).json(updated);
    } else {
      const budget = await prisma.budget.create({
        data: { userId, monthlyLimit: Number(monthlyLimit), month, year },
      });
      res.status(201).json(budget);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to set budget' });
  }
};
