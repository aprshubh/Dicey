import { apiClient } from '../../../shared/utils/apiClient';
import { Friend, FriendRequest, FriendUser } from '../types/friends.types';

export const friendsApi = {
  async getFriends() {
    return apiClient.get<{ success: boolean; data: { friends: Friend[] } }>('/friends');
  },

  async getPendingRequests() {
    return apiClient.get<{ success: boolean; data: { requests: FriendRequest[] } }>('/friends/requests');
  },

  async sendFriendRequest(targetUserId: string) {
    return apiClient.post<{ success: boolean; message: string }>('/friends/request', {
      recipientId: targetUserId,
    });
  },

  async acceptRequest(requestId: string) {
    return apiClient.post<{ success: boolean; message: string }>(`/friends/request/${requestId}/accept`);
  },

  async declineRequest(requestId: string) {
    return apiClient.post<{ success: boolean; message: string }>(`/friends/request/${requestId}/decline`);
  },

  async removeFriend(friendshipId: string) {
    return apiClient.delete<{ success: boolean; message: string }>(`/friends/${friendshipId}`);
  },

  async searchUsers(query: string) {
    return apiClient.get<{ success: boolean; data: { users: FriendUser[] } }>(`/friends/search?q=${encodeURIComponent(query)}`);
  },
};
