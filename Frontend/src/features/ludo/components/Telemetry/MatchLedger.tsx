import React, { useState, useRef, useEffect } from 'react';
import { GameLogEntry, PlayerColor } from '../../types/ludo.types';
import { soundFX } from '../../../../shared/utils/soundEffects';
import { Send, Smile, ScrollText } from 'lucide-react';

interface MatchLedgerProps {
  logs: GameLogEntry[];
  onSendEmote: (emoji: string) => void;
  onSendMessage?: (text: string) => void;
}

const PRESET_EMOJIS = ['👏', '🎲', '🔥', '💀', '⏱️', '🎯', '😂', '🎉'];

export const MatchLedger: React.FC<MatchLedgerProps> = ({
  logs,
  onSendEmote,
  onSendMessage,
}) => {
  const [chatInput, setChatInput] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    soundFX.playClick();
    if (onSendMessage) {
      onSendMessage(chatInput.trim());
    } else {
      onSendEmote(chatInput.trim());
    }
    setChatInput('');
  };

  const handleEmoteClick = (emoji: string) => {
    soundFX.playClick();
    onSendEmote(emoji);
  };

  return (
    <div className="flex flex-col h-full bg-surface-2 border border-border-subtle rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-1">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200">Game Moves & Chat</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">Live Moves</span>
      </div>

      {/* Log Feed */}
      <div
        ref={logContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs font-mono max-h-48 sm:max-h-60"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-600 text-center py-6 text-[11px]">
            Match started. Awaiting opening roll...
          </div>
        ) : (
          logs.map((log) => {
            let textColor = 'text-zinc-300';
            if (log.type === 'capture') textColor = 'text-rose-400 font-bold';
            if (log.type === 'roll') textColor = 'text-amber-300';
            if (log.type === 'chat') textColor = 'text-sky-300';

            return (
              <div
                key={log.id}
                className="flex items-start gap-1.5 py-0.5 leading-relaxed hover:bg-surface-3/40 rounded px-1 -mx-1"
              >
                <span className="text-[10px] text-zinc-500 flex-shrink-0">{log.timestamp}</span>
                <span className={`break-words ${textColor}`}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Emotes Bar */}
      <div className="p-2 border-t border-border-subtle bg-surface-1 flex items-center justify-between gap-1 overflow-x-auto">
        {PRESET_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleEmoteClick(emoji)}
            className="p-1.5 text-sm hover:scale-125 hover:bg-surface-2 rounded-lg transition-transform"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendChat} className="p-2 border-t border-border-subtle bg-surface-2 flex gap-1.5">
        <input
          type="text"
          placeholder="Send quick message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          maxLength={60}
          className="flex-1 bg-surface-1 border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
        />
        <button
          type="submit"
          className="p-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
