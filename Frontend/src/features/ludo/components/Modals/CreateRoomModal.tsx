import React, { useState } from 'react';
import { soundFX } from '../../../../shared/utils/soundEffects';
import { X, Users, Zap, Shield, ArrowRight } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: { gameMode: 'CLASSIC' | 'QUICK'; maxPlayers: 2 | 4 }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [gameMode, setGameMode] = useState<'CLASSIC' | 'QUICK'>('QUICK');
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    onCreate({ gameMode, maxPlayers });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl p-6">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-zinc-100">Create Private Room</h3>
        <p className="text-xs text-zinc-400 mt-1">Configure your match settings and invite friends</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Game Mode Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Game Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setGameMode('QUICK');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === 'QUICK'
                    ? 'border-ludo-blue bg-surface-3 shadow-md'
                    : 'border-border-subtle bg-surface-2 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-100">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Quick Mode
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">1 token to win (~3-5 mins)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setGameMode('CLASSIC');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === 'CLASSIC'
                    ? 'border-ludo-blue bg-surface-3 shadow-md'
                    : 'border-border-subtle bg-surface-2 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-100">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Classic Mode
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">All 4 tokens to win</div>
              </button>
            </div>
          </div>

          {/* Player Count */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Player Count</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setMaxPlayers(2);
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  maxPlayers === 2
                    ? 'border-ludo-blue bg-surface-3 shadow-md text-zinc-100 font-bold'
                    : 'border-border-subtle bg-surface-2 text-zinc-400 hover:border-zinc-600'
                } text-xs`}
              >
                <Users className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
                2 Players (1v1)
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setMaxPlayers(4);
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  maxPlayers === 4
                    ? 'border-ludo-blue bg-surface-3 shadow-md text-zinc-100 font-bold'
                    : 'border-border-subtle bg-surface-2 text-zinc-400 hover:border-zinc-600'
                } text-xs`}
              >
                <Users className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
                4 Players (Full Arena)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors mt-2"
          >
            Create & Enter Lobby
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
