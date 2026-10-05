import { Schema, model } from 'mongoose';
import { IUser, IAccount } from './auth.interface';
import { hashPassword, comparePassword } from '../../shared/utils/hash.util';

// ---------------------------------------------------------------------------
// 1. User Schema: Core Identity & Public Profile Information
// ---------------------------------------------------------------------------
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [32, 'Name cannot exceed 32 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = model<IUser>('User', userSchema);

// ---------------------------------------------------------------------------
// 2. Account Schema: Credentials, Security Tokens & Session State
// ---------------------------------------------------------------------------
const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationOtp: {
      type: String,
      select: false,
    },
    verificationOtpExpires: {
      type: Date,
      select: false,
    },
    passwordResetOtp: {
      type: String,
      select: false,
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.verificationOtp;
        delete ret.verificationOtpExpires;
        delete ret.passwordResetOtp;
        delete ret.passwordResetOtpExpires;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// Pre-save hook to hash password whenever modified
accountSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await hashPassword(this.password);
  }
});

// Compare password method on Account
accountSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return comparePassword(enteredPassword, this.password);
};

export const Account = model<IAccount>('Account', accountSchema);
