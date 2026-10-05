import React, { useState, useEffect } from 'react';
import { soundFX } from '../../../../shared/utils/soundEffects';
import { Dices } from 'lucide-react';

interface DiceRollerProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  consecutiveSixes?: number;
}

// 3x3 Pip layouts for dice values 1 to 6
const PIP_CONFIGS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export const DiceRoller: React.FC<DiceRollerProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
  consecutiveSixes = 0,
}) => {
  const [internalRolling, setInternalRolling] = useState(false);
  const [displayVal, setDisplayVal] = useState<number>(value || 1);

  useEffect(() => {
    if (value) {
      setDisplayVal(value);
    }
  }, [value]);

  // Spacebar key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canRoll && !isRolling && !internalRolling) {
        e.preventDefault();
        triggerRoll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRoll, isRolling, internalRolling]);

  const triggerRoll = () => {
    if (!canRoll || isRolling || internalRolling) return;
    soundFX.playDiceRoll();
    setInternalRolling(true);

    // Fast pip flicker during tumble
    let flickerCount = 0;
    const interval = setInterval(() => {
      setDisplayVal(Math.floor(Math.random() * 6) + 1);
      flickerCount++;
      if (flickerCount > 6) {
        clearInterval(interval);
        setInternalRolling(false);
        onRoll();
      }
    }, 50);
  };

  const activePips = PIP_CONFIGS[displayVal] || [4];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 3D Tactile Dice Box */}
      <div
        onClick={triggerRoll}
        className={`relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#242428] to-[#161619] border-2 ${
          canRoll
            ? 'border-zinc-300 shadow-[0_8px_25px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] cursor-pointer hover:scale-105 active:scale-95'
            : 'border-zinc-800 opacity-70 cursor-not-allowed shadow-inner'
        } flex items-center justify-center p-3 transition-all duration-150 ${
          isRolling || internalRolling ? 'animate-shake' : ''
        }`}
        title={canRoll ? 'Click or press Spacebar to roll' : 'Waiting for turn'}
      >
        {/* Consecutive sixes badge */}
        {consecutiveSixes > 0 && (
          <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] font-mono shadow-md">
            {consecutiveSixes}x 6!
          </div>
        )}

        {/* 3x3 Pip Subgrid */}
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1 place-items-center">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-full h-full flex items-center justify-center">
              {activePips.includes(i) ? (
                <div className="w-3 h-3 rounded-full bg-zinc-100 shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Button & key hint */}
      <button
        type="button"
        disabled={!canRoll || isRolling || internalRolling}
        onClick={triggerRoll}
        className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all duration-150 ${
          canRoll
            ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-md font-semibold cursor-pointer active:scale-98'
            : 'bg-surface-2 text-zinc-500 border border-border-subtle cursor-not-allowed'
        }`}
      >
        <Dices className="w-4 h-4" />
        <span>Roll Dice</span>
        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
          Space
        </kbd>
      </button>
    </div>
  );
};
