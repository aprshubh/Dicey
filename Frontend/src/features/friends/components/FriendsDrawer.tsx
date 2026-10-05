import React, { useState, useEffect } from 'react';
import { Friend, FriendRequest, FriendUser } from '../types/friends.types';
import { friendsApi } from '../services/friends.api';
import { soundFX } from '../../../shared/utils/soundEffects';
import { X, Users, UserPlus, Search, Check, Ban, Gamepad2 } from 'lucide-react';

interface FriendsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoomCode?: string | null;
  onInviteFriend?: (friendId: string) => void;
}

export const FriendsDrawer: React.FC<FriendsDrawerProps> = ({
  isOpen,
  onClose,
  activeRoomCode,
  onInviteFriend,
}) => {
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, rRes] = await Promise.all([
        friendsApi.getFriends().catch(() => null),
        friendsApi.getPendingRequests().catch(() => null),
      ]);
      if (fRes && (fRes as any).data?.friends) {
        setFriends((fRes as any).data.friends);
      }
      if (rRes && (rRes as any).data?.requests) {
        setRequests((rRes as any).data.requests);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFX.playClick();
    setLoading(true);
    try {
      const res: any = await friendsApi.searchUsers(searchQuery);
      if (res?.data?.users) {
        setSearchResults(res.data.users);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    soundFX.playClick();
    try {
      await friendsApi.sendFriendRequest(userId);
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      alert('Friend request sent!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAccept = async (reqId: string) => {
    soundFX.playClick();
    try {
      await friendsApi.acceptRequest(reqId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (reqId: string) => {
    soundFX.playClick();
    try {
      await friendsApi.declineRequest(reqId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = (friendId: string) => {
    soundFX.playClick();
    if (onInviteFriend) {
      onInviteFriend(friendId);
      setInvitedIds((prev) => [...prev, friendId]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-sm bg-surface-1 border-l border-border-subtle h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-ludo-blue" />
            <h3 className="font-bold text-base text-zinc-100">Friends & Network</h3>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-border-subtle bg-surface-2">
          <button
            onClick={() => {
              soundFX.playClick();
              setTab('friends');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
              tab === 'friends'
                ? 'border-zinc-100 text-zinc-100 bg-surface-1'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setTab('requests');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors relative ${
              tab === 'requests'
                ? 'border-zinc-100 text-zinc-100 bg-surface-1'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setTab('search');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
              tab === 'search'
                ? 'border-zinc-100 text-zinc-100 bg-surface-1'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Add Friend
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: FRIENDS LIST */}
          {tab === 'friends' && (
            <>
              {friends.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No friends added yet. Search players using the 'Add Friend' tab!
                </div>
              ) : (
                friends.map((item) => {
                  const isInvited = invitedIds.includes(item.user.id);
                  return (
                    <div
                      key={item.friendshipId}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border-subtle"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              item.user.avatarUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${item.user.name}`
                            }
                            alt=""
                            className="w-9 h-9 rounded-lg bg-surface-3 p-0.5 object-cover"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface-2 ${
                              item.user.isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-200 truncate max-w-[130px]">
                            {item.user.name}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {item.user.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>

                      {activeRoomCode && onInviteFriend && (
                        <button
                          onClick={() => handleInvite(item.user.id)}
                          disabled={isInvited || !item.user.isOnline}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-3 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-border-subtle transition-colors disabled:opacity-40"
                        >
                          <Gamepad2 className="w-3.5 h-3.5 text-ludo-blue" />
                          {isInvited ? 'Sent' : 'Invite'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: REQUESTS */}
          {tab === 'requests' && (
            <>
              {requests.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No pending friend requests.
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border-subtle"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          req.sender.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${req.sender.name}`
                        }
                        alt=""
                        className="w-8 h-8 rounded-lg bg-surface-3 object-cover"
                      />
                      <div className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                        {req.sender.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="p-1.5 rounded-md bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="p-1.5 rounded-md bg-rose-950/60 border border-rose-700/60 text-rose-300 hover:bg-rose-900 transition-colors"
                        title="Decline"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB 3: SEARCH / ADD */}
          {tab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-2 border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border-subtle"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          user.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`
                        }
                        alt=""
                        className="w-8 h-8 rounded-lg bg-surface-3 object-cover"
                      />
                      <div className="text-xs font-semibold text-zinc-200">{user.name}</div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-3 hover:bg-zinc-700 text-zinc-200 text-xs border border-border-subtle transition-colors"
                    >
                      <UserPlus className="w-3 h-3 text-ludo-blue" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
