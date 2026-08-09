"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const db_js_1 = require("./config/db.js");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    const server = app_js_1.default.listen(PORT, () => {
        console.log(`[Server] Server listening on port http://localhost:${PORT}`);
    });
    try {
        await (0, db_js_1.connectDB)();
    }
    catch (error) {
        console.error('[Server] Database connection error:', error);
    }
};
startServer();
//# sourceMappingURL=server.js.map