"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const employee_routes_js_1 = __importDefault(require("./routes/employee.routes.js"));
const hierarchy_routes_js_1 = __importDefault(require("./routes/hierarchy.routes.js"));
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL,
].filter((url) => Boolean(url));
// CORS Configuration with dynamic origin callback
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman, mobile apps, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        // Fallback: reflect request origin for browser credentials support
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check Endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Backend server is running smoothly',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/employees', employee_routes_js_1.default);
app.use('/api/hierarchy', hierarchy_routes_js_1.default);
app.use('/api/organization', hierarchy_routes_js_1.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    });
});
// Global Error Handling Middleware
app.use((err, _req, res, _next) => {
    console.error('[Error]', err.stack || err.message);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map