import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { HttpStatus } from '../../shared/constants/httpStatus';
import { env } from '../../shared/config/env.config';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
};

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  // 15 minutes for access token cookie
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // 7 days for refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', {
    ...cookieOptions,
    path: '/api/v1/auth',
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result.message, { email: result.email });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.body);
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  return ApiResponse.success(res, 'Email verified successfully. Welcome to Dicey!', result);
});

export const resendVerificationOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendVerificationOtp(req.body);
  return ApiResponse.success(res, result.message);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  return ApiResponse.success(res, 'Logged in successfully', result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Extract refresh token from cookie or request body
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const newTokens = await authService.refreshTokens(incomingRefreshToken);
  setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);
  return ApiResponse.success(res, 'Token refreshed successfully', newTokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.id) {
    await authService.logout(req.user.id);
  }
  clearAuthCookies(res);
  return ApiResponse.success(res, 'Logged out successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);
  return ApiResponse.success(res, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  clearAuthCookies(res);
  return ApiResponse.success(res, result.message);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await authService.changePassword(userId, req.body);
  clearAuthCookies(res);
  return ApiResponse.success(res, result.message);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const profile = await authService.getCurrentUser(userId);
  return ApiResponse.success(res, 'User profile fetched successfully', {
    user: profile,
    ...profile,
  });
});

export const checkPasswordStrength = asyncHandler(async (req: Request, res: Response) => {
  const { password, userInputs } = req.body;
  const evaluation = authService.checkPasswordStrength(password, userInputs);
  return ApiResponse.success(
    res,
    'Password strength evaluated successfully',
    evaluation
  );
});
