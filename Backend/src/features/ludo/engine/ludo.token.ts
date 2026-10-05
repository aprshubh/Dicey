import {
  PlayerColor,
  BOARD_CONSTANTS,
  COLOR_START_SQUARES,
} from './ludo.constants';
import { TokenState, TokenLocationState } from './ludo.types';

export class LudoTokenHelper {
  /**
   * Initializes 4 base tokens for a given player color
   */
  static createInitialTokens(color: PlayerColor): TokenState[] {
    return Array.from({ length: BOARD_CONSTANTS.TOKENS_PER_PLAYER }, (_, i) => ({
      tokenId: i,
      color,
      step: -1, // -1 denotes Yard / Base
      state: 'BASE',
      commonSquare: null,
      corridorStep: null,
    }));
  }

  /**
   * Calculates board coordinates from relative step count
   */
  static resolvePosition(
    color: PlayerColor,
    step: number
  ): {
    state: TokenLocationState;
    commonSquare: number | null;
    corridorStep: number | null;
  } {
    if (step === -1) {
      return { state: 'BASE', commonSquare: null, corridorStep: null };
    }

    if (step >= 0 && step <= 50) {
      const startSquare = COLOR_START_SQUARES[color];
      const commonSquare = (startSquare + step) % BOARD_CONSTANTS.TOTAL_COMMON_SQUARES;
      return { state: 'TRACK', commonSquare, corridorStep: null };
    }

    if (step >= 51 && step <= 55) {
      const corridorStep = step - 50; // 1 to 5
      return { state: 'CORRIDOR', commonSquare: null, corridorStep };
    }

    if (step === BOARD_CONSTANTS.FINAL_HOME_STEP) {
      return { state: 'HOME', commonSquare: null, corridorStep: null };
    }

    throw new Error(`Invalid token step: ${step}`);
  }

  /**
   * Checks whether a specific token can legally move with the given dice roll
   */
  static canMove(token: TokenState, diceValue: number): boolean {
    // 1. Finished tokens cannot move
    if (token.state === 'HOME' || token.step === BOARD_CONSTANTS.FINAL_HOME_STEP) {
      return false;
    }

    // 2. Tokens in Base can ONLY be unlocked with a 6
    if (token.state === 'BASE' || token.step === -1) {
      return diceValue === 6;
    }

    // 3. Tokens on Track or Corridor cannot overshoot the final Home spot (56)
    const targetStep = token.step + diceValue;
    return targetStep <= BOARD_CONSTANTS.FINAL_HOME_STEP;
  }

  /**
   * Computes the new TokenState after applying the dice roll
   */
  static applyMove(token: TokenState, diceValue: number): TokenState {
    if (!this.canMove(token, diceValue)) {
      throw new Error(`Token ${token.tokenId} (${token.color}) cannot move with roll ${diceValue}`);
    }

    let targetStep: number;

    if (token.state === 'BASE') {
      targetStep = 0; // Unlocked onto starting square
    } else {
      targetStep = token.step + diceValue;
    }

    const { state, commonSquare, corridorStep } = this.resolvePosition(token.color, targetStep);

    return {
      ...token,
      step: targetStep,
      state,
      commonSquare,
      corridorStep,
    };
  }
}
