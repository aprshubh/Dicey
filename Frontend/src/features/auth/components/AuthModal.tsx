import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../../../shared/utils/soundEffects';
import { X, Mail, Lock, User as UserIcon, ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, verifyOtp, resendOtp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setError(null);
    setIsLoading(true);

    try {
      await register({ name, email, password });
      setMode('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await verifyOtp({ email, otp: otpCode });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    soundFX.playClick();
    setError(null);
    try {
      await resendOtp(email);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-surface-2"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-subtle p-1 flex items-center justify-center overflow-hidden">
              <img src="/dicey-logo.svg" alt="Dicey Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-100">Dicey</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'otp' && 'Verify your email'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {mode === 'login' && 'Sign in to play Ludo with friends'}
            {mode === 'register' && 'Sign up to start playing online'}
            {mode === 'otp' && `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-2 border border-border-subtle focus:border-zinc-400 focus:outline-none rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-2 border border-border-subtle focus:border-zinc-400 focus:outline-none rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-zinc-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setMode('register');
                  setError(null);
                }}
                className="text-zinc-200 hover:underline font-medium"
              >
                Create one
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Display Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Your player name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-2 border border-border-subtle focus:border-zinc-400 focus:outline-none rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-2 border border-border-subtle focus:border-zinc-400 focus:outline-none rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password <span className="text-zinc-500">(min 8 chars, 1 upper, 1 num)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-2 border border-border-subtle focus:border-zinc-400 focus:outline-none rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-zinc-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setMode('login');
                  setError(null);
                }}
                className="text-zinc-200 hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* MODE: OTP VERIFICATION */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-border-subtle focus:border-ludo-blue focus:ring-1 focus:ring-ludo-blue focus:outline-none rounded-lg text-zinc-100 transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-2.5 px-4 bg-ludo-blue hover:bg-sky-400 text-zinc-950 font-semibold rounded-lg text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Enter Game
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="hover:text-zinc-200 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-ludo-blue hover:underline disabled:text-zinc-500 disabled:no-underline font-medium"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
