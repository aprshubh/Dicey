import React, { useState, useEffect } from 'react';
import { GameState, PlayerColor, GameLogEntry } from '../types/ludo.types';
import { LudoBoard } from './Board/LudoBoard';
import { DiceRoller } from './Dice/DiceRoller';
import { PlayerPod } from './Telemetry/PlayerPod';
import { MatchLedger } from './Telemetry/MatchLedger';
import { VictoryModal } from './Modals/VictoryModal';
import { soundFX } from '../../../shared/utils/soundEffects';
import {
  Volume2,
  VolumeX,
  LogOut,
  Copy,
  Check,
  Zap,
  Shield,
  Play,
} from 'lucide-react';

interface ArenaProps {
  gameState: GameState;
  myUserId: string;
  onRollDice: () => void;
  onSelectToken: (tokenId: number) => void;
  onSendEmote: (emoji: string) => void;
  onLeaveMatch: () => void;
  onStartMatch?: () => void;
  logs: GameLogEntry[];
}

export const Arena: React.FC<ArenaProps> = ({
  gameState,
  myUserId,
  onRollDice,
  onSelectToken,
  onSendEmote,
  onLeaveMatch,
  onStartMatch,
  logs,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(soundFX.enabled);
  const [matchElapsed, setMatchElapsed] = useState(0);

  // Match timer clock
  useEffect(() => {
    let interval: any;
    if (gameState.status === 'PLAYING') {
      interval = setInterval(() => {
        setMatchElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const myPlayer = (gameState.players || []).find((p) => p.userId === myUserId);
  const myColor: PlayerColor | null = myPlayer?.color || null;
  const isMyTurn = gameState.status === 'PLAYING' && gameState.currentTurnColor === myColor;
  const canRoll = isMyTurn && (gameState.diceValue === null || gameState.diceValue === undefined);

  const activePlayer = (gameState.players || []).find(
    (p) => p.color === gameState.currentTurnColor
  );

  const handleCopyRoom = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(gameState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAudio = () => {
    soundFX.enabled = !soundFX.enabled;
    setIsAudioEnabled(soundFX.enabled);
    soundFX.playClick();
  };

  const isRoomHost = (gameState.players || [])[0]?.userId === myUserId;
  const canStartMatch =
    gameState.status === 'WAITING' &&
    isRoomHost &&
    (gameState.players || []).length >= 2;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans">
      {/* TOP NAVIGATION BAR */}
      <header className="h-14 bg-background/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand + Room Code */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-black/40 flex-shrink-0">
              <img src="/logo-option1.jpg" alt="Dicey Icon" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans hidden sm:inline">
              Dicey
            </span>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Room Code Badge */}
          <button
            onClick={handleCopyRoom}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border-subtle text-xs font-mono text-zinc-300 transition-colors"
            title="Click to copy room code"
          >
            <span className="text-zinc-500">ROOM:</span>
            <span className="font-bold text-zinc-100">{gameState.roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 border border-border-subtle text-[11px] font-mono text-zinc-400">
            {gameState.gameMode === 'QUICK' ? (
              <>
                <Zap className="w-3 h-3 text-amber-400" /> Quick
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 text-emerald-400" /> Classic
              </>
            )}
          </span>
        </div>

        {/* Center: Live Match Ticker */}
        <div className="flex items-center gap-2">
          {gameState.status === 'WAITING' ? (
            <div className="text-xs font-mono text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Lobby: {(gameState.players || []).length}/{gameState.maxPlayers} Players Ready
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border-subtle text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  gameState.currentTurnColor === 'RED'
                    ? 'bg-rose-500'
                    : gameState.currentTurnColor === 'GREEN'
                    ? 'bg-emerald-500'
                    : gameState.currentTurnColor === 'YELLOW'
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
              />
              <span className="text-zinc-300">
                {activePlayer?.name || gameState.currentTurnColor}'s Turn
              </span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400 tabular-nums">
                {Math.ceil(gameState.turnTimeRemaining || 20)}s
              </span>
            </div>
          )}
        </div>

        {/* Right: Timer, Audio & Leave */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs font-mono text-zinc-400 tabular-nums">
            {formatTimer(matchElapsed)}
          </div>

          <button
            onClick={toggleAudio}
            className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-zinc-400 hover:text-zinc-100 border border-border-subtle transition-colors"
            title={isAudioEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              if (window.confirm('Are you sure you want to forfeit/leave the match?')) {
                onLeaveMatch();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* MAIN BODY: BOARD + SIDEBAR */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* CENTER ARENA (LUDO BOARD) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]">
          {/* Waiting Room overlay banner */}
          {gameState.status === 'WAITING' && (
            <div className="mb-4 p-4 rounded-xl bg-surface-1 border border-border-subtle max-w-md w-full text-center shadow-xl">
              <h3 className="text-sm font-bold text-zinc-100">Waiting for Players to Join</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Share room code <span className="font-mono text-zinc-100 font-bold">{gameState.roomCode}</span> or invite friends.
              </p>
              {canStartMatch && onStartMatch && (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onStartMatch();
                  }}
                  className="mt-3 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  Start Match Now
                </button>
              )}
            </div>
          )}

          {/* 15x15 Interactive Board */}
          <LudoBoard
            gameState={gameState}
            myColor={myColor}
            isMyTurn={isMyTurn}
            onSelectToken={onSelectToken}
          />
        </main>

        {/* RIGHT SIDEBAR: DICE + PLAYERS + CHAT */}
        <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-border-subtle bg-[#121215] flex flex-col justify-between overflow-y-auto divide-y divide-border-subtle z-20">
          {/* Section 1: Active Dice Roll */}
          <div className="p-4 sm:p-5 bg-surface-2/40 flex flex-col items-center justify-center">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-3">
              {isMyTurn ? 'YOUR TURN' : `${activePlayer?.name || 'Opponent'}'s Turn`}
            </div>

            <DiceRoller
              value={gameState.diceValue}
              isRolling={false}
              canRoll={canRoll}
              onRoll={onRollDice}
              consecutiveSixes={gameState.consecutiveSixes}
            />

            {/* Instruction helper */}
            {isMyTurn && gameState.diceValue !== null && gameState.validMoves && gameState.validMoves.length > 0 && (
              <div className="mt-2 text-xs font-mono text-emerald-400 animate-pulse text-center">
                Select an illuminated token on the board to move!
              </div>
            )}
            {isMyTurn && gameState.diceValue !== null && (!gameState.validMoves || gameState.validMoves.length === 0) && (
              <div className="mt-2 text-xs font-mono text-zinc-400 text-center">
                No valid moves available. Passing turn...
              </div>
            )}
          </div>

          {/* Section 2: Players Pod List */}
          <div className="p-4 space-y-2.5">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Players in Game ({(gameState.players || []).length}/{gameState.maxPlayers})
            </div>
            {(gameState.players || []).map((player) => (
              <PlayerPod
                key={player.userId || player.color}
                player={player}
                isActiveTurn={gameState.currentTurnColor === player.color && gameState.status === 'PLAYING'}
                timeRemaining={gameState.turnTimeRemaining}
                isMe={player.userId === myUserId}
              />
            ))}
          </div>

          {/* Section 3: Live Match Ledger & Chat */}
          <div className="p-4 flex-1 flex flex-col justify-between min-h-[220px]">
            <MatchLedger logs={logs} onSendEmote={onSendEmote} />
          </div>
        </aside>
      </div>

      {/* VICTORY MODAL OVERLAY */}
      {gameState.status === 'FINISHED' && (
        <VictoryModal gameState={gameState} onBackToLobby={onLeaveMatch} />
      )}
    </div>
  );
};
