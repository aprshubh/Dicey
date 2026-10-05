import { Request, Response } from 'express';
import { ludoService } from './ludo.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const room = await ludoService.createRoom(userId, req.body);
  return ApiResponse.created(res, 'Game room created successfully', room);
});

export const joinRoom = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const roomCode = req.params.roomCode as string;
  const room = await ludoService.joinRoom(userId, roomCode);
  return ApiResponse.success(res, 'Joined game room successfully', room);
});

export const startGame = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const roomCode = req.params.roomCode as string;
  const room = await ludoService.startGame(userId, roomCode);
  return ApiResponse.success(res, 'Game started successfully', room);
});

export const rollDice = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const roomCode = req.params.roomCode as string;
  const result = await ludoService.rollDice(userId, roomCode);
  return ApiResponse.success(res, result.rollResult.message, result);
});

export const moveToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const roomCode = req.params.roomCode as string;
  const { tokenId } = req.body;
  const result = await ludoService.moveToken(userId, roomCode, Number(tokenId));
  return ApiResponse.success(res, result.moveResult.message, result);
});

export const getGameState = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const roomCode = req.params.roomCode as string;
  const room = await ludoService.getGameState(userId, roomCode);
  return ApiResponse.success(res, 'Game state retrieved successfully', room);
});

export const leaveRoom = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const roomCode = req.params.roomCode as string;
  const result = await ludoService.leaveRoom(userId, roomCode);
  return ApiResponse.success(res, result.message);
});
