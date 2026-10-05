import React from 'react';
import { Player, PlayerColor } from '../../types/ludo.types';
import { Bot, User as UserIcon, Home, Clock } from 'lucide-react';

interface PlayerPodProps {
  player: Player;
  isActiveTurn: boolean;
  timeRemaining?: number; // 0 to 20
  isMe?: boolean;
}

const COLOR_ACCENTS: Record<
  PlayerColor,
  {
    border: string;
    text: string;
    bgMuted: string;
    activeRing: string;
  }
> = {
  RED: {
    border: 'border-rose-500/60',
    text: 'text-rose-400',
    bgMuted: 'bg-rose-950/20',
    activeRing: 'ring-rose-500/40',
  },
  GREEN: {
    border: 'border-emerald-500/60',
    text: 'text-emerald-400',
    bgMuted: 'bg-emerald-950/20',
    activeRing: 'ring-emerald-500/40',
  },
  YELLOW: {
    border: 'border-amber-500/60',
    text: 'text-amber-400',
    bgMuted: 'bg-amber-950/20',
    activeRing: 'ring-amber-500/40',
  },
  BLUE: {
    border: 'border-sky-500/60',
    text: 'text-sky-400',
    bgMuted: 'bg-sky-950/20',
    activeRing: 'ring-sky-500/40',
  },
};

export const PlayerPod: React.FC<PlayerPodProps> = ({
  player,
  isActiveTurn,
  timeRemaining = 20,
  isMe = false,
}) => {
  const accent = COLOR_ACCENTS[player.color];
  const finishedTokens = (player.tokens || []).filter((t) => t.stepCount >= 56).length;
  const totalTokens = player.tokens?.length || 4;

  // Percentage of 20 seconds
  const timerPercent = Math.max(0, Math.min(100, (timeRemaining / 20) * 100));

  let timerColor = 'bg-emerald-500';
  if (timerPercent < 50) timerColor = 'bg-amber-500';
  if (timerPercent < 25) timerColor = 'bg-rose-500';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-surface-2 transition-all duration-200 ${
        isActiveTurn
          ? `${accent.border} ring-2 ${accent.activeRing} shadow-lg scale-[1.01]`
          : 'border-border-subtle opacity-85'
      }`}
    >
      <div className="p-3 flex items-center justify-between gap-3">
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={
                player.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`
              }
              alt=""
              className="w-10 h-10 rounded-lg bg-surface-3 p-0.5 object-cover border border-border-subtle"
            />
            {player.isBot ? (
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-[9px] text-zinc-300 font-mono flex items-center gap-0.5">
                <Bot className="w-2.5 h-2.5 text-amber-400" />
              </span>
            ) : (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface-2 ${
                  player.isConnected ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100 truncate max-w-[110px]">
                {player.name}
              </span>
              {isMe && (
                <span className="px-1.5 py-0.2 rounded bg-surface-3 text-[9px] font-mono text-zinc-300">
                  YOU
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-mono font-semibold ${accent.text}`}>
                {player.color}
              </span>
              <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 font-mono">
                <Home className="w-2.5 h-2.5" />
                {finishedTokens}/{totalTokens}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Turn status & Timer */}
        {isActiveTurn ? (
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-200">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="tabular-nums">{Math.ceil(timeRemaining)}s</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-medium animate-pulse">
              Active Turn
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {/* 4 mini token progress dots */}
            {(player.tokens || []).map((t, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full border border-border-subtle ${
                  t.stepCount >= 56
                    ? 'bg-amber-400'
                    : t.stepCount >= 0
                    ? 'bg-zinc-300'
                    : 'bg-zinc-700'
                }`}
                title={`Token ${idx + 1}: ${
                  t.stepCount >= 56 ? 'Home' : t.stepCount >= 0 ? 'On Track' : 'In Base'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Linear countdown bar when active */}
      {isActiveTurn && (
        <div className="w-full h-1 bg-surface-3 overflow-hidden">
          <div
            className={`h-full ${timerColor} transition-all duration-300 ease-linear`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
