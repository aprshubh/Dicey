import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { socketService } from './shared/socket/socketClient';
import { Navbar } from './shared/components/Navbar';
import { Lobby } from './features/lobby/Lobby';
import { Arena } from './features/ludo/components/Arena';
import { AuthModal } from './features/auth/components/AuthModal';
import { ProfileModal } from './features/auth/components/ProfileModal';
import { FriendsDrawer } from './features/friends/components/FriendsDrawer';
import { GameInviteModal } from './features/friends/components/GameInviteModal';
import { CreateRoomModal } from './features/ludo/components/Modals/CreateRoomModal';
import { JoinRoomModal } from './features/ludo/components/Modals/JoinRoomModal';
import { QueueModal } from './features/matchmaking/components/QueueModal';
import { GameState, GameLogEntry, PlayerColor } from './features/ludo/types/ludo.types';
import { GameInvitePayload } from './features/friends/types/friends.types';
import { soundFX } from './shared/utils/soundEffects';

type ViewMode = 'LOBBY' | 'ARENA';

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Navigation & Modals
  const [view, setView] = useState<ViewMode>('LOBBY');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFriendsDrawerOpen, setIsFriendsDrawerOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [queuePlayers, setQueuePlayers] = useState<2 | 4>(2);

  // Real-time Match State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [incomingInvite, setIncomingInvite] = useState<GameInvitePayload | null>(null);

  // Turn Countdown Timer
  useEffect(() => {
    let timer: any;
    if (gameState && gameState.status === 'PLAYING' && gameState.turnTimeRemaining > 0) {
      timer = setInterval(() => {
        setGameState((prev) => {
          if (!prev || prev.status !== 'PLAYING') return prev;
          const next = Math.max(0, prev.turnTimeRemaining - 1);
          return { ...prev, turnTimeRemaining: next };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState?.status, gameState?.turnTimeRemaining]);

  // WebSocket Event Listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Matchmaking events
    socket.on('matchmaking_searching', (data) => {
      setIsQueueModalOpen(true);
    });

    socket.on('matchmaking_cancelled', () => {
      setIsQueueModalOpen(false);
    });

    socket.on('match_found', (data: { roomCode: string; color: PlayerColor; gameState: GameState }) => {
      setIsQueueModalOpen(false);
      setGameState(data.gameState);
      setView('ARENA');
      soundFX.playWin();
      addLog(`Match found! Room: ${data.roomCode}. Your color: ${data.color}`, 'system');
    });

    // Room / Match events
    socket.on('player_joined', (data) => {
      addLog(`${data.name || 'Player'} joined the lobby (${data.totalPlayers} players)`, 'system');
      if (data.gameState) {
        setGameState(data.gameState);
      }
    });

    socket.on('player_left', (data) => {
      addLog(`${data.name || 'Player'} left the match`, 'system');
      if (data.gameState) {
        setGameState(data.gameState);
      }
    });

    socket.on('game_started', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
      setView('ARENA');
      soundFX.playClick();
      addLog('Match started! Dice is primed.', 'system');
    });

    socket.on('dice_rolled', (data: { userId: string; rollResult?: any; gameState: GameState }) => {
      setGameState(data.gameState);
      const player = data.gameState.players.find((p) => p.userId === data.userId);
      addLog(
        `${player?.name || 'Player'} rolled a ${data.gameState.diceValue}`,
        'roll',
        player?.color
      );
    });

    socket.on('token_moved', (data: { userId: string; moveResult?: any; gameState: GameState }) => {
      setGameState(data.gameState);
      const player = data.gameState.players.find((p) => p.userId === data.userId);

      if (data.moveResult?.capturedToken) {
        soundFX.playCapture();
        addLog(
          `${player?.name} captured an opponent's token! ⚔️`,
          'capture',
          player?.color
        );
      } else {
        soundFX.playTokenMove();
        addLog(`${player?.name} moved a token`, 'move', player?.color);
      }
    });

    socket.on('turn_timeout', (data: { userId: string; message: string; gameState: GameState }) => {
      setGameState(data.gameState);
      addLog(data.message || 'Turn timed out. Auto-played.', 'system');
    });

    socket.on('emoji_received', (data: { userId: string; name: string; emoji: string }) => {
      addLog(`${data.name}: ${data.emoji}`, 'chat', undefined, data.emoji);
    });

    socket.on('game_finished', (data: { winners: any[]; gameState: GameState }) => {
      setGameState(data.gameState);
      addLog('🏆 Match finished!', 'system');
    });

    socket.on('game_invite_received', (data: GameInvitePayload) => {
      setIncomingInvite(data);
    });

    socket.on('error_event', (err: { message: string }) => {
      alert(`[Dicey] ${err.message}`);
    });

    return () => {
      socket.off('matchmaking_searching');
      socket.off('matchmaking_cancelled');
      socket.off('match_found');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_started');
      socket.off('dice_rolled');
      socket.off('token_moved');
      socket.off('turn_timeout');
      socket.off('emoji_received');
      socket.off('game_finished');
      socket.off('game_invite_received');
      socket.off('error_event');
    };
  }, []);

  const addLog = (
    message: string,
    type: GameLogEntry['type'],
    color?: PlayerColor,
    emoji?: string
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs((prev) => [
      ...prev.slice(-40),
      {
        id: Math.random().toString(),
        timestamp: time,
        message,
        type,
        color,
        emoji,
      },
    ]);
  };

  // Emitters
  const handleFindMatch = (maxPlayers: 2 | 4) => {
    const socket = socketService.getSocket();
    setQueuePlayers(maxPlayers);
    setIsQueueModalOpen(true);
    socket?.emit('find_match', { maxPlayers });
  };

  const handleCancelMatchmaking = () => {
    const socket = socketService.getSocket();
    setIsQueueModalOpen(false);
    socket?.emit('cancel_matchmaking');
  };

  const handleCreateRoom = (config: { gameMode: 'CLASSIC' | 'QUICK'; maxPlayers: 2 | 4 }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const socket = socketService.getSocket();
    socket?.emit('join_room', { roomCode: code });

    // Initial local waiting lobby state
    setGameState({
      roomCode: code,
      status: 'WAITING',
      gameMode: config.gameMode,
      maxPlayers: config.maxPlayers,
      players: [
        {
          userId: user?.id || 'host-1',
          name: user?.name || 'You',
          color: 'RED',
          tokens: [
            { id: 0, position: -1, stepCount: -1, isHome: false },
            { id: 1, position: -1, stepCount: -1, isHome: false },
            { id: 2, position: -1, stepCount: -1, isHome: false },
            { id: 3, position: -1, stepCount: -1, isHome: false },
          ],
          isConnected: true,
          avatarUrl: user?.avatarUrl,
        },
      ],
      currentTurnColor: 'RED',
      diceValue: null,
      turnTimeRemaining: 20,
      consecutiveSixes: 0,
    });
    setView('ARENA');
  };

  const handleJoinRoom = (roomCode: string) => {
    const socket = socketService.getSocket();
    socket?.emit('join_room', { roomCode });
    setView('ARENA');
  };

  const handleStartMatch = () => {
    if (!gameState) return;
    const socket = socketService.getSocket();
    socket?.emit('start_game', { roomCode: gameState.roomCode });
  };

  const handleRollDice = () => {
    if (!gameState) return;
    const socket = socketService.getSocket();
    socket?.emit('roll_dice', { roomCode: gameState.roomCode });
  };

  const handleSelectToken = (tokenId: number) => {
    if (!gameState) return;
    const socket = socketService.getSocket();
    socket?.emit('move_token', { roomCode: gameState.roomCode, tokenId });
  };

  const handleSendEmote = (emoji: string) => {
    if (!gameState) return;
    const socket = socketService.getSocket();
    socket?.emit('send_emoji', { roomCode: gameState.roomCode, emoji });
  };

  const handleLeaveMatch = () => {
    if (gameState) {
      const socket = socketService.getSocket();
      socket?.emit('leave_room', { roomCode: gameState.roomCode });
    }
    setGameState(null);
    setView('LOBBY');
  };

  const handleInviteFriend = (friendId: string) => {
    if (!gameState) return;
    const socket = socketService.getSocket();
    socket?.emit('invite_friend', {
      friendId,
      roomCode: gameState.roomCode,
    });
  };

  const handleAcceptInvite = (roomCode: string) => {
    setIncomingInvite(null);
    handleJoinRoom(roomCode);
  };

  const handleDeclineInvite = (roomCode: string, fromUserId: string) => {
    const socket = socketService.getSocket();
    socket?.emit('decline_invite', { roomCode, fromUserId });
    setIncomingInvite(null);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col">
      {view === 'LOBBY' && (
        <>
          <Navbar
            onOpenAuth={(mode) => {
              setAuthInitialMode(mode || 'login');
              setIsAuthModalOpen(true);
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenFriends={() => setIsFriendsDrawerOpen(true)}
          />

          <Lobby
            onFindMatch={handleFindMatch}
            onCreateRoom={() => setIsCreateRoomOpen(true)}
            onJoinRoom={() => setIsJoinRoomOpen(true)}
            onOpenFriends={() => setIsFriendsDrawerOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAuth={() => {
              setAuthInitialMode('login');
              setIsAuthModalOpen(true);
            }}
          />
        </>
      )}

      {view === 'ARENA' && gameState && (
        <Arena
          gameState={gameState}
          myUserId={user?.id || 'host-1'}
          onRollDice={handleRollDice}
          onSelectToken={handleSelectToken}
          onSendEmote={handleSendEmote}
          onLeaveMatch={handleLeaveMatch}
          onStartMatch={handleStartMatch}
          logs={logs}
        />
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <FriendsDrawer
        isOpen={isFriendsDrawerOpen}
        onClose={() => setIsFriendsDrawerOpen(false)}
        activeRoomCode={gameState?.roomCode || null}
        onInviteFriend={handleInviteFriend}
      />

      <GameInviteModal
        invite={incomingInvite}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={isJoinRoomOpen}
        onClose={() => setIsJoinRoomOpen(false)}
        onJoin={handleJoinRoom}
      />

      <QueueModal
        isOpen={isQueueModalOpen}
        maxPlayers={queuePlayers}
        onCancel={handleCancelMatchmaking}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
