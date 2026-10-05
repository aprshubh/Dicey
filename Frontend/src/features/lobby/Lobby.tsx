import React from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { soundFX } from '../../shared/utils/soundEffects';
import {
  Zap,
  Shield,
  Users,
  PlusCircle,
  LogIn,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface LobbyProps {
  onFindMatch: (maxPlayers: 2 | 4) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenFriends: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onFindMatch,
  onCreateRoom,
  onJoinRoom,
  onOpenFriends,
  onOpenProfile,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();

  const handleQuickPlay = (players: 2 | 4) => {
    soundFX.playClick();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    onFindMatch(players);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
      {/* HERO SECTION */}
      <div className="relative rounded-2xl bg-surface-1 border border-border-subtle p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border-subtle text-xs font-semibold text-ludo-blue mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Live Multiplayer Ludo
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Play Ludo Online <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400">
              With Friends & Players
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            Roll the dice, race your tokens, capture opponents, and reach home first. Play quick 1v1
            matches or full 4-player battles anytime with real-time multiplayer.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleQuickPlay(2)}
              className="py-3 px-6 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Quick Match (1v1)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleQuickPlay(4)}
              className="py-3 px-6 bg-surface-2 hover:bg-surface-3 text-zinc-100 font-semibold rounded-xl text-sm border border-border-subtle flex items-center gap-2 transition-all active:scale-98"
            >
              <Users className="w-4 h-4 text-ludo-blue" />
              4-Player Match
            </button>
          </div>
        </div>

        {/* Subtle ambient lighting */}
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 rounded-full bg-zinc-800/10 blur-3xl pointer-events-none" />
      </div>

      {/* GAME MODES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Game Modes</h2>
          <span className="text-xs text-zinc-400">Choose how you want to play</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 1v1 Quick Duel */}
          <div
            onClick={() => handleQuickPlay(2)}
            className="group p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-zinc-500 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">1v1 Quick Match</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                First token to reach home wins. Fast 3-minute game!
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Play Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: 4-Player Classic */}
          <div
            onClick={() => handleQuickPlay(4)}
            className="group p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-zinc-500 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">4-Player Classic</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Full 4-token traditional Ludo match with all safe zones.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Find Match</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Create Private Room */}
          <div
            onClick={() => {
              soundFX.playClick();
              if (!isAuthenticated) onOpenAuth();
              else onCreateRoom();
            }}
            className="group p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-zinc-500 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">Create Private Room</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Create a custom match and invite your friends with a code.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-sky-400">
              <span>Create Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Join by Code */}
          <div
            onClick={() => {
              soundFX.playClick();
              if (!isAuthenticated) onOpenAuth();
              else onJoinRoom();
            }}
            className="group p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-zinc-500 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <LogIn className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">Join With Code</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Have a 6-letter room code from a friend? Enter here.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Enter Code</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* USER STATS & REAL GAME RULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Real User Profile & Stats */}
        <div className="md:col-span-1 rounded-2xl bg-surface-1 border border-border-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Your Profile
              </span>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onOpenProfile();
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Edit Profile &rarr;
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onOpenAuth();
                  }}
                  className="text-xs text-ludo-blue hover:underline font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`
                    }
                    alt=""
                    className="w-12 h-12 rounded-xl bg-surface-2 p-0.5 object-cover border border-border-subtle"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-base text-zinc-100 truncate">{user.name}</div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400 leading-relaxed">
                Create an account or sign in to join custom matches and play with friends.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              onClick={() => {
                soundFX.playClick();
                if (!isAuthenticated) onOpenAuth();
                else onOpenFriends();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-border-subtle"
            >
              <Users className="w-4 h-4 text-ludo-blue" />
              Friends List & Invites
            </button>
          </div>
        </div>

        {/* Right: How To Play / Ludo Rules (Helpful & Real for Players) */}
        <div className="md:col-span-2 rounded-2xl bg-surface-1 border border-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-sm text-zinc-100">How to Play & Game Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-2 border border-border-subtle">
              <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <span>🎲 Rolling a Six</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Roll a 6 to release a token from your base or move 6 steps forward. A 6 gives you an extra roll! (Rolling three 6s in a row forfeits your turn).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2 border border-border-subtle">
              <div className="font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                <span>⚔️ Capturing (Katti)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Land on an opponent's token to send it back to their base! Capturing gives you a bonus dice roll.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2 border border-border-subtle">
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>⭐ Safe Squares</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Cells marked with a Star (⭐) and starting cells are safe zones. Opponents cannot capture your token while on safe squares.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2 border border-border-subtle">
              <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <span>🏠 Home Run to Win</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                In <strong>Quick Mode</strong>, the first player to get 1 token home wins. In <strong>Classic Mode</strong>, get all 4 tokens home to win!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
