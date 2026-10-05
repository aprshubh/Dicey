import React from 'react';
import { PlayerColor } from '../../types/ludo.types';

interface TokenPieceProps {
  color: PlayerColor;
  tokenId: number;
  isSelectable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const COLOR_CLASSES: Record<
  PlayerColor,
  {
    bg: string;
    border: string;
    shadow: string;
    ring: string;
    innerDot: string;
  }
> = {
  RED: {
    bg: 'bg-rose-600',
    border: 'border-rose-400',
    shadow: 'shadow-[0_2px_8px_rgba(225,29,72,0.4)]',
    ring: 'ring-rose-400',
    innerDot: 'bg-rose-200',
  },
  GREEN: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-400',
    shadow: 'shadow-[0_2px_8px_rgba(16,185,129,0.4)]',
    ring: 'ring-emerald-400',
    innerDot: 'bg-emerald-200',
  },
  YELLOW: {
    bg: 'bg-amber-500',
    border: 'border-amber-300',
    shadow: 'shadow-[0_2px_8px_rgba(245,158,11,0.4)]',
    ring: 'ring-amber-300',
    innerDot: 'bg-amber-100',
  },
  BLUE: {
    bg: 'bg-sky-600',
    border: 'border-sky-400',
    shadow: 'shadow-[0_2px_8px_rgba(14,165,233,0.4)]',
    ring: 'ring-sky-400',
    innerDot: 'bg-sky-200',
  },
};

export const TokenPiece: React.FC<TokenPieceProps> = ({
  color,
  tokenId,
  isSelectable = false,
  onClick,
  size = 'md',
}) => {
  const styles = COLOR_CLASSES[color];

  const sizeClasses = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-6 h-6 sm:w-7 sm:h-7 text-[10px]',
    lg: 'w-8 h-8 sm:w-9 sm:h-9 text-xs',
  }[size];

  return (
    <button
      type="button"
      onClick={isSelectable ? onClick : undefined}
      disabled={!isSelectable}
      className={`relative rounded-full flex items-center justify-center font-bold font-mono transition-all duration-200 z-20 ${sizeClasses} ${
        styles.bg
      } ${styles.border} ${styles.shadow} border-2 ${
        isSelectable
          ? `cursor-pointer ring-2 ${styles.ring} ring-offset-1 ring-offset-surface-1 scale-105 hover:scale-115 animate-pulse`
          : 'cursor-default'
      }`}
      title={`${color} Token #${tokenId + 1}`}
    >
      {/* Inner tactile indentation ring */}
      <span className={`w-2 h-2 rounded-full ${styles.innerDot} opacity-80`} />
    </button>
  );
};
