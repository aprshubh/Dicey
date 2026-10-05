import { LudoGameState, PlayerGameState, TokenState } from './ludo.types';
import { LudoTokenHelper } from './ludo.token';
import { LudoBoardHelper } from './ludo.board';

export class LudoBot {
  /**
   * Intelligently selects the best token to move using strategic heuristics
   */
  static selectBestMove(
    state: LudoGameState,
    botPlayer: PlayerGameState,
    validTokenIds: number[]
  ): number {
    if (validTokenIds.length === 0) {
      throw new Error('No valid tokens available for Bot move');
    }

    if (validTokenIds.length === 1) {
      return validTokenIds[0];
    }

    const diceValue = state.diceValue!;
    let bestTokenId = validTokenIds[0];
    let highestScore = -Infinity;

    for (const tokenId of validTokenIds) {
      const token = botPlayer.tokens[tokenId];
      const simulatedToken = LudoTokenHelper.applyMove(token, diceValue);
      let score = 0;

      // 1. Capture Opponent (Highest priority: +1000)
      const collision = LudoBoardHelper.checkCollision(simulatedToken, state.players);
      if (collision.capturedPlayerId) {
        score += 1000;
      }

      // 2. Reaching Home (Winning/advancing win condition: +500)
      if (simulatedToken.state === 'HOME') {
        score += 500;
      }

      // 3. Entering Safe Corridor (Protected from captures: +300)
      if (simulatedToken.state === 'CORRIDOR' && token.state === 'TRACK') {
        score += 300;
      }

      // 4. Landing on a Safe/Star Square (+250)
      if (
        simulatedToken.state === 'TRACK' &&
        simulatedToken.commonSquare !== null &&
        LudoBoardHelper.isSafeSquare(simulatedToken.commonSquare)
      ) {
        score += 250;
      }

      // 5. Unlocking a new token from Base (+200)
      if (token.state === 'BASE' && simulatedToken.state === 'TRACK') {
        // If bot already has 2 or more active tokens on track, prefer moving existing tokens
        const activeTokens = botPlayer.tokens.filter((t) => t.state === 'TRACK').length;
        score += activeTokens >= 2 ? 100 : 200;
      }

      // 6. Escape Danger: If current position is vulnerable and moving escapes it (+150)
      if (token.state === 'TRACK' && token.commonSquare !== null) {
        const isCurrentlySafe = LudoBoardHelper.isSafeSquare(token.commonSquare);
        if (!isCurrentlySafe) {
          // If an opponent is 1-6 squares behind
          const hasThreat = this.hasOpponentBehind(token, state.players);
          if (hasThreat) {
            score += 150;
          }
        }
      }

      // 7. General Progress Bonus (Prefer advancing tokens that are further ahead)
      score += simulatedToken.step * 2;

      if (score > highestScore) {
        highestScore = score;
        bestTokenId = tokenId;
      }
    }

    return bestTokenId;
  }

  /**
   * Checks if an opponent token is within striking distance (1-6 squares behind)
   */
  private static hasOpponentBehind(token: TokenState, players: PlayerGameState[]): boolean {
    if (token.commonSquare === null) return false;

    for (const player of players) {
      if (player.color === token.color) continue;

      for (const opToken of player.tokens) {
        if (opToken.state === 'TRACK' && opToken.commonSquare !== null) {
          // Calculate distance behind
          const distance = (token.commonSquare - opToken.commonSquare + 52) % 52;
          if (distance >= 1 && distance <= 6) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
