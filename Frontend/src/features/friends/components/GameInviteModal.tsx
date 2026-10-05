import React from 'react';
import { GameInvitePayload } from '../types/friends.types';
import { soundFX } from '../../../shared/utils/soundEffects';
import { Gamepad2, Check, X } from 'lucide-react';

interface GameInviteModalProps {
  invite: GameInvitePayload | null;
  onAccept: (roomCode: string) => void;
  onDecline: (roomCode: string, fromUserId: string) => void;
}

export const GameInviteModal: React.FC<GameInviteModalProps> = ({
  invite,
  onAccept,
  onDecline,
}) => {
  if (!invite) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="w-80 bg-surface-1 border border-ludo-blue/40 rounded-2xl shadow-2xl p-4 bg-gradient-to-b from-surface-2 to-surface-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-ludo-blue/20 border border-ludo-blue/30 flex items-center justify-center text-ludo-blue flex-shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>{invite.fromName}</span>
              <span className="text-[10px] text-zinc-500">• now</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Invited you to a{' '}
              <span className="text-amber-400 font-semibold">{invite.gameMode || 'Ludo'}</span> match!
            </p>
            <div className="mt-1 text-[11px] font-mono text-zinc-500">
              Room: <span className="text-zinc-300 font-semibold">{invite.roomCode}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              onAccept(invite.roomCode);
            }}
            className="flex-1 py-1.5 px-3 bg-ludo-blue hover:bg-sky-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Accept
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              onDecline(invite.roomCode, invite.fromUserId);
            }}
            className="py-1.5 px-3 bg-surface-2 hover:bg-surface-3 text-zinc-400 hover:text-zinc-200 border border-border-subtle rounded-lg text-xs flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
