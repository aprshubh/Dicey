import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState, PlayerColor } from '../../types/ludo.types';
import { soundFX } from '../../../../shared/utils/soundEffects';
import { Trophy, ArrowRight, RotateCcw, Medal } from 'lucide-react';

interface VictoryModalProps {
  gameState: GameState;
  onBackToLobby: () => void;
  onPlayAgain?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  onBackToLobby,
  onPlayAgain,
}) => {
  useEffect(() => {
    soundFX.playWin();

    // Trigger celebratory confetti
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e11d48', '#10b981', '#f59e0b', '#0ea5e9'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e11d48', '#10b981', '#f59e0b', '#0ea5e9'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const winners = gameState.winners || [];
  const primaryWinner = winners[0];
  const winnerPlayer = gameState.players.find(
    (p) => p.userId === primaryWinner?.userId || p.color === primaryWinner?.color
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center">
        {/* Crown Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
          Victory Achieved!
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          {gameState.gameMode === 'QUICK' ? 'Quick Mode 1-Token Blitz' : 'Classic 4-Token Showdown'}
        </p>

        {/* Primary Winner Showcase */}
        {winnerPlayer && (
          <div className="mt-5 p-4 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center gap-3">
            <img
              src={
                winnerPlayer.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerPlayer.name}`
              }
              alt=""
              className="w-12 h-12 rounded-xl bg-surface-3 p-1 object-cover border border-amber-500/40"
            />
            <div className="text-left">
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                1st Place Champion
              </div>
              <div className="text-base font-bold text-zinc-100">{winnerPlayer.name}</div>
              <div className="text-xs text-zinc-400 font-mono">House {winnerPlayer.color}</div>
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <div className="mt-5 space-y-2 text-left">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Final Standings
          </div>
          {winners.map((w, idx) => {
            const p = gameState.players.find(
              (player) => player.userId === w.userId || player.color === w.color
            );
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/60 border border-border-subtle text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-400 w-4">#{idx + 1}</span>
                  <span className="font-semibold text-zinc-200">{p?.name || w.color}</span>
                </div>
                <span className="font-mono text-xs text-zinc-400">{w.color}</span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              soundFX.playClick();
              onBackToLobby();
            }}
            className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
