export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';
export type GameMode = 'CLASSIC' | 'QUICK';

export const PLAYER_COLORS: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const BOARD_CONSTANTS = {
  TOTAL_COMMON_SQUARES: 52,
  HOME_CORRIDOR_LENGTH: 5,
  FINAL_HOME_STEP: 56, // Step 0 is start, 0..50 common track, 51..55 corridor, 56 is Home
  TOKENS_PER_PLAYER: 4,
  MAX_CONSECUTIVE_SIXES: 3,
  TOKENS_TO_WIN_CLASSIC: 4,
  TOKENS_TO_WIN_QUICK: 1, // Quick mode: first player to get 1 token into Home wins!
} as const;

export const COLOR_START_SQUARES: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

// Common track squares that are safe from captures (8 traditional squares)
export const SAFE_SQUARES: readonly number[] = [
  0,  // Red Start
  8,  // Red Star
  13, // Green Start
  21, // Green Star
  26, // Yellow Start
  34, // Yellow Star
  39, // Blue Start
  47, // Blue Star
] as const;
