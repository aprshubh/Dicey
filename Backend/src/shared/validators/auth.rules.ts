import { z } from 'zod';
import { evaluatePasswordStrength } from '../utils/passwordStrength.util';

/**
 * Name Validation Rule:
 * - Must be at least 2 letters and max 32 characters
 * - Only letters, spaces, hyphens, and apostrophes allowed
 */
export const nameValidation = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters long')
  .max(32, 'Name cannot exceed 32 characters')
  .regex(
    /^(?=(?:.*[a-zA-Z]){2})[a-zA-Z\s'-]+$/,
    'Name must contain at least 2 letters and only valid characters (letters, spaces, hyphens)'
  );

/**
 * Email Validation Rule:
 * - Must be a valid email format
 * - Trimmed, lowercase, max 255 chars
 */
export const emailValidation = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email cannot exceed 255 characters')
  .toLowerCase()
  .email('Please provide a valid email address');

/**
 * Strict Password Validation Rule (For registration, reset password, change password):
 * - Minimum 8 characters
 * - Maximum 32 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numerical digit (0-9)
 * - At least one special character (!@#$%^&*...)
 * - Evaluated with @zxcvbn-ts/core to reject trivial/compromised passwords (score < 1)
 */
export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(32, 'Password cannot exceed 32 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/,
    'Password must contain at least one special character'
  )
  .superRefine((pwd, ctx) => {
    const evaluation = evaluatePasswordStrength(pwd);
    if (evaluation.score === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          evaluation.warning ||
          'Password is too weak. Please avoid common dictionary words or predictable sequences.',
      });
    }
  });

/**
 * Login Password Validation Rule:
 * - Required string with min 1 and max 32 characters
 */
export const loginPasswordValidation = z
  .string()
  .min(1, 'Password is required')
  .max(32, 'Password cannot exceed 32 characters');
