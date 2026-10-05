import { Request, Response } from 'express';
import { friendsService } from './friends.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const recipientId = req.params.recipientId as string;
  const result = await friendsService.sendFriendRequest(userId, recipientId);
  return ApiResponse.success(res, result.message);
});

export const acceptFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requestId = req.params.requestId as string;
  const result = await friendsService.acceptFriendRequest(userId, requestId);
  return ApiResponse.success(res, result.message);
});

export const rejectFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requestId = req.params.requestId as string;
  const result = await friendsService.rejectFriendRequest(userId, requestId);
  return ApiResponse.success(res, result.message);
});

export const cancelFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requestId = req.params.requestId as string;
  const result = await friendsService.cancelFriendRequest(userId, requestId);
  return ApiResponse.success(res, result.message);
});

export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const friendId = req.params.friendId as string;
  const result = await friendsService.removeFriend(userId, friendId);
  return ApiResponse.success(res, result.message);
});

export const getFriendsList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await friendsService.getFriendsList(userId, req.query);
  return ApiResponse.success(res, 'Friends list retrieved successfully', result.friends, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const getReceivedRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await friendsService.getReceivedRequests(userId, req.query);
  return ApiResponse.success(res, 'Received friend requests retrieved', result.requests, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const getSentRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await friendsService.getSentRequests(userId, req.query);
  return ApiResponse.success(res, 'Sent friend requests retrieved', result.requests, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const targetUserId = req.params.targetUserId as string;
  const result = await friendsService.blockUser(userId, targetUserId);
  return ApiResponse.success(res, result.message);
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const targetUserId = req.params.targetUserId as string;
  const result = await friendsService.unblockUser(userId, targetUserId);
  return ApiResponse.success(res, result.message);
});

export const getBlockedUsers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await friendsService.getBlockedUsers(userId, req.query);
  return ApiResponse.success(res, 'Blocked users retrieved successfully', result.blockedUsers, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const queryStr = (req.query.query as string) || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await friendsService.searchUsers(userId, queryStr, page, limit);
  return ApiResponse.success(res, 'Users search results retrieved', result.results, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});
