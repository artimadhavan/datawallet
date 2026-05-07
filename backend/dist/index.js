"use strict";
/**
 * DataWallet Backend Architecture
 * ------------------------------
 * Framework: Express.js (Node.js v20+)
 * ORM: Prisma with SQLite (Relational Database Management)
 * Authentication: JWT (JSON Web Tokens) with Bcrypt hashing
 * Middleware: Custom Auth Guard & Error Handling Layers
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const expenses_routes_1 = __importDefault(require("./routes/expenses.routes"));
const budgets_routes_1 = __importDefault(require("./routes/budgets.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
dotenv_1.default.config();
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/expenses', expenses_routes_1.default);
app.use('/api/budgets', budgets_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
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
