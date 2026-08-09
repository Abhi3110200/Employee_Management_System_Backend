import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceGoal extends Document {
  employee: mongoose.Types.ObjectId;
  employeeName: string;
  department: string;
  title: string;
  category: 'OKR' | 'Project' | 'Skill' | 'Leadership';
  dueDate: Date;
  progress: number;
  status: 'in_progress' | 'completed' | 'behind';
  createdAt: Date;
  updatedAt: Date;
}

export interface IPerformanceReview extends Document {
  employee: mongoose.Types.ObjectId;
  employeeName: string;
  designation: string;
  department: string;
  rating: number;
  quarter: string;
  reviewStatus: 'completed' | 'pending';
  strengths: string;
  growthAreas: string;
  reviewedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IPerformanceGoal>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['OKR', 'Project', 'Skill', 'Leadership'],
      default: 'OKR',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'behind'],
      default: 'in_progress',
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

const reviewSchema = new Schema<IPerformanceReview>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1.0,
      max: 5.0,
    },
    quarter: {
      type: String,
      default: 'Q3 2026',
    },
    reviewStatus: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'completed',
    },
    strengths: {
      type: String,
      default: '',
    },
    growthAreas: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: 'Admin',
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

export const GoalModel = mongoose.model<IPerformanceGoal>('PerformanceGoal', goalSchema);
export const ReviewModel = mongoose.model<IPerformanceReview>('PerformanceReview', reviewSchema);
