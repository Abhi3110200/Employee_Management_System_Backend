import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId;
  employeeName: string;
  department: string;
  type: 'casual' | 'sick' | 'paid' | 'remote';
  startDate: Date;
  endDate: Date;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: Date;
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeaveRequest>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['casual', 'sick', 'paid', 'remote'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    daysCount: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewComment: {
      type: String,
      default: '',
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

export const LeaveRequestModel = mongoose.model<ILeaveRequest>('LeaveRequest', leaveSchema);
