import { apiClient } from '../../../shared/utils/apiClient';
import { LoginPayload, RegisterPayload, VerifyOtpPayload, UpdateProfilePayload, User } from '../types/auth.types';

export const authApi = {
  async register(payload: RegisterPayload) {
    return apiClient.post<{ success: boolean; message: string; data: { email: string } }>(
      '/auth/register',
      payload
    );
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: { user: User; accessToken: string; refreshToken: string };
    }>('/auth/verify-otp', payload);
  },

  async resendOtp(email: string) {
    return apiClient.post<{ success: boolean; message: string }>('/auth/resend-otp', { email });
  },

  async login(payload: LoginPayload) {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: { user: User; accessToken: string; refreshToken: string };
    }>('/auth/login', payload);
  },

  async logout(refreshToken: string) {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout', { refreshToken });
  },

  async getMe() {
    return apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
  },

  async updateProfile(payload: UpdateProfilePayload) {
    return apiClient.patch<{ success: boolean; data: { user: User } }>('/auth/profile', payload);
  },
};
