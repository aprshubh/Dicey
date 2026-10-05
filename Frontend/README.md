# Dicey Frontend — Modern Minimal Multiplayer Ludo Web Client

Production-grade, developer-first React + TypeScript web application for the **Dicey** multiplayer platform. Engineered based on the **Obsidian Ludo** design system generated via Stitch.

---

## 🎨 Design Philosophy: "Obsidian Ludo"
- **Canvas / BG**: `#09090b` (Deep Neutral Zinc)
- **Surfaces & Docks**: `#121215` (Tier 1 Surface), `#18181b` (Tier 2 Cards & Pods)
- **Micro-borders**: `#27272a`, hover `#3f3f46`
- **Zero Neon**: Matte finishes, calibrated subtle lighting, zero eye-straining glows.
- **Calibrated Player Quadrants**:
  - 🔴 **House Rose**: `#e11d48`
  - 🟢 **House Emerald**: `#10b981`
  - 🟡 **House Gold**: `#f59e0b`
  - 🔵 **House Cyan**: `#0ea5e9`

---

## 📂 Feature-Based Architecture (`Frontend/src/`)

```
src/
├── App.tsx                               # Master Orchestrator (Lobby, Arena, Sockets, Modals)
├── index.css                             # Tailwind directives, Inter & JetBrains Mono typography
├── main.tsx                              # React DOM mount point
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthModal.tsx             # Sign In, Register, and 6-digit OTP verification
│   │   │   └── ProfileModal.tsx          # Career telemetry (ELO, wins, captures, avatar selector)
│   │   ├── context/
│   │   │   └── AuthContext.tsx           # Global authentication state & JWT token auto-sync
│   │   ├── services/
│   │   │   └── auth.api.ts               # Axios API client calls to backend
│   │   └── types/
│   │       └── auth.types.ts             # User, Account, and Auth payload interfaces
│   ├── friends/
│   │   ├── components/
│   │   │   ├── FriendsDrawer.tsx         # Slide-over drawer: Online friends, invites, requests, user search
│   │   │   └── GameInviteModal.tsx       # Live incoming friend match invitation popups
│   │   ├── services/
│   │   │   └── friends.api.ts            # Friend requests, list, search API calls
│   │   └── types/
│   │       └── friends.types.ts          # Friend, Request, and Invite interfaces
│   ├── lobby/
│   │   └── Lobby.tsx                     # Main Dashboard: 1v1 Quick, 4P Classic, Custom Rooms, Leaderboard
│   ├── matchmaking/
│   │   └── components/
│   │       └── QueueModal.tsx            # Live matchmaking radar, timer, and 15s AI Bot fallback info
│   └── ludo/
│       ├── components/
│       │   ├── Arena.tsx                 # Full game stage: Board, Sidebar, Telemetry, HUD
│       │   ├── Board/
│       │   │   ├── LudoBoard.tsx         # 15x15 mathematical board, corner yards, corridors, and home apex
│       │   │   └── TokenPiece.tsx        # Tactile badge tokens with pulse selection halos
│       │   ├── Dice/
│       │   │   └── DiceRoller.tsx        # Tactile 3D dice with recessed pips, Spacebar roll, tumble animation
│       │   ├── Telemetry/
│       │   │   ├── PlayerPod.tsx         # Player status cards with avatar, turn indicator & 20s countdown
│       │   │   └── MatchLedger.tsx       # Tabular live game log, quick chat & preset emote reactions
│       │   └── Modals/
│       │       ├── CreateRoomModal.tsx   # Custom private room configuration
│       │       ├── JoinRoomModal.tsx     # 6-character room code input
│       │       └── VictoryModal.tsx      # Confetti celebration, rankings, and fanfare
│       ├── types/
│       │   └── ludo.types.ts             # GameState, Player, Token, and Move interfaces
│       └── utils/
│           └── boardCoordinates.ts       # 15x15 row/col mapping for all 52 track cells and home paths
└── shared/
    ├── components/
    │   └── Navbar.tsx                    # Top navigation bar with profile chip, friends toggle, audio toggle
    ├── socket/
    │   └── socketClient.ts               # WebSocket (Socket.IO) client with JWT handshake
    └── utils/
        ├── apiClient.ts                  # Axios instance with auto JWT injection and 401 refresh
        ├── soundEffects.ts               # Web Audio API procedural synthesizer for tactile sound FX
        └── tokenStorage.ts               # LocalStorage manager for JWT access & refresh tokens
```

---

## ⚡ How to Run

### 1. Start Backend Server (Terminal 1)
```bash
cd Backend
npm run dev
# Running on http://localhost:5000 (REST API) & ws://localhost:5000 (WebSockets)
```

### 2. Start Frontend Dev Server (Terminal 2)
```bash
cd Frontend
npm run dev
# Vite server running on http://localhost:5173
```
