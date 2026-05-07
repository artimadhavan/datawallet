"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadExpenses = exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { category, startDate, endDate, page = '1', limit = '10' } = req.query;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const query = { userId };
        if (category) {
            query.category = { contains: category };
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.gte = new Date(startDate);
            if (endDate)
                query.date.lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [expenses, total] = yield Promise.all([
            prisma_1.default.expense.findMany({
                where: query,
                skip,
                take: Number(limit),
                orderBy: { date: 'desc' },
            }),
            prisma_1.default.expense.count({ where: query }),
        ]);
        res.status(200).json({ expenses, total, page: Number(page), limit: Number(limit) });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});
exports.getExpenses = getExpenses;
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { amount, category, date, description, paymentMethod } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const expense = yield prisma_1.default.expense.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create expense' });
    }
});
exports.createExpense = createExpense;
const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const data = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const expense = yield prisma_1.default.expense.findFirst({ where: { id, userId } });
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
        const updatedExpense = yield prisma_1.default.expense.update({
            where: { id },
            data,
        });
        res.status(200).json(updatedExpense);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});
exports.updateExpense = updateExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const expense = yield prisma_1.default.expense.findFirst({ where: { id, userId } });
        if (!expense) {
            res.status(404).json({ error: 'Expense not found' });
            return;
        }
        yield prisma_1.default.expense.delete({ where: { id } });
        res.status(200).json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});
exports.deleteExpense = deleteExpense;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const BATCH_SIZE = 100;
const categorizeExpense = (description, currentCategory) => {
    const desc = (description || '').toLowerCase();
    if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant') || desc.includes('food') || desc.includes('eat') || desc.includes('dining') || desc.includes('kfc') || desc.includes('mcdonald'))
        return 'Food';
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('petrol') || desc.includes('fuel') || desc.includes('metro') || desc.includes('bus') || desc.includes('taxi'))
        return 'Transport';
    if (desc.includes('netflix') || desc.includes('prime') || desc.includes('hotstar') || desc.includes('spotify') || desc.includes('sub'))
        return 'Entertainment';
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping') || desc.includes('myntra') || desc.includes('ajio'))
        return 'Shopping';
    if (desc.includes('rent') || desc.includes('electricity') || desc.includes('water') || desc.includes('bill') || desc.includes('recharge') || desc.includes('jio') || desc.includes('airtel'))
        return 'Bills';
    return currentCategory || 'Others';
};
const uploadExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = req.file;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // 1. Parse all rows — robust column matching, validation, and logging
        const expenses = yield new Promise((resolve, reject) => {
            const rows = [];
            let rowIndex = 0;
            fs_1.default.createReadStream(file.path)
                .pipe((0, csv_parser_1.default)())
                .on('data', (raw) => {
                rowIndex++;
                // Normalize keys to lowercase for case-insensitive matching
                const data = {};
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
            fs_1.default.unlink(file.path, () => { });
            res.status(400).json({
                error: 'No valid rows found in CSV. Ensure columns are: amount, category, date, description, paymentMethod',
            });
            return;
        }
        // 2. Insert in parallel batches of BATCH_SIZE for speed
        const chunks = [];
        for (let i = 0; i < expenses.length; i += BATCH_SIZE) {
            chunks.push(expenses.slice(i, i + BATCH_SIZE));
        }
        yield Promise.all(chunks.map(chunk => prisma_1.default.expense.createMany({ data: chunk })));
        // 3. Cleanup temp file
        fs_1.default.unlink(file.path, () => { });
        res.status(201).json({
            message: `${expenses.length} expenses uploaded and auto-categorized successfully`,
            count: expenses.length,
        });
    }
    catch (error) {
        if (file === null || file === void 0 ? void 0 : file.path)
            fs_1.default.unlink(file.path, () => { });
        res.status(500).json({ error: 'Failed to upload and categorize expenses' });
    }
});
exports.uploadExpenses = uploadExpenses;
