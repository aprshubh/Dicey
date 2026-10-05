import React from 'react';
import { GameState, PlayerColor } from '../../types/ludo.types';
import {
  getTokenGridPos,
  SAFE_TRACK_INDICES,
  COMMON_TRACK_COORDS,
} from '../../utils/boardCoordinates';
import { TokenPiece } from './TokenPiece';
import { soundFX } from '../../../../shared/utils/soundEffects';
import { Star } from 'lucide-react';

interface LudoBoardProps {
  gameState: GameState;
  myColor: PlayerColor | null;
  isMyTurn: boolean;
  onSelectToken: (tokenId: number) => void;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  myColor,
  isMyTurn,
  onSelectToken,
}) => {
  // Collect all tokens with their resolved grid row/col
  const tokensOnBoard = (gameState.players || []).flatMap((player) =>
    (player.tokens || []).map((token) => {
      const pos = getTokenGridPos(player.color, token.id, token.stepCount);
      const isSelectable =
        isMyTurn &&
        myColor === player.color &&
        (gameState.validMoves || []).includes(token.id);

      return {
        key: `${player.color}-${token.id}`,
        playerColor: player.color,
        tokenId: token.id,
        stepCount: token.stepCount,
        row: pos.row,
        col: pos.col,
        isSelectable,
      };
    })
  );

  // Group tokens by (row, col)
  const tokensByCell: Record<string, typeof tokensOnBoard> = {};
  tokensOnBoard.forEach((t) => {
    const key = `${t.row}-${t.col}`;
    if (!tokensByCell[key]) tokensByCell[key] = [];
    tokensByCell[key].push(t);
  });

  // Helper to determine cell type/styling on the 15x15 grid
  const getCellContent = (row: number, col: number) => {
    // 1. Red Yard (Top Left: rows 0..5, cols 0..5)
    if (row < 6 && col < 6) return null;
    // 2. Green Yard (Top Right: rows 0..5, cols 9..14)
    if (row < 6 && col > 8) return null;
    // 3. Blue Yard (Bottom Left: rows 9..14, cols 0..5)
    if (row > 8 && col < 6) return null;
    // 4. Yellow Yard (Bottom Right: rows 9..14, cols 9..14)
    if (row > 8 && col > 8) return null;

    // 5. Center Winning Apex (rows 6..8, cols 6..8)
    if (row >= 6 && row <= 8 && col >= 6 && col <= 8) return null;

    // Check Home Corridors
    if (row === 7 && col >= 1 && col <= 5) {
      return { isCorridor: true, color: 'RED', label: col };
    }
    if (col === 7 && row >= 1 && row <= 5) {
      return { isCorridor: true, color: 'GREEN', label: row };
    }
    if (row === 7 && col >= 9 && col <= 13) {
      return { isCorridor: true, color: 'YELLOW', label: 14 - col };
    }
    if (col === 7 && row >= 9 && row <= 13) {
      return { isCorridor: true, color: 'BLUE', label: 14 - row };
    }

    // Check Safe Stars
    const trackIndex = COMMON_TRACK_COORDS.findIndex(
      (c) => c.row === row && c.col === col
    );
    const isSafe = trackIndex !== -1 && SAFE_TRACK_INDICES.includes(trackIndex);
    const isStartSquare =
      trackIndex === 0 ? 'RED' :
      trackIndex === 13 ? 'GREEN' :
      trackIndex === 26 ? 'YELLOW' :
      trackIndex === 39 ? 'BLUE' : null;

    return {
      isSafe,
      isStartSquare,
      trackIndex,
    };
  };

  return (
    <div className="relative w-full max-w-[560px] aspect-square bg-[#121215] border border-border-subtle rounded-2xl shadow-2xl p-2 sm:p-3 select-none flex flex-col justify-between">
      {/* 15x15 GRID */}
      <div className="relative w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-border-subtle/80 rounded-xl overflow-hidden p-[1px]">
        {/* CORNER YARDS */}
        {/* Red Yard (Top Left) */}
        <div
          className="col-span-6 row-span-6 bg-rose-950/20 border border-rose-800/40 rounded-tl-xl p-3 flex flex-col justify-between"
          style={{ gridColumn: '1 / 7', gridRow: '1 / 7' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 uppercase">
              Base Rose
            </span>
            <div className="w-2 h-2 rounded-full bg-rose-500/80 animate-pulse" />
          </div>
          <div className="bg-surface-1/80 border border-rose-900/50 rounded-xl p-2.5 grid grid-cols-2 grid-rows-2 gap-2 h-28 place-items-center">
            {[0, 1, 2, 3].map((idx) => {
              const baseToken = tokensOnBoard.find(
                (t) => t.playerColor === 'RED' && t.tokenId === idx && t.stepCount === -1
              );
              return (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-full bg-surface-2 border border-rose-900/40 flex items-center justify-center relative"
                >
                  {baseToken && (
                    <TokenPiece
                      color="RED"
                      tokenId={idx}
                      isSelectable={baseToken.isSelectable}
                      onClick={() => {
                        soundFX.playTokenMove();
                        onSelectToken(idx);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-zinc-500 text-center font-mono">Roll 6 to Unlock</div>
        </div>

        {/* Green Yard (Top Right) */}
        <div
          className="col-span-6 row-span-6 bg-emerald-950/20 border border-emerald-800/40 rounded-tr-xl p-3 flex flex-col justify-between"
          style={{ gridColumn: '10 / 16', gridRow: '1 / 7' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Base Emerald
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
          <div className="bg-surface-1/80 border border-emerald-900/50 rounded-xl p-2.5 grid grid-cols-2 grid-rows-2 gap-2 h-28 place-items-center">
            {[0, 1, 2, 3].map((idx) => {
              const baseToken = tokensOnBoard.find(
                (t) => t.playerColor === 'GREEN' && t.tokenId === idx && t.stepCount === -1
              );
              return (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-full bg-surface-2 border border-emerald-900/40 flex items-center justify-center relative"
                >
                  {baseToken && (
                    <TokenPiece
                      color="GREEN"
                      tokenId={idx}
                      isSelectable={baseToken.isSelectable}
                      onClick={() => {
                        soundFX.playTokenMove();
                        onSelectToken(idx);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-zinc-500 text-center font-mono">Roll 6 to Unlock</div>
        </div>

        {/* Blue Yard (Bottom Left) */}
        <div
          className="col-span-6 row-span-6 bg-sky-950/20 border border-sky-800/40 rounded-bl-xl p-3 flex flex-col justify-between"
          style={{ gridColumn: '1 / 7', gridRow: '10 / 16' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-sky-400 uppercase">
              Base Cyan
            </span>
            <div className="w-2 h-2 rounded-full bg-sky-500/80 animate-pulse" />
          </div>
          <div className="bg-surface-1/80 border border-sky-900/50 rounded-xl p-2.5 grid grid-cols-2 grid-rows-2 gap-2 h-28 place-items-center">
            {[0, 1, 2, 3].map((idx) => {
              const baseToken = tokensOnBoard.find(
                (t) => t.playerColor === 'BLUE' && t.tokenId === idx && t.stepCount === -1
              );
              return (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-full bg-surface-2 border border-sky-900/40 flex items-center justify-center relative"
                >
                  {baseToken && (
                    <TokenPiece
                      color="BLUE"
                      tokenId={idx}
                      isSelectable={baseToken.isSelectable}
                      onClick={() => {
                        soundFX.playTokenMove();
                        onSelectToken(idx);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-zinc-500 text-center font-mono">Roll 6 to Unlock</div>
        </div>

        {/* Yellow Yard (Bottom Right) */}
        <div
          className="col-span-6 row-span-6 bg-amber-950/20 border border-amber-800/40 rounded-br-xl p-3 flex flex-col justify-between"
          style={{ gridColumn: '10 / 16', gridRow: '10 / 16' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">
              Base Gold
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-500/80 animate-pulse" />
          </div>
          <div className="bg-surface-1/80 border border-amber-900/50 rounded-xl p-2.5 grid grid-cols-2 grid-rows-2 gap-2 h-28 place-items-center">
            {[0, 1, 2, 3].map((idx) => {
              const baseToken = tokensOnBoard.find(
                (t) => t.playerColor === 'YELLOW' && t.tokenId === idx && t.stepCount === -1
              );
              return (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-full bg-surface-2 border border-amber-900/40 flex items-center justify-center relative"
                >
                  {baseToken && (
                    <TokenPiece
                      color="YELLOW"
                      tokenId={idx}
                      isSelectable={baseToken.isSelectable}
                      onClick={() => {
                        soundFX.playTokenMove();
                        onSelectToken(idx);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-zinc-500 text-center font-mono">Roll 6 to Unlock</div>
        </div>

        {/* CENTER WINNING TRIANGLE (Apex zone: rows 7..9, cols 7..9 -> 1-based 7 / 10) */}
        <div
          className="relative bg-surface-1 border border-border-subtle rounded-lg overflow-hidden flex items-center justify-center"
          style={{ gridColumn: '7 / 10', gridRow: '7 / 10' }}
        >
          {/* 4 Triangles */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
              backgroundColor: 'rgba(16, 185, 129, 0.25)', // Green
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)',
              backgroundColor: 'rgba(245, 158, 11, 0.25)', // Yellow
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(100% 100%, 0 100%, 50% 50%)',
              backgroundColor: 'rgba(14, 165, 233, 0.25)', // Blue
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 100%, 0 0, 50% 50%)',
              backgroundColor: 'rgba(225, 29, 72, 0.25)', // Red
            }}
          />

          <div className="z-10 w-6 h-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-mono font-bold text-zinc-300">HOME</span>
          </div>

          {/* Tokens currently in home apex */}
          {tokensOnBoard
            .filter((t) => t.stepCount >= 56)
            .map((t) => (
              <div
                key={t.key}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: t.playerColor === 'RED' ? '30%' : t.playerColor === 'YELLOW' ? '70%' : '50%',
                  top: t.playerColor === 'GREEN' ? '30%' : t.playerColor === 'BLUE' ? '70%' : '50%',
                }}
              >
                <TokenPiece color={t.playerColor} tokenId={t.tokenId} size="sm" />
              </div>
            ))}
        </div>

        {/* 15x15 INDIVIDUAL CELLS */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 15 }).map((_, col) => {
            const cellInfo = getCellContent(row, col);
            if (!cellInfo) return null; // Belongs to Yard or Center

            const cellTokens = tokensByCell[`${row}-${col}`] || [];

            let cellBg = 'bg-[#18181b]';
            let cellBorder = 'border-border-subtle';

            if (cellInfo.isCorridor) {
              if (cellInfo.color === 'RED') cellBg = 'bg-rose-950/30';
              if (cellInfo.color === 'GREEN') cellBg = 'bg-emerald-950/30';
              if (cellInfo.color === 'YELLOW') cellBg = 'bg-amber-950/30';
              if (cellInfo.color === 'BLUE') cellBg = 'bg-sky-950/30';
            } else if (cellInfo.isStartSquare) {
              if (cellInfo.isStartSquare === 'RED') cellBg = 'bg-rose-950/40';
              if (cellInfo.isStartSquare === 'GREEN') cellBg = 'bg-emerald-950/40';
              if (cellInfo.isStartSquare === 'YELLOW') cellBg = 'bg-amber-950/40';
              if (cellInfo.isStartSquare === 'BLUE') cellBg = 'bg-sky-950/40';
            }

            return (
              <div
                key={`${row}-${col}`}
                style={{ gridColumn: col + 1, gridRow: row + 1 }}
                className={`relative ${cellBg} border ${cellBorder} flex items-center justify-center overflow-hidden transition-colors`}
              >
                {/* Safe Star Marker */}
                {cellInfo.isSafe && (
                  <Star className="w-2.5 h-2.5 text-zinc-600 fill-zinc-600/40 pointer-events-none" />
                )}

                {/* Render tokens on this cell */}
                {cellTokens.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                    {cellTokens.map((t) => (
                      <TokenPiece
                        key={t.key}
                        color={t.playerColor}
                        tokenId={t.tokenId}
                        isSelectable={t.isSelectable}
                        size={cellTokens.length > 1 ? 'sm' : 'md'}
                        onClick={() => {
                          soundFX.playTokenMove();
                          onSelectToken(t.tokenId);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
