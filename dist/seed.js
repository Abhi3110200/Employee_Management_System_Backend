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
        employeeId: 'EMP-1001',
        name: 'Super Admin',
        email: 'superadmin@company.com',
        password: 'superadmin123',
        role: 'super_admin',
        department: 'Executive',
        designation: 'Chief Technology Officer',
        position: 'Chief Technology Officer',
        salary: 150000,
        phone: '+1 (555) 019-2831',
        address: '100 Enterprise Way, Suite 500, San Francisco, CA',
        joiningDate: new Date('2023-01-15'),
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    {
        employeeId: 'EMP-1002',
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'hrmanager123',
        role: 'hr_manager',
        department: 'Human Resources',
        designation: 'Lead HR Director',
        position: 'Lead HR Director',
        salary: 110000,
        phone: '+1 (555) 014-9982',
        address: '200 Corporate Blvd, Building B, Austin, TX',
        joiningDate: new Date('2023-04-01'),
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    },
    {
        employeeId: 'EMP-1003',
        name: 'Standard Employee',
        email: 'employee@company.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        position: 'Senior Software Engineer',
        salary: 95000,
        phone: '+1 (555) 012-3456',
        address: '456 Tech Park Dr, Seattle, WA',
        joiningDate: new Date('2024-02-10'),
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
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
                existing.employeeId = u.employeeId;
                existing.role = u.role;
                existing.department = u.department;
                existing.designation = u.designation;
                existing.position = u.position;
                existing.salary = u.salary;
                existing.phone = u.phone;
                existing.address = u.address;
                existing.joiningDate = u.joiningDate;
                existing.status = u.status;
                existing.profileImage = u.profileImage;
                await existing.save();
                console.log(`[Seed] Updated existing user: ${u.email} (${u.role})`);
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