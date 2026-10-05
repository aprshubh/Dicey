import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

// 1. Basic User Identity & Information
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Security, Authentication & Session Information
export interface IAccount extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  password?: string;
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  passwordResetOtp?: string;
  passwordResetOtpExpires?: Date;
  refreshToken?: string;
  isOnline: boolean;
  lastLogin?: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isOnline: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: SanitizedUser;
  tokens: AuthTokens;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface VerifyEmailDTO {
  email: string;
  otp: string;
}

export interface ResendOtpDTO {
  email: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
