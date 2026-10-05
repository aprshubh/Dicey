import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginPayload, RegisterPayload, VerifyOtpPayload, UpdateProfilePayload } from '../types/auth.types';
import { authApi } from '../services/auth.api';
import { tokenStorage } from '../../../shared/utils/tokenStorage';
import { socketService } from '../../../shared/socket/socketClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(tokenStorage.getUser<User>());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      const u = (res as any)?.data?.user || (res as any)?.data;
      if (u && (u.id || u._id || u.email)) {
        setUser(u);
        tokenStorage.setUser(u);
        socketService.reconnectWithToken(token);
      } else {
        tokenStorage.clear();
        setUser(null);
      }
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res: any = await authApi.login(payload);
    if (res?.data) {
      const { user: u, accessToken, refreshToken } = res.data;
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      tokenStorage.setUser(u);
      setUser(u);
      socketService.reconnectWithToken(accessToken);
    }
  };

  const register = async (payload: RegisterPayload): Promise<string> => {
    const res: any = await authApi.register(payload);
    return res?.data?.email || payload.email;
  };

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    const res: any = await authApi.verifyOtp(payload);
    if (res?.data) {
      const { user: u, accessToken, refreshToken } = res.data;
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      tokenStorage.setUser(u);
      setUser(u);
      socketService.reconnectWithToken(accessToken);
    }
  };

  const resendOtp = async (email: string) => {
    await authApi.resendOtp(email);
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.warn('Logout API call error:', err);
      }
    }
    tokenStorage.clear();
    socketService.disconnect();
    setUser(null);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const res: any = await authApi.updateProfile(payload);
    if (res?.data?.user) {
      setUser(res.data.user);
      tokenStorage.setUser(res.data.user);
    }
  };

  const refreshMe = async () => {
    const res: any = await authApi.getMe();
    if (res?.data?.user) {
      setUser(res.data.user);
      tokenStorage.setUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateProfile,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
