import { z } from 'zod';
import {
  nameValidation,
  emailValidation,
  passwordValidation,
  loginPasswordValidation,
} from '../../shared/validators/auth.rules';

// Re-export modular individual validations so consumers can use them directly
export {
  nameValidation,
  emailValidation,
  passwordValidation,
  loginPasswordValidation,
};

const otpValidation = z
  .string()
  .trim()
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d+$/, 'Verification code must contain digits only');

export const registerSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
});

export const loginSchema = z.object({
  email: emailValidation,
  password: loginPasswordValidation,
});

export const verifyEmailSchema = z.object({
  email: emailValidation,
  otp: otpValidation,
});

export const resendOtpSchema = z.object({
  email: emailValidation,
});

export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export const resetPasswordSchema = z.object({
  email: emailValidation,
  otp: z
    .string()
    .trim()
    .length(6, 'Reset code must be exactly 6 digits')
    .regex(/^\d+$/, 'Reset code must contain digits only'),
  newPassword: passwordValidation,
});

export const changePasswordSchema = z.object({
  currentPassword: loginPasswordValidation,
  newPassword: passwordValidation,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const checkPasswordStrengthSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .max(32, 'Password cannot exceed 32 characters'),
  userInputs: z.array(z.string()).optional(),
});
