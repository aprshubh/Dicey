import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// Initialize the zxcvbn instance using @zxcvbn-ts/core and dictionaries
const zxcvbnInstance = new ZxcvbnFactory({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

export type PasswordStrengthLevel = 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordCriteria {
  minLength: boolean;      // Min 8 characters
  maxLength: boolean;      // Max 32 characters
  hasUppercase: boolean;   // At least 1 uppercase letter
  hasLowercase: boolean;   // At least 1 lowercase letter
  hasNumber: boolean;      // At least 1 digit
  hasSpecialChar: boolean; // At least 1 special character
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  strength: PasswordStrengthLevel;
  label: string;
  isStrong: boolean;
  warning: string | null;
  recommendations: string[];
  crackTimesDisplay: {
    offlineSlowHashing: string;
    onlineNoThrottling: string;
  };
  criteria: PasswordCriteria;
}

const STRENGTH_METADATA: Record<number, { level: PasswordStrengthLevel; label: string }> = {
  0: { level: 'very_weak', label: 'Very Weak' },
  1: { level: 'weak', label: 'Weak' },
  2: { level: 'fair', label: 'Fair' },
  3: { level: 'good', label: 'Good' },
  4: { level: 'strong', label: 'Strong' },
};

/**
 * Evaluate password strength, crack times, and generate human-friendly recommendations.
 * Uses @zxcvbn-ts/core with English and common dictionaries.
 */
export const evaluatePasswordStrength = (
  password: string,
  userInputs: string[] = []
): PasswordStrengthResult => {
  const pwd = password || '';

  const minLength = pwd.length >= 8;
  const maxLength = pwd.length > 0 && pwd.length <= 32;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd);

  const criteria: PasswordCriteria = {
    minLength,
    maxLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };

  const recommendations: string[] = [];

  // Step 1: Check policy constraints and formulate recommendations
  if (!minLength) {
    recommendations.push('Password must be at least 8 characters long.');
  }
  if (!maxLength) {
    recommendations.push('Password cannot exceed 32 characters.');
  }
  if (!hasUppercase) {
    recommendations.push('Include at least one uppercase letter (A-Z).');
  }
  if (!hasLowercase) {
    recommendations.push('Include at least one lowercase letter (a-z).');
  }
  if (!hasNumber) {
    recommendations.push('Include at least one numeric digit (0-9).');
  }
  if (!hasSpecialChar) {
    recommendations.push('Include at least one special character (!@#$%^&*).');
  }

  // Step 2: Use zxcvbn algorithm to compute entropy, guessability, and feedback
  const zxcvbnResult = zxcvbnInstance.check(pwd, userInputs);

  if (zxcvbnResult.feedback.suggestions && zxcvbnResult.feedback.suggestions.length > 0) {
    for (const suggestion of zxcvbnResult.feedback.suggestions) {
      if (!recommendations.includes(suggestion)) {
        recommendations.push(suggestion);
      }
    }
  }

  const { level, label } = STRENGTH_METADATA[zxcvbnResult.score] || STRENGTH_METADATA[0];

  const allCriteriaMet =
    minLength && maxLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  // Password is officially considered strong if score >= 3 AND all policy criteria are met
  const isStrong = zxcvbnResult.score >= 3 && allCriteriaMet;

  return {
    score: zxcvbnResult.score,
    strength: level,
    label,
    isStrong,
    warning: zxcvbnResult.feedback.warning || null,
    recommendations,
    crackTimesDisplay: {
      offlineSlowHashing:
        zxcvbnResult.crackTimes.offlineSlowHashingXPerSecond.display || 'less than a second',
      onlineNoThrottling:
        zxcvbnResult.crackTimes.onlineNoThrottlingXPerSecond.display || 'less than a second',
    },
    criteria,
  };
};
