import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, startDate, endDate, page = '1', limit = '10' } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const query: any = { userId };

    if (category) {
      query.category = { contains: category as string };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.gte = new Date(startDate as string);
      if (endDate) query.date.lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: query,
        skip,
        take: Number(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.expense.count({ where: query }),
    ]);

    res.status(200).json({ expenses, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, category, date, description, paymentMethod } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: Number(amount),
        category,
        date: new Date(date),
        description,
        paymentMethod,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const data = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const expense = await prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    if (data.date) {
      data.date = new Date(data.date);
    }
    if (data.amount) {
      data.amount = Number(data.amount);
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data,
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const expense = await prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    await prisma.expense.delete({ where: { id } });
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

import fs from 'fs';
import csvParser from 'csv-parser';

const BATCH_SIZE = 100;

const categorizeExpense = (description: string, currentCategory: string) => {
  const desc = (description || '').toLowerCase();
  if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant') || desc.includes('food') || desc.includes('eat') || desc.includes('dining') || desc.includes('kfc') || desc.includes('mcdonald')) return 'Food';
  if (desc.includes('uber') || desc.includes('ola') || desc.includes('petrol') || desc.includes('fuel') || desc.includes('metro') || desc.includes('bus') || desc.includes('taxi')) return 'Transport';
  if (desc.includes('netflix') || desc.includes('prime') || desc.includes('hotstar') || desc.includes('spotify') || desc.includes('sub')) return 'Entertainment';
  if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping') || desc.includes('myntra') || desc.includes('ajio')) return 'Shopping';
  if (desc.includes('rent') || desc.includes('electricity') || desc.includes('water') || desc.includes('bill') || desc.includes('recharge') || desc.includes('jio') || desc.includes('airtel')) return 'Bills';
  return currentCategory || 'Others';
};

export const uploadExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // 1. Parse all rows — robust column matching, validation, and logging
    const expenses: any[] = await new Promise((resolve, reject) => {
      const rows: any[] = [];
      let rowIndex = 0;
      fs.createReadStream(file.path)
        .pipe(csvParser())
        .on('data', (raw) => {
          rowIndex++;

          // Normalize keys to lowercase for case-insensitive matching
          const data: any = {};
          for (const key of Object.keys(raw)) {
            data[key.trim().toLowerCase()] = typeof raw[key] === 'string' ? raw[key].trim() : raw[key];
          }

          // Amount — strip currency symbols before parsing
          const amount = parseFloat(String(data.amount || '').replace(/[^0-9.]/g, ''));
          if (isNaN(amount) || amount <= 0) {
            console.warn(`[Upload] Row ${rowIndex} skipped — invalid amount: "${data.amount}"`);
            return;
          }

          // Date — try multiple common formats
          const rawDate = data.date || data['transaction date'] || data['txn date'] || '';
          const parsedDate = new Date(rawDate);
          if (!rawDate || isNaN(parsedDate.getTime())) {
            console.warn(`[Upload] Row ${rowIndex} skipped — invalid date: "${rawDate}"`);
            return;
          }

          // Required non-nullable string fields
          const description = (data.description || data.narration || data.details || 'No description').trim() || 'No description';
          const rawCategory = (data.category || '').trim();
          const paymentMethod = (data.paymentmethod || data.payment_method || data.mode || 'Other').trim() || 'Other';

          rows.push({
            userId,
            amount,
            category: categorizeExpense(description, rawCategory),
            date: parsedDate,
            description,
            paymentMethod,
          });
        })
        .on('end', () => {
          console.log(`[Upload] Parsed ${rows.length} valid rows from ${rowIndex} total CSV rows`);
          resolve(rows);
        })
        .on('error', reject);
    });

    if (expenses.length === 0) {
      fs.unlink(file.path, () => {});
      res.status(400).json({
        error: 'No valid rows found in CSV. Ensure columns are: amount, category, date, description, paymentMethod',
      });
      return;
    }

    // 2. Insert in parallel batches of BATCH_SIZE for speed
    const chunks: any[][] = [];
    for (let i = 0; i < expenses.length; i += BATCH_SIZE) {
      chunks.push(expenses.slice(i, i + BATCH_SIZE));
    }
    await Promise.all(chunks.map(chunk => prisma.expense.createMany({ data: chunk })));

    // 3. Cleanup temp file
    fs.unlink(file.path, () => {});

    res.status(201).json({
      message: `${expenses.length} expenses uploaded and auto-categorized successfully`,
      count: expenses.length,
    });
  } catch (error) {
    if (file?.path) fs.unlink(file.path, () => {});
    res.status(500).json({ error: 'Failed to upload and categorize expenses' });
  }
};

export const uploadBillImage = async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const expense = await prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) {
      fs.unlink(file.path, () => {});
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const billImageUrl = `/uploads/${file.filename}`;

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { billImageUrl },
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    if (file?.path) fs.unlink(file.path, () => {});
    res.status(500).json({ error: 'Failed to upload bill image' });
  }
};
