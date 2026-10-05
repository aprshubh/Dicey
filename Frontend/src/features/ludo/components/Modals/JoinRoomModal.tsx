import React, { useState } from 'react';
import { soundFX } from '../../../../shared/utils/soundEffects';
import { X, LogIn, ArrowRight } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    soundFX.playClick();
    onJoin(code.trim().toUpperCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl p-6">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-zinc-100">Join Match</h3>
        <p className="text-xs text-zinc-400 mt-1">Enter the 6-character room code from your friend</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Room Code</label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="e.g. LDK78P"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full text-center tracking-widest font-mono text-lg font-bold bg-surface-2 border border-border-subtle rounded-xl py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            Enter Room
          </button>
        </form>
      </div>
    </div>
  );
};
