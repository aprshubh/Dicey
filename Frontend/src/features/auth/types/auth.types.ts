export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  eloRating?: number;
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalKills: number;
    winRate?: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
}
