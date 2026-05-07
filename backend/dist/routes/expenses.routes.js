"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const expense_controller_1 = require("../controllers/expense.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.use(auth_middleware_1.authenticateToken); // Protect all expense routes
router.get('/', expense_controller_1.getExpenses);
router.post('/', expense_controller_1.createExpense);
router.post('/upload', upload.single('file'), expense_controller_1.uploadExpenses);
router.put('/:id', expense_controller_1.updateExpense);
router.delete('/:id', expense_controller_1.deleteExpense);
exports.default = router;
