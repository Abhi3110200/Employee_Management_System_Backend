import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  department?: string;
  designation?: string;
  position?: string; // alias for designation
  salary?: number;
  joiningDate?: Date;
  status: 'active' | 'inactive';
  role: 'super_admin' | 'hr_manager' | 'employee';
  manager?: mongoose.Types.ObjectId | IUser | null;
  profileImage?: string;
  address?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Staff Member',
      trim: true,
    },
    position: {
      type: String,
      default: 'Staff Member',
      trim: true,
    },
    salary: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['super_admin', 'hr_manager', 'employee'],
      default: 'employee',
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    profileImage: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    refreshTokens: {
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

// Pre-save hook for password hashing & employeeId generation
userSchema.pre('save', async function () {
  if (!this.employeeId) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    this.employeeId = `EMP-${randomCode}`;
  }

  if (this.designation && !this.position) {
    this.position = this.designation;
  } else if (this.position && !this.designation) {
    this.designation = this.position;
  }

  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
