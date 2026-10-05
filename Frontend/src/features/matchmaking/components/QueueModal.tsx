import React, { useState, useEffect } from 'react';
import { soundFX } from '../../../shared/utils/soundEffects';
import { Loader2, Users, X, Bot, ShieldCheck } from 'lucide-react';

interface QueueModalProps {
  isOpen: boolean;
  maxPlayers: 2 | 4;
  onCancel: () => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  maxPlayers,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl p-6 text-center">
        {/* Animated Radar Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-ludo-blue/20 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-ludo-blue animate-spin" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-100">Finding Opponents</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Searching for competitive {maxPlayers === 2 ? '1v1' : '4-Player'} match
        </p>

        {/* Counter */}
        <div className="my-5 p-3 rounded-xl bg-surface-2 border border-border-subtle inline-block min-w-[140px]">
          <div className="text-2xl font-mono font-bold text-zinc-100 tabular-nums">
            {formatTime(seconds)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
            Queue Elapsed
          </div>
        </div>

        {/* Smart Bot Fallback Indicator */}
        <div className="p-3 bg-surface-2/60 border border-border-subtle rounded-xl text-left flex items-start gap-2.5 mb-5">
          <Bot className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-zinc-200 font-semibold">Instant Match Guarantee:</span> If
            human players aren't found within 15 seconds, smart AI Bots will seamlessly join.
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            onCancel();
          }}
          className="w-full py-2.5 px-4 bg-surface-2 hover:bg-surface-3 text-zinc-300 hover:text-zinc-100 border border-border-subtle font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel Search
        </button>
      </div>
    </div>
  );
};
