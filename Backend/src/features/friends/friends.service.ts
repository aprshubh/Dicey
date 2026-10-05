import { Types } from 'mongoose';
import { Friendship, getCanonicalPair } from './friends.model';
import { User, Account } from '../auth/auth.model';
import { ApiError } from '../../shared/errors/apiError';
import {
  PaginationQuery,
  FriendProfile,
  FriendRequestItem,
  SearchUserResult,
} from './friends.interface';

class FriendsService {
  /**
   * Send a friend request to another user
   */
  async sendFriendRequest(requesterId: string, recipientId: string): Promise<{ message: string }> {
    if (requesterId === recipientId) {
      throw ApiError.badRequest('You cannot send a friend request to yourself');
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      throw ApiError.notFound('Recipient user not found');
    }

    const { userA, userB } = getCanonicalPair(requesterId, recipientId);
    const existingFriendship = await Friendship.findOne({ userA, userB });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        throw ApiError.conflict('You are already friends with this user');
      }

      if (existingFriendship.status === 'blocked') {
        if (existingFriendship.actionUserId.toString() === requesterId) {
          throw ApiError.badRequest('You have blocked this user. Unblock them first to send a friend request.');
        }
        // Don't leak to requester that recipient blocked them
        throw ApiError.badRequest('Unable to send friend request to this user');
      }

      if (existingFriendship.status === 'pending') {
        if (existingFriendship.requester.toString() === requesterId) {
          throw ApiError.conflict('Friend request has already been sent to this user');
        } else {
          throw ApiError.conflict('This user has already sent you a friend request. Please accept their request.');
        }
      }

      if (existingFriendship.status === 'rejected') {
        // Allow re-sending friend request
        existingFriendship.status = 'pending';
        existingFriendship.requester = new Types.ObjectId(requesterId);
        existingFriendship.recipient = new Types.ObjectId(recipientId);
        existingFriendship.actionUserId = new Types.ObjectId(requesterId);
        await existingFriendship.save();
        return { message: 'Friend request sent successfully' };
      }
    }

    // Create new pending friendship
    await Friendship.create({
      userA,
      userB,
      requester: new Types.ObjectId(requesterId),
      recipient: new Types.ObjectId(recipientId),
      status: 'pending',
      actionUserId: new Types.ObjectId(requesterId),
    });

    return { message: 'Friend request sent successfully' };
  }

  /**
   * Accept an incoming friend request
   */
  async acceptFriendRequest(userId: string, requestId: string): Promise<{ message: string }> {
    const friendship = await Friendship.findById(requestId);

    if (!friendship) {
      throw ApiError.notFound('Friend request not found');
    }

    if (friendship.recipient.toString() !== userId) {
      throw ApiError.forbidden('You are not authorized to accept this friend request');
    }

    if (friendship.status === 'accepted') {
      throw ApiError.badRequest('Friend request is already accepted');
    }

    if (friendship.status !== 'pending') {
      throw ApiError.badRequest('This friend request is no longer pending');
    }

    friendship.status = 'accepted';
    friendship.actionUserId = new Types.ObjectId(userId);
    await friendship.save();

    return { message: 'Friend request accepted successfully' };
  }

  /**
   * Reject an incoming friend request
   */
  async rejectFriendRequest(userId: string, requestId: string): Promise<{ message: string }> {
    const friendship = await Friendship.findById(requestId);

    if (!friendship) {
      throw ApiError.notFound('Friend request not found');
    }

    if (friendship.recipient.toString() !== userId) {
      throw ApiError.forbidden('You are not authorized to reject this friend request');
    }

    if (friendship.status !== 'pending') {
      throw ApiError.badRequest('This friend request is no longer pending');
    }

    await friendship.deleteOne();

    return { message: 'Friend request rejected' };
  }

  /**
   * Cancel an outgoing friend request
   */
  async cancelFriendRequest(userId: string, requestId: string): Promise<{ message: string }> {
    const friendship = await Friendship.findById(requestId);

    if (!friendship) {
      throw ApiError.notFound('Friend request not found');
    }

    if (friendship.requester.toString() !== userId) {
      throw ApiError.forbidden('You are only authorized to cancel requests sent by yourself');
    }

    if (friendship.status !== 'pending') {
      throw ApiError.badRequest('Cannot cancel request as it is no longer pending');
    }

    await friendship.deleteOne();

    return { message: 'Friend request cancelled successfully' };
  }

  /**
   * Remove an existing friend
   */
  async removeFriend(userId: string, friendId: string): Promise<{ message: string }> {
    const { userA, userB } = getCanonicalPair(userId, friendId);

    const friendship = await Friendship.findOne({
      userA,
      userB,
      status: 'accepted',
    });

    if (!friendship) {
      throw ApiError.notFound('Friendship not found or user is not in your friends list');
    }

    await friendship.deleteOne();

    return { message: 'Friend removed successfully' };
  }

  /**
   * Get all accepted friends with online status & pagination
   */
  async getFriendsList(
    userId: string,
    query: PaginationQuery
  ): Promise<{ friends: FriendProfile[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const userObjectId = new Types.ObjectId(userId);

    // 1. Find all accepted friendships involving this user
    const friendships = await Friendship.find({
      $or: [{ userA: userObjectId }, { userB: userObjectId }],
      status: 'accepted',
    })
      .sort({ updatedAt: -1 })
      .lean();

    const friendIds = friendships.map((f) =>
      f.userA.equals(userObjectId) ? f.userB : f.userA
    );

    if (friendIds.length === 0) {
      return { friends: [], total: 0, page, limit };
    }

    // 2. Build User query (with optional name/email search)
    const userFilter: Record<string, unknown> = {
      _id: { $in: friendIds },
    };

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      userFilter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(userFilter);
    const users = await User.find(userFilter)
      .skip(skip)
      .limit(limit)
      .lean();

    // 3. Look up Account state (isOnline, lastActive) for each friend
    const accounts = await Account.find({
      userId: { $in: users.map((u) => u._id) },
    }).lean();

    const accountMap = new Map<string, { isOnline: boolean; lastActive?: Date }>();
    accounts.forEach((acc) => {
      accountMap.set(acc.userId.toString(), {
        isOnline: acc.isOnline,
        lastActive: acc.lastActive,
      });
    });

    // 4. Map friendship established timestamp
    const friendshipMap = new Map<string, Date>();
    friendships.forEach((f) => {
      const fid = f.userA.equals(userObjectId) ? f.userB.toString() : f.userA.toString();
      friendshipMap.set(fid, f.updatedAt);
    });

    const friends: FriendProfile[] = users.map((u) => {
      const uId = u._id.toString();
      const accountData = accountMap.get(uId);

      return {
        id: uId,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        isOnline: accountData ? accountData.isOnline : false,
        lastActive: accountData?.lastActive,
        friendsSince: friendshipMap.get(uId),
      };
    });

    return { friends, total, page, limit };
  }

  /**
   * Get pending received friend requests
   */
  async getReceivedRequests(
    userId: string,
    query: PaginationQuery
  ): Promise<{ requests: FriendRequestItem[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      recipient: new Types.ObjectId(userId),
      status: 'pending' as const,
    };

    const total = await Friendship.countDocuments(filter);
    const friendships = await Friendship.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const requesterUserIds = friendships.map((f) => f.requester);
    const users = await User.find({ _id: { $in: requesterUserIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const accounts = await Account.find({ userId: { $in: requesterUserIds } }).lean();
    const accountMap = new Map(accounts.map((acc) => [acc.userId.toString(), acc.isOnline]));

    const requests: FriendRequestItem[] = friendships.map((f) => {
      const reqId = f.requester.toString();
      const requester = userMap.get(reqId);

      return {
        requestId: f._id.toString(),
        user: {
          id: reqId,
          name: requester ? requester.name : 'Unknown User',
          email: requester ? requester.email : '',
          avatar: requester ? requester.avatar : undefined,
          isOnline: accountMap.get(reqId) || false,
        },
        sentAt: f.createdAt,
      };
    });

    return { requests, total, page, limit };
  }

  /**
   * Get pending sent friend requests
   */
  async getSentRequests(
    userId: string,
    query: PaginationQuery
  ): Promise<{ requests: FriendRequestItem[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      requester: new Types.ObjectId(userId),
      status: 'pending' as const,
    };

    const total = await Friendship.countDocuments(filter);
    const friendships = await Friendship.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const recipientUserIds = friendships.map((f) => f.recipient);
    const users = await User.find({ _id: { $in: recipientUserIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const accounts = await Account.find({ userId: { $in: recipientUserIds } }).lean();
    const accountMap = new Map(accounts.map((acc) => [acc.userId.toString(), acc.isOnline]));

    const requests: FriendRequestItem[] = friendships.map((f) => {
      const recId = f.recipient.toString();
      const recipient = userMap.get(recId);

      return {
        requestId: f._id.toString(),
        user: {
          id: recId,
          name: recipient ? recipient.name : 'Unknown User',
          email: recipient ? recipient.email : '',
          avatar: recipient ? recipient.avatar : undefined,
          isOnline: accountMap.get(recId) || false,
        },
        sentAt: f.createdAt,
      };
    });

    return { requests, total, page, limit };
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, targetUserId: string): Promise<{ message: string }> {
    if (userId === targetUserId) {
      throw ApiError.badRequest('You cannot block yourself');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw ApiError.notFound('Target user to block not found');
    }

    const { userA, userB } = getCanonicalPair(userId, targetUserId);

    await Friendship.findOneAndUpdate(
      { userA, userB },
      {
        $set: {
          userA,
          userB,
          requester: new Types.ObjectId(userId),
          recipient: new Types.ObjectId(targetUserId),
          status: 'blocked',
          actionUserId: new Types.ObjectId(userId),
        },
      },
      { upsert: true, new: true }
    );

    return { message: 'User blocked successfully' };
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, targetUserId: string): Promise<{ message: string }> {
    const { userA, userB } = getCanonicalPair(userId, targetUserId);

    const friendship = await Friendship.findOne({
      userA,
      userB,
      status: 'blocked',
      actionUserId: new Types.ObjectId(userId),
    });

    if (!friendship) {
      throw ApiError.badRequest('This user is not blocked by you');
    }

    await friendship.deleteOne();

    return { message: 'User unblocked successfully' };
  }

  /**
   * Get all users blocked by the logged-in user
   */
  async getBlockedUsers(
    userId: string,
    query: PaginationQuery
  ): Promise<{ blockedUsers: FriendProfile[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      status: 'blocked' as const,
      actionUserId: new Types.ObjectId(userId),
    };

    const total = await Friendship.countDocuments(filter);
    const friendships = await Friendship.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const userObjectId = new Types.ObjectId(userId);
    const targetIds = friendships.map((f) =>
      f.userA.equals(userObjectId) ? f.userB : f.userA
    );

    const users = await User.find({ _id: { $in: targetIds } }).lean();

    const blockedUsers: FriendProfile[] = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      isOnline: false,
    }));

    return { blockedUsers, total, page, limit };
  }

  /**
   * Search users by name/email with their current friendship relationship status
   */
  async searchUsers(
    userId: string,
    searchQuery: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ results: SearchUserResult[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchQuery, 'i');
    const userObjectId = new Types.ObjectId(userId);

    const userFilter = {
      _id: { $ne: userObjectId },
      $or: [{ name: searchRegex }, { email: searchRegex }],
    };

    const total = await User.countDocuments(userFilter);
    const users = await User.find(userFilter)
      .skip(skip)
      .limit(limit)
      .lean();

    if (users.length === 0) {
      return { results: [], total: 0, page, limit };
    }

    // Fetch accounts for online status
    const accounts = await Account.find({
      userId: { $in: users.map((u) => u._id) },
    }).lean();

    const onlineMap = new Map<string, boolean>();
    accounts.forEach((acc) => onlineMap.set(acc.userId.toString(), acc.isOnline));

    // Fetch friendships between current user and found users
    const matchedUserIds = users.map((u) => u._id);
    const friendships = await Friendship.find({
      $or: [
        { userA: userObjectId, userB: { $in: matchedUserIds } },
        { userB: userObjectId, userA: { $in: matchedUserIds } },
      ],
    }).lean();

    const friendshipMap = new Map<string, (typeof friendships)[0]>();
    friendships.forEach((f) => {
      const otherId = f.userA.equals(userObjectId) ? f.userB.toString() : f.userA.toString();
      friendshipMap.set(otherId, f);
    });

    const results: SearchUserResult[] = users.map((u) => {
      const uId = u._id.toString();
      const rel = friendshipMap.get(uId);

      let relationshipStatus: SearchUserResult['relationshipStatus'] = 'none';

      if (rel) {
        if (rel.status === 'accepted') {
          relationshipStatus = 'friends';
        } else if (rel.status === 'pending') {
          relationshipStatus = rel.requester.equals(userObjectId)
            ? 'request_sent'
            : 'request_received';
        } else if (rel.status === 'blocked') {
          relationshipStatus = rel.actionUserId.equals(userObjectId)
            ? 'blocked'
            : 'blocked_by';
        }
      }

      return {
        id: uId,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        relationshipStatus,
        isOnline: onlineMap.get(uId) || false,
      };
    });

    return { results, total, page, limit };
  }
}

export const friendsService = new FriendsService();
