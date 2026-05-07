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
exports.setBudget = exports.getBudgets = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getBudgets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const budgets = yield prisma_1.default.budget.findMany({ where: { userId } });
        res.status(200).json(budgets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});
exports.getBudgets = getBudgets;
const setBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { monthlyLimit, month, year } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const existingBudget = yield prisma_1.default.budget.findFirst({
            where: { userId, month, year },
        });
        if (existingBudget) {
            const updated = yield prisma_1.default.budget.update({
                where: { id: existingBudget.id },
                data: { monthlyLimit: Number(monthlyLimit) },
            });
            res.status(200).json(updated);
        }
        else {
            const budget = yield prisma_1.default.budget.create({
                data: { userId, monthlyLimit: Number(monthlyLimit), month, year },
            });
            res.status(201).json(budget);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to set budget' });
    }
});
exports.setBudget = setBudget;
