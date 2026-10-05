import React from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { soundFX } from '../utils/soundEffects';
import { Users, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenFriends: () => void;
  activeMatchCode?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenFriends,
  activeMatchCode,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [audioEnabled, setAudioEnabled] = React.useState(soundFX.enabled);

  const toggleAudio = () => {
    soundFX.enabled = !soundFX.enabled;
    setAudioEnabled(soundFX.enabled);
    soundFX.playClick();
  };

  return (
    <header className="sticky top-0 z-30 w-full px-3 sm:px-6 pt-3 pb-1">
      <nav className="max-w-7xl mx-auto h-16 rounded-2xl bg-[#0e0f12]/85 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
        {/* Brand: 3D Logo Photo + Clean Name (Zero box borders, pure floating luxury) */}
        <div className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-black/60 flex-shrink-0 group-hover:scale-105 transition-all duration-300">
            <img
              src="/logo-option1.jpg"
              alt="Dicey Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-baseline tracking-tight">
            <span className="text-xl sm:text-2xl font-black text-white tracking-[-0.03em] drop-shadow-sm font-sans group-hover:text-sky-300 transition-colors">
              Dicey
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[9px] font-mono font-medium tracking-widest uppercase text-zinc-400 bg-white/[0.04] rounded-full">
              LUDO
            </span>
          </div>
        </div>

        {/* Center: Clean Navigation Links (Stitch Design) */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => soundFX.playClick()}
            className="relative px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <span>Arena</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              if (isAuthenticated) onOpenProfile();
              else onOpenAuth('login');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Leaderboard
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              if (isAuthenticated) onOpenFriends();
              else onOpenAuth('login');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Squad
          </button>
        </div>

        {/* Right Controls: Audio, Friends, Auth/Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            onClick={toggleAudio}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] active:scale-95 transition-all duration-200"
            title={audioEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Friends Drawer Button */}
          {isAuthenticated && (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenFriends();
              }}
              className="h-9 px-3 rounded-xl flex items-center gap-2 text-zinc-300 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all duration-200 text-xs font-semibold"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Friends</span>
            </button>
          )}

          {/* User Profile or Auth triggers */}
          {isAuthenticated && user ? (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenProfile();
              }}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
            >
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`
                }
                alt=""
                className="w-7 h-7 rounded-lg bg-surface-3 object-cover shadow-sm"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-zinc-200 leading-none">{user.name}</div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenAuth('login');
                }}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenAuth('register');
                }}
                className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-100 font-bold rounded-xl text-xs sm:text-sm shadow-[0_0_20px_rgba(255,255,255,0.18)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-200 active:scale-95"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
