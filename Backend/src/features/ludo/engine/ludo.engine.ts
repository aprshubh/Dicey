import crypto from 'crypto';
import {
  PlayerColor,
  PLAYER_COLORS,
  BOARD_CONSTANTS,
  GameMode,
} from './ludo.constants';
import {
  LudoGameState,
  PlayerGameState,
  RollResult,
  MoveResult,
} from './ludo.types';
import { LudoTokenHelper } from './ludo.token';
import { LudoBoardHelper } from './ludo.board';
import { ApiError } from '../../../shared/errors/apiError';

export class LudoEngine {
  /**
   * Initializes a brand new game state
   */
  static createGame(
    roomCode: string,
    playersData: { userId: string; name: string; isBot?: boolean }[],
    gameMode: GameMode = 'CLASSIC'
  ): LudoGameState {
    if (playersData.length < 2 || playersData.length > 4) {
      throw ApiError.badRequest('Ludo requires 2 to 4 players');
    }

    // Color assignments: 2 players get opposite colors (RED & YELLOW)
    let assignedColors: PlayerColor[];
    if (playersData.length === 2) {
      assignedColors = ['RED', 'YELLOW'];
    } else {
      assignedColors = PLAYER_COLORS.slice(0, playersData.length);
    }

    const players: PlayerGameState[] = playersData.map((p, index) => {
      const color = assignedColors[index];
      return {
        userId: p.userId,
        name: p.name,
        color,
        tokens: LudoTokenHelper.createInitialTokens(color),
        hasFinished: false,
        consecutiveSixes: 0,
        isBot: p.isBot || false,
      };
    });

    return {
      roomCode,
      gameMode,
      status: 'PLAYING',
      players,
      currentTurnIndex: 0,
      currentTurnColor: players[0].color,
      diceValue: null,
      hasRolledDice: false,
      validMoveTokenIds: [],
      lastActionMessage: `Game started (${gameMode} Mode)! It is ${players[0].name}'s (${players[0].color}) turn.`,
      winners: [],
      updatedAt: new Date(),
    };
  }

  /**
   * Generates a cryptographically secure dice roll from 1 to 6
   */
  static generateDiceValue(): number {
    return crypto.randomInt(1, 7);
  }

  /**
   * Processes a dice roll for the current active player
   */
  static rollDice(
    state: LudoGameState,
    requestingUserId: string,
    forcedRoll?: number
  ): RollResult {
    if (state.status !== 'PLAYING') {
      throw ApiError.badRequest(`Game is not in PLAYING state (current: ${state.status})`);
    }

    const currentPlayer = state.players[state.currentTurnIndex];
    if (currentPlayer.userId !== requestingUserId) {
      throw ApiError.forbidden(`It is not your turn. Current turn: ${currentPlayer.color} (${currentPlayer.name})`);
    }

    if (state.hasRolledDice) {
      throw ApiError.badRequest('You have already rolled the dice. Please select a token to move.');
    }

    const diceValue = forcedRoll && forcedRoll >= 1 && forcedRoll <= 6
      ? forcedRoll
      : this.generateDiceValue();

    state.diceValue = diceValue;

    // Rule: Handle consecutive sixes
    if (diceValue === 6) {
      currentPlayer.consecutiveSixes += 1;
      if (currentPlayer.consecutiveSixes >= BOARD_CONSTANTS.MAX_CONSECUTIVE_SIXES) {
        // Penalty: 3 consecutive 6s forfeit the turn immediately
        currentPlayer.consecutiveSixes = 0;
        state.hasRolledDice = false;
        state.diceValue = null;
        state.validMoveTokenIds = [];
        this.advanceTurn(state);

        const message = `${currentPlayer.name} rolled 3 consecutive sixes! Turn forfeited.`;
        state.lastActionMessage = message;

        return {
          diceValue,
          validMoves: [],
          consecutiveSixes: 3,
          turnPassed: true,
          bonusTurn: false,
          message,
        };
      }
    } else {
      currentPlayer.consecutiveSixes = 0;
    }

    // Determine legal moves
    const validMoves: number[] = [];
    currentPlayer.tokens.forEach((token) => {
      if (LudoTokenHelper.canMove(token, diceValue)) {
        validMoves.push(token.tokenId);
      }
    });

    state.validMoveTokenIds = validMoves;

    // If no moves are possible, turn passes automatically
    if (validMoves.length === 0) {
      state.hasRolledDice = false;
      state.diceValue = null;
      state.validMoveTokenIds = [];
      this.advanceTurn(state);

      const message = `${currentPlayer.name} rolled a ${diceValue}. No valid moves available. Turn passed.`;
      state.lastActionMessage = message;

      return {
        diceValue,
        validMoves: [],
        consecutiveSixes: currentPlayer.consecutiveSixes,
        turnPassed: true,
        bonusTurn: false,
        message,
      };
    }

    state.hasRolledDice = true;
    const message = `${currentPlayer.name} rolled a ${diceValue}! Select a token to move.`;
    state.lastActionMessage = message;

    return {
      diceValue,
      validMoves,
      consecutiveSixes: currentPlayer.consecutiveSixes,
      turnPassed: false,
      bonusTurn: diceValue === 6,
      message,
    };
  }

  /**
   * Executes a token movement using the currently rolled dice value
   */
  static moveToken(
    state: LudoGameState,
    requestingUserId: string,
    tokenId: number
  ): MoveResult {
    if (state.status !== 'PLAYING') {
      throw ApiError.badRequest('Game is not active');
    }

    const currentPlayer = state.players[state.currentTurnIndex];
    if (currentPlayer.userId !== requestingUserId) {
      throw ApiError.forbidden(`It is not your turn. Current turn: ${currentPlayer.color}`);
    }

    if (!state.hasRolledDice || state.diceValue === null) {
      throw ApiError.badRequest('You must roll the dice before moving a token');
    }

    if (!state.validMoveTokenIds.includes(tokenId)) {
      throw ApiError.badRequest(`Token ${tokenId} cannot be legally moved with rolled dice (${state.diceValue})`);
    }

    const token = currentPlayer.tokens.find((t) => t.tokenId === tokenId);
    if (!token) {
      throw ApiError.notFound(`Token with id ${tokenId} not found`);
    }

    // 1. Move Token
    const updatedToken = LudoTokenHelper.applyMove(token, state.diceValue);
    currentPlayer.tokens[tokenId] = updatedToken;

    let bonusTurn = false;
    let bonusReason: MoveResult['bonusReason'];

    // 2. Check Collisions (Katti / Capture)
    const collision = LudoBoardHelper.checkCollision(updatedToken, state.players);
    let capturedTokenData: MoveResult['capturedToken'];

    if (collision.capturedPlayerId && collision.capturedToken && collision.capturedTokenId !== undefined) {
      const opponentPlayer = state.players.find((p) => p.userId === collision.capturedPlayerId);
      if (opponentPlayer) {
        opponentPlayer.tokens[collision.capturedTokenId] = collision.capturedToken;
        capturedTokenData = {
          userId: collision.capturedPlayerId,
          color: opponentPlayer.color,
          tokenId: collision.capturedTokenId,
        };
        bonusTurn = true;
        bonusReason = 'CAPTURED_OPPONENT';
      }
    }

    // 3. Check if reached Home
    const reachedHome = updatedToken.state === 'HOME';
    if (reachedHome && !bonusTurn) {
      bonusTurn = true;
      bonusReason = 'REACHED_HOME';
    }

    // 4. Check if 6 was rolled
    if (state.diceValue === 6 && !bonusTurn) {
      bonusTurn = true;
      bonusReason = 'ROLLED_SIX';
    }

    // 5. Check if current player has met victory conditions based on gameMode
    const tokensInHome = currentPlayer.tokens.filter((t) => t.state === 'HOME').length;
    const tokensNeededToWin =
      state.gameMode === 'QUICK'
        ? BOARD_CONSTANTS.TOKENS_TO_WIN_QUICK
        : BOARD_CONSTANTS.TOKENS_TO_WIN_CLASSIC;

    const hasWon = tokensInHome >= tokensNeededToWin;
    if (hasWon && !currentPlayer.hasFinished) {
      currentPlayer.hasFinished = true;
      const rank = state.winners.length + 1;
      currentPlayer.rank = rank;
      state.winners.push({
        userId: currentPlayer.userId,
        color: currentPlayer.color,
        rank,
      });
    }

    // 6. Check game termination condition
    // Game ends when only 1 active player remains (e.g. 1st, 2nd, 3rd decided)
    const remainingActivePlayers = state.players.filter((p) => !p.hasFinished);
    let gameFinished = false;

    if (remainingActivePlayers.length <= 1) {
      state.status = 'FINISHED';
      gameFinished = true;
      if (remainingActivePlayers.length === 1) {
        const lastPlayer = remainingActivePlayers[0];
        lastPlayer.hasFinished = true;
        lastPlayer.rank = state.winners.length + 1;
        state.winners.push({
          userId: lastPlayer.userId,
          color: lastPlayer.color,
          rank: lastPlayer.rank,
        });
      }
      state.lastActionMessage = `Game Finished! Winner: ${state.winners[0]?.color}`;
    }

    // 7. Reset roll state for next action
    state.hasRolledDice = false;
    state.diceValue = null;
    state.validMoveTokenIds = [];

    // 8. Turn management
    if (!gameFinished) {
      if (bonusTurn && !currentPlayer.hasFinished) {
        state.lastActionMessage = `${currentPlayer.name} moved token ${tokenId} and earned a bonus turn (${bonusReason})!`;
      } else {
        this.advanceTurn(state);
        const nextPlayer = state.players[state.currentTurnIndex];
        state.lastActionMessage = `${currentPlayer.name} moved token ${tokenId}. It is now ${nextPlayer.name}'s (${nextPlayer.color}) turn.`;
      }
    }

    state.updatedAt = new Date();

    return {
      success: true,
      movedToken: updatedToken,
      capturedToken: capturedTokenData,
      reachedHome,
      bonusTurn: bonusTurn && !currentPlayer.hasFinished,
      bonusReason,
      nextTurnColor: state.currentTurnColor,
      gameFinished,
      message: state.lastActionMessage,
    };
  }

  /**
   * Advances the turn in a circular fashion, skipping players who have already finished
   */
  static advanceTurn(state: LudoGameState): PlayerColor {
    const totalPlayers = state.players.length;
    let nextIndex = (state.currentTurnIndex + 1) % totalPlayers;

    // Loop until we find a player who has not finished
    let attempts = 0;
    while (state.players[nextIndex].hasFinished && attempts < totalPlayers) {
      nextIndex = (nextIndex + 1) % totalPlayers;
      attempts++;
    }

    state.currentTurnIndex = nextIndex;
    state.currentTurnColor = state.players[nextIndex].color;
    state.hasRolledDice = false;
    state.diceValue = null;
    state.validMoveTokenIds = [];

    return state.currentTurnColor;
  }
}
