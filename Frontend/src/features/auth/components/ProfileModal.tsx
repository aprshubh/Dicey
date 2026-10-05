import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../../../shared/utils/soundEffects';
import { X, LogOut, Check, Edit2, CheckCircle2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Max',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatarUrl || AVATAR_OPTIONS[0]
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    soundFX.playClick();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), avatarUrl: selectedAvatar });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = async (av: string) => {
    setSelectedAvatar(av);
    soundFX.playClick();
    try {
      await updateProfile({ avatarUrl: av });
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };

  const handleLogout = async () => {
    soundFX.playClick();
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-surface-2"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <h3 className="text-lg font-bold text-zinc-100 mb-6">Player Profile</h3>

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border-subtle mb-6">
          <div className="relative">
            <img
              src={selectedAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-xl bg-surface-3 border border-border-subtle p-1 object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface-3 border border-border-subtle rounded-lg px-2.5 py-1 text-sm text-zinc-100 focus:outline-none focus:border-zinc-400 w-full"
                  maxLength={25}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg transition-colors flex-shrink-0"
                  title="Save name"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-zinc-100 truncate">{user.name}</h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-surface-3 transition-colors"
                  title="Edit name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-400 truncate mt-1">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Player</span>
            </div>
          </div>
        </div>

        {/* Choose Avatar */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Choose Your Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((av, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAvatarSelect(av)}
                className={`aspect-square rounded-xl p-1.5 border transition-all ${
                  selectedAvatar === av
                    ? 'border-white bg-surface-3 scale-105 shadow-md'
                    : 'border-border-subtle hover:border-zinc-500 bg-surface-2'
                }`}
              >
                <img src={av} alt="Avatar option" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex justify-between items-center border-t border-border-subtle">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border-subtle text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
