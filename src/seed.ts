import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import { DepartmentModel } from './models/department.model.js';
import { LeaveRequestModel } from './models/leave.model.js';
import { GoalModel, ReviewModel } from './models/performance.model.js';
import { NotificationModel } from './models/notification.model.js';
import { connectDB } from './config/db.js';

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

const seedDepartments = [
  {
    name: 'Engineering',
    code: 'ENG',
    leadName: 'Super Admin',
    leadTitle: 'Chief Technology Officer',
    headcount: 18,
    openPositions: 4,
    totalBudget: 950000,
    spentBudget: 680000,
    color: 'from-indigo-600 to-purple-600',
    projects: ['Kubernetes Migration', 'Dual-Token JWT Refactor', 'Org Hierarchy API'],
  },
  {
    name: 'Product & Design',
    code: 'PROD',
    leadName: 'David Chen',
    leadTitle: 'Chief Product Officer',
    headcount: 10,
    openPositions: 2,
    totalBudget: 550000,
    spentBudget: 390000,
    color: 'from-amber-500 to-rose-600',
    projects: ['Dark Glassmorphism Design System', 'Mobile App V2', 'User Analytics Dashboard'],
  },
  {
    name: 'Human Resources',
    code: 'HR',
    leadName: 'HR Manager',
    leadTitle: 'Lead HR Director',
    headcount: 6,
    openPositions: 1,
    totalBudget: 320000,
    spentBudget: 210000,
    color: 'from-emerald-500 to-teal-600',
    projects: ['Automated Onboarding Portal', 'Q3 Performance Review', 'Employee Benefits Upgrade'],
  },
  {
    name: 'Marketing & PR',
    code: 'MKT',
    leadName: 'Emily Watson',
    leadTitle: 'VP of Global Marketing',
    headcount: 8,
    openPositions: 2,
    totalBudget: 480000,
    spentBudget: 310000,
    color: 'from-purple-500 to-pink-600',
    projects: ['Annual Growth Summit 2026', 'SEO Rebrand Campaign'],
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('[Seed] Database connected.');

    for (const u of seedUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const newUser = new User(u);
        await newUser.save();
        console.log(`[Seed] Created user: ${u.email} (${u.role})`);
      } else {
        existing.employeeId = u.employeeId;
        existing.role = u.role as any;
        existing.department = u.department;
        existing.designation = u.designation;
        existing.position = u.position;
        existing.salary = u.salary;
        existing.phone = u.phone;
        existing.address = u.address;
        existing.joiningDate = u.joiningDate;
        existing.status = u.status as any;
        existing.profileImage = u.profileImage;
        await existing.save();
        console.log(`[Seed] Updated existing user: ${u.email} (${u.role})`);
      }
    }

    for (const d of seedDepartments) {
      const existing = await DepartmentModel.findOne({ name: d.name });
      if (!existing) {
        await DepartmentModel.create(d);
        console.log(`[Seed] Created department: ${d.name}`);
      }
    }

    console.log('[Seed] Seeding finished successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seed();
