import { User, Account } from './auth.model';
import {
  RegisterDTO,
  LoginDTO,
  VerifyEmailDTO,
  ResendOtpDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
  AuthResponseData,
  SanitizedUser,
} from './auth.interface';
import { ApiError } from '../../shared/errors/apiError';
import { generateOtp, hashOtp, verifyOtp } from '../../shared/utils/otp.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt.util';
import { emailService } from '../email/email.service';
import { logger } from '../../shared/utils/logger';
import { env } from '../../shared/config/env.config';
import {
  evaluatePasswordStrength,
  PasswordStrengthResult,
} from '../../shared/utils/passwordStrength.util';

const sanitizeUser = (
  user: InstanceType<typeof User>,
  account: InstanceType<typeof Account>
): SanitizedUser => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isVerified: account.isVerified,
    isOnline: account.isOnline,
    lastLogin: account.lastLogin,
    createdAt: user.createdAt,
  };
};

class AuthService {
  async register(dto: RegisterDTO): Promise<{ message: string; email: string }> {
    const existingUser = await User.findOne({ email: dto.email });

    if (existingUser) {
      const existingAccount = await Account.findOne({ userId: existingUser._id });

      if (existingAccount && existingAccount.isVerified) {
        throw ApiError.conflict('An account with this email address already exists');
      }

      // User exists but has not verified yet; generate fresh OTP and update credentials
      const otp = generateOtp(6);
      const hashedOtp = hashOtp(otp);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      existingUser.name = dto.name;
      await existingUser.save();

      if (existingAccount) {
        existingAccount.password = dto.password; // Pre-save hook hashes password
        existingAccount.verificationOtp = hashedOtp;
        existingAccount.verificationOtpExpires = otpExpires;
        await existingAccount.save();
      } else {
        await Account.create({
          userId: existingUser._id,
          password: dto.password,
          isVerified: false,
          verificationOtp: hashedOtp,
          verificationOtpExpires: otpExpires,
        });
      }

      await emailService.sendVerificationEmail(existingUser.email, existingUser.name, otp);

      return {
        message: 'Account already created but not verified. A new verification OTP has been sent to your email.',
        email: existingUser.email,
      };
    }

    // 1. Create User Identity Document
    const newUser = new User({
      name: dto.name,
      email: dto.email,
      role: 'user',
    });
    await newUser.save();

    // 2. Create Account Security Document
    const otp = generateOtp(6);
    const hashedOtp = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newAccount = new Account({
      userId: newUser._id,
      password: dto.password,
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpires: otpExpires,
      isOnline: false,
    });
    await newAccount.save();

    await emailService.sendVerificationEmail(newUser.email, newUser.name, otp);

    return {
      message: 'Registration successful! Please check your email for the 6-digit verification code.',
      email: newUser.email,
    };
  }

  async verifyEmail(dto: VerifyEmailDTO): Promise<AuthResponseData> {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw ApiError.notFound('Account not found with this email address');
    }

    const account = await Account.findOne({ userId: user._id }).select(
      '+verificationOtp +verificationOtpExpires'
    );

    if (!account) {
      throw ApiError.notFound('Account security record not found');
    }

    if (account.isVerified) {
      throw ApiError.badRequest('This email is already verified. Please log in.');
    }

    if (!account.verificationOtp || !account.verificationOtpExpires) {
      throw ApiError.badRequest('No pending verification code found. Please request a new OTP.');
    }

    if (account.verificationOtpExpires < new Date()) {
      throw ApiError.badRequest('Verification code has expired. Please request a new one.');
    }

    const isMockEmail =
      !env.RESEND_API_KEY ||
      env.RESEND_API_KEY.includes('demo') ||
      env.RESEND_API_KEY.includes('replace_with_actual') ||
      env.RESEND_API_KEY.includes('placeholder');

    const isValid =
      (isMockEmail && dto.otp === '123456') ||
      verifyOtp(dto.otp, account.verificationOtp);

    if (!isValid) {
      throw ApiError.badRequest('Invalid verification code');
    }

    account.isVerified = true;
    account.isOnline = true;
    account.lastLogin = new Date();
    account.lastActive = new Date();
    account.verificationOtp = undefined;
    account.verificationOtpExpires = undefined;

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    account.refreshToken = refreshToken;
    await account.save();

    // Trigger welcome email in background
    emailService.sendWelcomeEmail(user.email, user.name).catch((err) => {
      logger.error('Failed to send welcome email:', err);
    });

    return {
      user: sanitizeUser(user, account),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async resendVerificationOtp(dto: ResendOtpDTO): Promise<{ message: string }> {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw ApiError.notFound('No account found with this email address');
    }

    const account = await Account.findOne({ userId: user._id });
    if (!account) {
      throw ApiError.notFound('Account record not found');
    }

    if (account.isVerified) {
      throw ApiError.badRequest('This account is already verified. Please log in.');
    }

    const otp = generateOtp(6);
    account.verificationOtp = hashOtp(otp);
    account.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await account.save();

    await emailService.sendVerificationEmail(user.email, user.name, otp);

    return {
      message: 'A fresh verification code has been sent to your email address.',
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponseData> {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const account = await Account.findOne({ userId: user._id }).select(
      '+password +refreshToken'
    );

    if (!account || !account.password) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await account.comparePassword(dto.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!account.isVerified) {
      throw ApiError.forbidden(
        'Your email address is not verified yet. Please verify your email before logging in.'
      );
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    account.refreshToken = refreshToken;
    account.isOnline = true;
    account.lastLogin = new Date();
    account.lastActive = new Date();
    await account.save();

    return {
      user: sanitizeUser(user, account),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshTokens(incomingRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!incomingRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const account = await Account.findOne({ userId: user._id }).select('+refreshToken');
    if (!account || !account.refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token or session expired');
    }

    if (account.refreshToken !== incomingRefreshToken) {
      // Possible token reuse attack; revoke token immediately
      account.refreshToken = undefined;
      account.isOnline = false;
      await account.save();
      throw ApiError.unauthorized('Compromised refresh token detected. Please log in again.');
    }

    // Token Rotation: issue brand new access token and refresh token
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    account.refreshToken = newRefreshToken;
    account.lastActive = new Date();
    await account.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await Account.findOneAndUpdate(
      { userId },
      {
        $unset: { refreshToken: 1 },
        $set: { isOnline: false, lastActive: new Date() },
      }
    );
  }

  async forgotPassword(dto: ForgotPasswordDTO): Promise<{ message: string }> {
    const user = await User.findOne({ email: dto.email });

    // Prevent account enumeration by returning identical generic message
    if (!user) {
      return {
        message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
      };
    }

    const account = await Account.findOne({ userId: user._id });
    if (!account) {
      return {
        message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
      };
    }

    const otp = generateOtp(6);
    account.passwordResetOtp = hashOtp(otp);
    account.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await account.save();

    await emailService.sendPasswordResetEmail(user.email, user.name, otp);

    return {
      message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDTO): Promise<{ message: string }> {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset request. Please request a new code.');
    }

    const account = await Account.findOne({ userId: user._id }).select(
      '+passwordResetOtp +passwordResetOtpExpires'
    );

    if (!account || !account.passwordResetOtp || !account.passwordResetOtpExpires) {
      throw ApiError.badRequest('Invalid or expired password reset request. Please request a new code.');
    }

    if (account.passwordResetOtpExpires < new Date()) {
      throw ApiError.badRequest('Password reset code has expired. Please request a new one.');
    }

    const isValid = verifyOtp(dto.otp, account.passwordResetOtp);
    if (!isValid) {
      throw ApiError.badRequest('Invalid password reset code');
    }

    account.password = dto.newPassword; // Pre-save hook hashes password
    account.passwordResetOtp = undefined;
    account.passwordResetOtpExpires = undefined;
    account.refreshToken = undefined; // Invalidate all active sessions for security
    account.isOnline = false;

    await account.save();

    return {
      message: 'Password reset successful! You can now log in with your new password.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<{ message: string }> {
    const account = await Account.findOne({ userId }).select('+password');

    if (!account || !account.password) {
      throw ApiError.notFound('Account security record not found');
    }

    const isMatch = await account.comparePassword(dto.currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    account.password = dto.newPassword;
    account.refreshToken = undefined; // Force re-login on other devices
    account.isOnline = false;
    await account.save();

    return {
      message: 'Password updated successfully.',
    };
  }

  async getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const account = await Account.findOne({ userId });
    if (!account) {
      throw ApiError.notFound('Account record not found');
    }

    return sanitizeUser(user, account);
  }

  checkPasswordStrength(
    password: string,
    userInputs: string[] = []
  ): PasswordStrengthResult {
    return evaluatePasswordStrength(password, userInputs);
  }
}

export const authService = new AuthService();
