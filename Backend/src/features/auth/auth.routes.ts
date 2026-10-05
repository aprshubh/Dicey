import { Router } from 'express';
import * as authController from './auth.controller';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { authLimiter } from '../../shared/middlewares/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  checkPasswordStrengthSchema,
} from './auth.validation';

const router = Router();

// Public Authentication Endpoints (Rate-limited)
router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  authController.register
);

router.post(
  '/verify-email',
  authLimiter,
  validateRequest({ body: verifyEmailSchema }),
  authController.verifyEmail
);

router.post(
  '/verify-otp',
  authLimiter,
  validateRequest({ body: verifyEmailSchema }),
  authController.verifyEmail
);

router.post(
  '/resend-otp',
  authLimiter,
  validateRequest({ body: resendOtpSchema }),
  authController.resendVerificationOtp
);

router.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

router.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword
);

router.post(
  '/password-strength',
  authLimiter,
  validateRequest({ body: checkPasswordStrengthSchema }),
  authController.checkPasswordStrength
);

// Protected Authentication Endpoints
router.post('/logout', authenticate, authController.logout);

router.post(
  '/change-password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  authController.changePassword
);

router.get('/me', authenticate, authController.getMe);

export default router;
