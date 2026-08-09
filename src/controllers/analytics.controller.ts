import { Request, Response } from 'express';
import { User } from '../models/user.model.js';

export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeEmployees = await User.find({ isDeleted: false });

    // Salary band distribution
    const salaryBands = [
      { label: '$30k - $60k', count: 0, percentage: 0, color: 'bg-indigo-500' },
      { label: '$60k - $90k', count: 0, percentage: 0, color: 'bg-purple-500' },
      { label: '$90k - $120k', count: 0, percentage: 0, color: 'bg-emerald-500' },
      { label: '$120k - $150k', count: 0, percentage: 0, color: 'bg-amber-500' },
      { label: '$150k+', count: 0, percentage: 0, color: 'bg-rose-500' },
    ];

    let totalSalary = 0;
    activeEmployees.forEach((emp) => {
      const sal = emp.salary || 60000;
      totalSalary += sal;

      if (sal < 60000) salaryBands[0].count++;
      else if (sal < 90000) salaryBands[1].count++;
      else if (sal < 120000) salaryBands[2].count++;
      else if (sal < 150000) salaryBands[3].count++;
      else salaryBands[4].count++;
    });

    const totalCount = activeEmployees.length || 1;
    salaryBands.forEach((band) => {
      band.percentage = Math.round((band.count / totalCount) * 100);
    });

    // Department compensation breakdown
    const deptMap: { [key: string]: { salaries: number[]; count: number } } = {};

    activeEmployees.forEach((emp) => {
      const dept = emp.department || 'Other';
      if (!deptMap[dept]) {
        deptMap[dept] = { salaries: [], count: 0 };
      }
      deptMap[dept].salaries.push(emp.salary || 75000);
      deptMap[dept].count++;
    });

    const departmentPayMetrics = Object.keys(deptMap).map((dept) => {
      const salArray = deptMap[dept].salaries;
      const sum = salArray.reduce((a, b) => a + b, 0);
      return {
        name: dept,
        headcount: deptMap[dept].count,
        avgSalary: Math.round(sum / salArray.length),
        minSalary: Math.min(...salArray),
        maxSalary: Math.max(...salArray),
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalEmployees: activeEmployees.length,
        averageSalary: Math.round(totalSalary / totalCount),
        salaryBands,
        departmentPayMetrics,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate analytics summary',
    });
  }
};
