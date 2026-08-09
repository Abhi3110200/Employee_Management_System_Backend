import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  leadName: string;
  leadTitle: string;
  headcount: number;
  openPositions: number;
  totalBudget: number;
  spentBudget: number;
  color: string;
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    leadName: {
      type: String,
      default: 'Unassigned',
    },
    leadTitle: {
      type: String,
      default: 'Department Lead',
    },
    headcount: {
      type: Number,
      default: 1,
    },
    openPositions: {
      type: Number,
      default: 0,
    },
    totalBudget: {
      type: Number,
      default: 500000,
    },
    spentBudget: {
      type: Number,
      default: 300000,
    },
    color: {
      type: String,
      default: 'from-indigo-600 to-purple-600',
    },
    projects: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DepartmentModel = mongoose.model<IDepartment>('Department', departmentSchema);
