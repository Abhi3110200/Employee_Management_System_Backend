"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_js_1 = require("./models/user.model.js");
const db_js_1 = require("./config/db.js");
const seedUsers = [
    {
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Manager User',
        email: 'manager@company.com',
        password: 'manager123',
        role: 'manager',
    },
    {
        name: 'Employee User',
        email: 'employee@company.com',
        password: 'employee123',
        role: 'employee',
    },
];
const seed = async () => {
    try {
        await (0, db_js_1.connectDB)();
        console.log('[Seed] Database connected.');
        for (const u of seedUsers) {
            const existing = await user_model_js_1.User.findOne({ email: u.email });
            if (!existing) {
                const newUser = new user_model_js_1.User(u);
                await newUser.save();
                console.log(`[Seed] Created user: ${u.email} (${u.role})`);
            }
            else {
                console.log(`[Seed] User already exists: ${u.email}`);
            }
        }
        console.log('[Seed] Seeding finished successfully.');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (err) {
        console.error('[Seed] Error during seeding:', err);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map