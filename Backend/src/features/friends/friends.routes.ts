import { Router } from 'express';
import * as friendsController from './friends.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import {
  recipientParamSchema,
  requestIdParamSchema,
  friendIdParamSchema,
  targetUserParamSchema,
  paginationQuerySchema,
  searchUsersQuerySchema,
} from './friends.validation';

const router = Router();

// All friends endpoints require user authentication
router.use(authenticate);

// 1. Friend Management & Listing
router.get('/', validateRequest({ query: paginationQuerySchema }), friendsController.getFriendsList);
router.get('/search', validateRequest({ query: searchUsersQuerySchema }), friendsController.searchUsers);
router.delete('/remove/:friendId', validateRequest({ params: friendIdParamSchema }), friendsController.removeFriend);

// 2. Friend Requests (Send, Accept, Reject, Cancel)
router.post('/request/:recipientId', validateRequest({ params: recipientParamSchema }), friendsController.sendFriendRequest);
router.post('/accept/:requestId', validateRequest({ params: requestIdParamSchema }), friendsController.acceptFriendRequest);
router.post('/reject/:requestId', validateRequest({ params: requestIdParamSchema }), friendsController.rejectFriendRequest);
router.post('/cancel/:requestId', validateRequest({ params: requestIdParamSchema }), friendsController.cancelFriendRequest);

// 3. Requests Lists
router.get('/requests/received', validateRequest({ query: paginationQuerySchema }), friendsController.getReceivedRequests);
router.get('/requests/sent', validateRequest({ query: paginationQuerySchema }), friendsController.getSentRequests);

// 4. Block / Unblock System
router.post('/block/:targetUserId', validateRequest({ params: targetUserParamSchema }), friendsController.blockUser);
router.post('/unblock/:targetUserId', validateRequest({ params: targetUserParamSchema }), friendsController.unblockUser);
router.get('/blocked', validateRequest({ query: paginationQuerySchema }), friendsController.getBlockedUsers);

export default router;
