import { SAFE_SQUARES } from './ludo.constants';
import { TokenState, PlayerGameState } from './ludo.types';
import { LudoTokenHelper } from './ludo.token';

export class LudoBoardHelper {
  /**
   * Checks if a common square index is a designated safe square (starting spots + stars)
   */
  static isSafeSquare(commonSquare: number): boolean {
    return SAFE_SQUARES.includes(commonSquare);
  }

  /**
   * Evaluates if landing on a common track square captures an opponent's token
   */
  static checkCollision(
    movedToken: TokenState,
    players: PlayerGameState[]
  ): {
    capturedPlayerId?: string;
    capturedTokenId?: number;
    capturedToken?: TokenState;
  } {
    // Captures can ONLY occur on common track squares
    if (movedToken.state !== 'TRACK' || movedToken.commonSquare === null) {
      return {};
    }

    // Safe squares (stars and starting positions) are immune from captures
    if (this.isSafeSquare(movedToken.commonSquare)) {
      return {};
    }

    for (const player of players) {
      // Cannot capture your own tokens
      if (player.color === movedToken.color) {
        continue;
      }

      for (const opponentToken of player.tokens) {
        if (
          opponentToken.state === 'TRACK' &&
          opponentToken.commonSquare === movedToken.commonSquare
        ) {
          // Collision detected! Send opponent token back to yard
          const resetToken: TokenState = {
            ...opponentToken,
            step: -1,
            state: 'BASE',
            commonSquare: null,
            corridorStep: null,
          };

          return {
            capturedPlayerId: player.userId,
            capturedTokenId: opponentToken.tokenId,
            capturedToken: resetToken,
          };
        }
      }
    }

    return {};
  }
}
