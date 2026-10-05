import { PlayerColor } from '../types/ludo.types';

export interface GridPos {
  row: number;
  col: number;
}

// 52 Common Track Squares mapping to 15x15 grid coordinates
export const COMMON_TRACK_COORDS: GridPos[] = [
  /* 0 - Red Start */   { row: 6, col: 1 },
  /* 1 */               { row: 6, col: 2 },
  /* 2 */               { row: 6, col: 3 },
  /* 3 */               { row: 6, col: 4 },
  /* 4 */               { row: 6, col: 5 },
  /* 5 */               { row: 5, col: 6 },
  /* 6 */               { row: 4, col: 6 },
  /* 7 */               { row: 3, col: 6 },
  /* 8 - Safe Star */   { row: 2, col: 6 },
  /* 9 */               { row: 1, col: 6 },
  /* 10 */              { row: 0, col: 6 },
  /* 11 - Top Turn */   { row: 0, col: 7 },
  /* 12 */              { row: 0, col: 8 },
  /* 13 - Green Start */{ row: 1, col: 8 },
  /* 14 */              { row: 2, col: 8 },
  /* 15 */              { row: 3, col: 8 },
  /* 16 */              { row: 4, col: 8 },
  /* 17 */              { row: 5, col: 8 },
  /* 18 */              { row: 6, col: 9 },
  /* 19 */              { row: 6, col: 10 },
  /* 20 */              { row: 6, col: 11 },
  /* 21 - Safe Star */  { row: 6, col: 12 },
  /* 22 */              { row: 6, col: 13 },
  /* 23 */              { row: 6, col: 14 },
  /* 24 - Right Turn */ { row: 7, col: 14 },
  /* 25 */              { row: 8, col: 14 },
  /* 26 - Yellow Start*/{ row: 8, col: 13 },
  /* 27 */              { row: 8, col: 12 },
  /* 28 */              { row: 8, col: 11 },
  /* 29 */              { row: 8, col: 10 },
  /* 30 */              { row: 8, col: 9 },
  /* 31 */              { row: 9, col: 8 },
  /* 32 */              { row: 10, col: 8 },
  /* 33 */              { row: 11, col: 8 },
  /* 34 - Safe Star */  { row: 12, col: 8 },
  /* 35 */              { row: 13, col: 8 },
  /* 36 */              { row: 14, col: 8 },
  /* 37 - Bottom Turn */{ row: 14, col: 7 },
  /* 38 */              { row: 14, col: 6 },
  /* 39 - Blue Start */ { row: 13, col: 6 },
  /* 40 */              { row: 12, col: 6 },
  /* 41 */              { row: 11, col: 6 },
  /* 42 */              { row: 10, col: 6 },
  /* 43 */              { row: 9, col: 6 },
  /* 44 */              { row: 8, col: 5 },
  /* 45 */              { row: 8, col: 4 },
  /* 46 */              { row: 8, col: 3 },
  /* 47 - Safe Star */  { row: 8, col: 2 },
  /* 48 */              { row: 8, col: 1 },
  /* 49 */              { row: 8, col: 0 },
  /* 50 - Left Turn */  { row: 7, col: 0 },
  /* 51 */              { row: 6, col: 0 },
];

export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home corridors (5 steps each: step 1 to step 5)
export const HOME_CORRIDORS: Record<PlayerColor, GridPos[]> = {
  RED: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  GREEN: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  YELLOW: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  BLUE: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
};

// Yard / Base socket positions (4 tokens per color)
export const BASE_SOCKETS: Record<PlayerColor, GridPos[]> = {
  RED: [
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
  ],
  GREEN: [
    { row: 2, col: 11 },
    { row: 2, col: 12 },
    { row: 3, col: 11 },
    { row: 3, col: 12 },
  ],
  YELLOW: [
    { row: 11, col: 11 },
    { row: 11, col: 12 },
    { row: 12, col: 11 },
    { row: 12, col: 12 },
  ],
  BLUE: [
    { row: 11, col: 2 },
    { row: 11, col: 3 },
    { row: 12, col: 2 },
    { row: 12, col: 3 },
  ],
};

// Center Home apex position
export const HOME_APEX_COORDS: Record<PlayerColor, GridPos> = {
  RED: { row: 7, col: 6 },
  GREEN: { row: 6, col: 7 },
  YELLOW: { row: 7, col: 8 },
  BLUE: { row: 8, col: 7 },
};

/**
 * Resolves exact 15x15 row & column for a given token step
 */
export function getTokenGridPos(color: PlayerColor, tokenId: number, step: number): GridPos {
  if (step === -1) {
    return BASE_SOCKETS[color][tokenId];
  }

  if (step >= 0 && step <= 50) {
    const startSquares: Record<PlayerColor, number> = {
      RED: 0,
      GREEN: 13,
      YELLOW: 26,
      BLUE: 39,
    };
    const commonIndex = (startSquares[color] + step) % 52;
    return COMMON_TRACK_COORDS[commonIndex];
  }

  if (step >= 51 && step <= 55) {
    const corridorIdx = step - 51;
    return HOME_CORRIDORS[color][corridorIdx];
  }

  if (step >= 56) {
    return HOME_APEX_COORDS[color];
  }

  return BASE_SOCKETS[color][tokenId];
}
