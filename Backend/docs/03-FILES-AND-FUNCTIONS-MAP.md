# 03 - Files and Functions Map

This reference documents every file in the project, detailing the classes, functions, middlewares, and utilities contained inside them.

---

## 🗂️ 1. Application Entrypoints

### `src/server.ts`
- **`startServer(): Promise<void>`**:
  Initializes MongoDB connection via `connectDatabase()` and starts the Express HTTP server listening on `env.PORT`.
- **`handleGracefulShutdown(signal: string): Promise<void>`**:
  Gracefully drains pending HTTP connections, closes the server, and disconnects MongoDB on `SIGINT` / `SIGTERM` signals.
- **Process Event Listeners**:
  Handles `unhandledRejection` and `uncaughtException` events.

### `src/app.ts`
- **Express Application Assembly**:
  Registers global middlewares:
  - `helmet()`: HTTP header protection
  - `cors()`: Cross-origin rules
  - `express.json()` & `express.urlencoded()`: Body parsers with 10MB limits
  - `cookieParser()`: Cookie reader
  - `morgan()`: Request logging
  - `generalLimiter`: Global DDoS protection
  - `/health`: Health check endpoint
  - `/api/v1/auth`: Mounts authentication routes
  - `notFoundHandler`: 404 handler
  - `errorHandler`: Global error handler

---

## ⚙️ 2. Shared Configuration (`src/shared/config/`)

### `src/shared/config/env.config.ts`
- **`envSchema`**: Zod schema validating all environment variables (`PORT`, `NODE_ENV`, `CLIENT_URL`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `RESEND_API_KEY`, etc.).
- **`parseEnv()`**: Validates `process.env`. If any variable is missing or malformed, logs formatted errors and exits early.
- **`env`**: Exported typed environment object.

### `src/shared/config/db.config.ts`
- **`connectDatabase(): Promise<void>`**: Connects Mongoose to MongoDB using `env.MONGODB_URI` with event listeners for `connected`, `error`, and `disconnected`.
- **`disconnectDatabase(): Promise<void>`**: Cleanly disconnects Mongoose from MongoDB.

---

## 🛠️ 3. Shared Utilities (`src/shared/utils/`)

### `src/shared/utils/apiResponse.ts`
- **`ApiResponse.send<T>(res, statusCode, message, data?, meta?)`**: Low-level response serializer.
- **`ApiResponse.success<T>(res, message, data?, statusCode?)`**: Helper for 200 OK standard JSON responses.
- **`ApiResponse.created<T>(res, message, data?)`**: Helper for 201 Created standard JSON responses.

### `src/shared/utils/asyncHandler.ts`
- **`asyncHandler(fn)`**: Higher-order function wrapping async route handlers to automatically forward unhandled Promise rejections to `next(err)`.

### `src/shared/utils/jwt.util.ts`
- **`generateAccessToken(payload)`**: Issues a signed short-lived JWT access token using `JWT_ACCESS_SECRET` and `JWT_ACCESS_EXPIRES_IN`.
- **`generateRefreshToken(payload)`**: Issues a signed long-lived JWT refresh token using `JWT_REFRESH_SECRET` and `JWT_REFRESH_EXPIRES_IN`.
- **`verifyAccessToken(token)`**: Decodes and verifies an access token. Throws `ApiError.unauthorized` if invalid or expired.
- **`verifyRefreshToken(token)`**: Decodes and verifies a refresh token. Throws `ApiError.unauthorized` if invalid or expired.

### `src/shared/utils/hash.util.ts`
- **`hashPassword(plainText: string): Promise<string>`**: Hashes a password string with bcrypt using 12 salt rounds.
- **`comparePassword(plainText: string, hashedText: string): Promise<boolean>`**: Compares plain password with stored bcrypt hash.

### `src/shared/utils/otp.util.ts`
- **`generateOtp(length?: number): string`**: Generates a cryptographically secure numeric OTP using Node's `crypto.randomInt`.
- **`hashOtp(otp: string): string`**: Computes SHA-256 hash of the OTP before persisting to the database.
- **`verifyOtp(plainOtp: string, hashedOtp: string): boolean`**: Uses constant-time `crypto.timingSafeEqual` to verify the plain OTP against the stored SHA-256 hash.

### `src/shared/utils/logger.ts`
- **`logger.info(message, meta?)`**: Color-coded informational log with timestamp.
- **`logger.warn(message, meta?)`**: Color-coded warning log with timestamp.
- **`logger.error(message, meta?)`**: Color-coded error log with timestamp.
- **`logger.debug(message, meta?)`**: Debug log enabled in non-production environments.

---

## 🛡️ 4. Shared Middlewares (`src/shared/middlewares/`)

### `src/shared/middlewares/auth.middleware.ts`
- **`authenticate(req, res, next)`**: Extracts token from `Authorization: Bearer <token>` or `req.cookies.accessToken`, verifies it, and attaches `{ id, email, role }` to `req.user`.
- **`authorizeRoles(...roles: UserRole[])`**: Role-based access control guard. Ensures the authenticated user's role is in the authorized roles list.

### `src/shared/middlewares/validate.middleware.ts`
- **`validateRequest(schema)`**: Middleware factory accepting Zod schemas for `{ body, query, params }`. Automatically parses, validates, coerces, and attaches sanitized values back to `req`.

### `src/shared/middlewares/error.middleware.ts`
- **`errorHandler(err, req, res, next)`**: Centralized error middleware handling:
  - `ApiError` instances
  - `ZodError` (formats field-level validation errors)
  - MongoDB duplicate key error (code 11000)
  - CastError (invalid ObjectId)
  - JWT errors (`JsonWebTokenError`, `TokenExpiredError`)
  - 500 Internal Server Errors (sanitized in production, full stack in development)

### `src/shared/middlewares/rateLimiter.middleware.ts`
- **`generalLimiter`**: General limiter for `/api/*` (100 requests per 15 mins).
- **`authLimiter`**: Strict limiter for sensitive authentication endpoints (20 requests per 15 mins).

### `src/shared/middlewares/notFound.middleware.ts`
- **`notFoundHandler(req, res, next)`**: Handles undefined routes with a structured 404 `ApiError`.

---

## 🔐 5. Auth Feature (`src/features/auth/`)

### `src/features/auth/auth.interface.ts`
- **`IUser`**: MongoDB document interface for identity (name, email, avatar, role, timestamps).
- **`IAccount`**: MongoDB document interface for credentials & sessions (userId, password, isVerified, verificationOtp, passwordResetOtp, refreshToken, isOnline, lastLogin, lastActive).
- **`SanitizedUser`**: Combined safe public user object for JSON responses.
- **`AuthTokens`**: `{ accessToken, refreshToken }` contract.
- **`RegisterDTO`**, **`LoginDTO`**, **`VerifyEmailDTO`**, **`ResendOtpDTO`**, **`ForgotPasswordDTO`**, **`ResetPasswordDTO`**, **`ChangePasswordDTO`**: Data transfer objects.

### `src/features/auth/auth.model.ts`
- **`userSchema` (`User` Model)**: Core Identity (name, email, avatar, role, timestamps). Fast lookups, public profiles, and zero sensitive credential fields.
- **`accountSchema` (`Account` Model)**: Security & Session State (userId, password, isVerified, verificationOtp, passwordResetOtp, refreshToken, isOnline, lastLogin, lastActive).
- **`accountSchema.pre('save')`**: Automatically hashes password with bcrypt (12 salt rounds) whenever modified.
- **`accountSchema.methods.comparePassword()`**: Instance method comparing entered password with stored hash.
- **`toJSON` Transformations**: Strips sensitive fields (`password`, OTPs, tokens) when serializing documents.

### `src/features/auth/auth.validation.ts`
- **`registerSchema`**: Validates name, email, and strong password.
- **`loginSchema`**: Validates email and password.
- **`verifyEmailSchema`**: Validates email and 6-digit numeric OTP.
- **`resendOtpSchema`**: Validates email.
- **`forgotPasswordSchema`**: Validates email.
- **`resetPasswordSchema`**: Validates email, 6-digit OTP, and new password.
- **`changePasswordSchema`**: Validates current password and new password.
- **`refreshTokenSchema`**: Validates optional refresh token in request body.

### `src/features/auth/auth.service.ts`
- **`register(dto)`**: Creates user or refreshes unverified user, generates 6-digit OTP, hashes OTP, stores expiration, dispatches verification email via Resend.
- **`verifyEmail(dto)`**: Verifies OTP, marks user verified, clears OTP fields, issues access & refresh tokens, triggers welcome email.
- **`resendVerificationOtp(dto)`**: Issues a new 6-digit OTP and resends verification email.
- **`login(dto)`**: Validates credentials, checks email verification status, issues access & refresh tokens, saves refresh token, updates `lastLogin`.
- **`refreshTokens(token)`**: Validates refresh token, checks against stored DB token, rotates tokens (generates brand new access & refresh tokens). Detects token reuse.
- **`logout(userId)`**: Removes stored refresh token from database.
- **`forgotPassword(dto)`**: Generates reset OTP and sends password reset email.
- **`resetPassword(dto)`**: Verifies reset OTP, updates password, clears reset fields, revokes existing refresh tokens.
- **`changePassword(userId, dto)`**: Validates current password, updates to new password.
- **`getCurrentUser(userId)`**: Fetches sanitized profile of logged-in user.

### `src/features/auth/auth.controller.ts`
- **`register`**: Calls service, sets HTTP status 201.
- **`verifyEmail`**: Calls service, sets `HttpOnly` cookies, returns tokens & profile.
- **`resendVerificationOtp`**: Calls service, returns confirmation message.
- **`login`**: Calls service, sets `HttpOnly` cookies, returns tokens & profile.
- **`refreshToken`**: Reads cookie or body, calls service, rotates cookies, returns new tokens.
- **`logout`**: Clears cookies, calls service to invalidate DB refresh token.
- **`forgotPassword`**: Calls service, returns confirmation message.
- **`resetPassword`**: Calls service, clears cookies, returns confirmation message.
- **`changePassword`**: Calls service, clears cookies, returns confirmation message.
- **`getMe`**: Returns logged-in user profile.

### `src/features/auth/auth.routes.ts`
- Maps HTTP verbs and paths to controllers with validation and auth guards.

---

## 📧 6. Email Feature (`src/features/email/`)

### `src/features/email/email.interface.ts`
- **`SendEmailOptions`**: `{ to, subject, html, text? }`.
- **`EmailResult`**: `{ success: boolean, id?: string, error?: string }`.

### `src/features/email/email.service.ts`
- **`emailService.sendEmail(options)`**: Sends email through Resend API. If API key is placeholder, gracefully logs the email to console for development testing.
- **`emailService.sendVerificationEmail(to, name, otp)`**: Compiles HTML verification template and sends verification code.
- **`emailService.sendPasswordResetEmail(to, name, otp)`**: Compiles HTML password reset template and sends reset code.
- **`emailService.sendWelcomeEmail(to, name)`**: Compiles welcome template and sends congratulations email.

### `src/features/email/templates/`
- **`verificationEmail.ts`**: Responsive HTML email with 6-digit verification code.
- **`passwordResetEmail.ts`**: Responsive HTML email with 6-digit password reset code and security disclaimer.
- **`welcomeEmail.ts`**: Responsive HTML email welcoming verified users.

---

## 👥 7. Friends Feature (`src/features/friends/`)

### `src/features/friends/friends.interface.ts`
- **`FriendshipStatus`**: `'pending' | 'accepted' | 'rejected' | 'blocked'`.
- **`IFriendship`**: Mongoose document interface with canonical user pair (`userA`, `userB`), `requester`, `recipient`, `status`, and `actionUserId`.
- **`FriendProfile`**: Friend item interface with `id`, `name`, `email`, `avatar`, `role`, `isOnline`, `lastActive`, and `friendsSince`.
- **`FriendRequestItem`**: Pending request DTO with `requestId`, user info, and `sentAt`.
- **`SearchUserResult`**: Search DTO containing `relationshipStatus` (`'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked' | 'blocked_by'`) and `isOnline`.
- **`PaginationQuery`**: `{ page?, limit?, search? }`.

### `src/features/friends/friends.model.ts`
- **`friendshipSchema`**: Relationship schema with compound unique index on `{ userA: 1, userB: 1 }` preventing race conditions and duplicate friendships.
- **`getCanonicalPair(id1, id2)`**: Canonical helper ordering any two user IDs lexicographically (`userA < userB`).

### `src/features/friends/friends.validation.ts`
- **`recipientParamSchema`**: Validates 24-character hexadecimal ObjectId for `recipientId`.
- **`requestIdParamSchema`**: Validates 24-character hexadecimal ObjectId for `requestId`.
- **`friendIdParamSchema`**: Validates 24-character hexadecimal ObjectId for `friendId`.
- **`targetUserParamSchema`**: Validates 24-character hexadecimal ObjectId for `targetUserId`.
- **`paginationQuerySchema`**: Validates `page` (min: 1), `limit` (max: 50), and optional `search`.
- **`searchUsersQuerySchema`**: Validates `query` (min: 1, max: 50), `page`, and `limit`.

### `src/features/friends/friends.service.ts`
- **`sendFriendRequest(requesterId, recipientId)`**: Validates non-self, checks block states, prevents duplicates, handles re-requests from previously rejected states.
- **`acceptFriendRequest(userId, requestId)`**: Validates authorization, verifies pending status, marks friendship `accepted`.
- **`rejectFriendRequest(userId, requestId)`**: Rejects and removes pending request.
- **`cancelFriendRequest(userId, requestId)`**: Allows sender to cancel their own pending request.
- **`removeFriend(userId, friendId)`**: Removes an established friendship between two users.
- **`getFriendsList(userId, query)`**: Returns paginated accepted friends list with live `isOnline` status and `friendsSince` timestamp.
- **`getReceivedRequests(userId, query)`**: Returns paginated pending incoming friend requests with requester details.
- **`getSentRequests(userId, query)`**: Returns paginated pending outgoing friend requests with recipient details.
- **`blockUser(userId, targetUserId)`**: Blocks a user and dissolves any active friendship or request.
- **`unblockUser(userId, targetUserId)`**: Removes block status on target user.
- **`getBlockedUsers(userId, query)`**: Returns list of users blocked by the authenticated user.
- **`searchUsers(userId, query, page, limit)`**: Searches non-friend users by name/email, annotating each with live `isOnline` state and exact relationship status (`none`, `friends`, `request_sent`, `request_received`, `blocked`).

### `src/features/friends/friends.controller.ts`
- Handlers extracting `req.user.id`, route params, and query strings, invoking service methods, and sending standardized `ApiResponse` payloads with metadata.

### `src/features/friends/friends.routes.ts`
- Mounts all 12 endpoints under `/api/v1/friends` protected with `authenticate` and Zod validation middlewares.

---

## 🎲 8. Ludo Game Engine Feature (`src/features/ludo/`)

### `src/features/ludo/engine/ludo.constants.ts`
- **`PLAYER_COLORS`**: `['RED', 'GREEN', 'YELLOW', 'BLUE']`.
- **`BOARD_CONSTANTS`**: `TOTAL_COMMON_SQUARES` (52), `HOME_CORRIDOR_LENGTH` (5), `FINAL_HOME_STEP` (56), `TOKENS_PER_PLAYER` (4), `MAX_CONSECUTIVE_SIXES` (3).
- **`COLOR_START_SQUARES`**: Red (0), Green (13), Yellow (26), Blue (39).
- **`SAFE_SQUARES`**: Array of 8 non-capturable safe squares (Starting spots: 0, 13, 26, 39 and Star spots: 8, 21, 34, 47).

### `src/features/ludo/engine/ludo.types.ts`
- **`TokenLocationState`**: `'BASE' | 'TRACK' | 'CORRIDOR' | 'HOME'`.
- **`TokenState`**: Token state with `tokenId`, `color`, `step` (-1 to 56), `state`, `commonSquare`, and `corridorStep`.
- **`PlayerGameState`**: Player in-game state with `userId`, `name`, `color`, `tokens`, `hasFinished`, `rank`, and `consecutiveSixes`.
- **`LudoGameState`**: Complete authoritative state machine snapshot with `roomCode`, `status`, `players`, `currentTurnIndex`, `diceValue`, `hasRolledDice`, `validMoveTokenIds`, `winners`, and `updatedAt`.
- **`RollResult`**: Dice roll output containing `diceValue`, `validMoves`, `turnPassed`, `bonusTurn`, and message.
- **`MoveResult`**: Token move output containing `movedToken`, `capturedToken`, `reachedHome`, `bonusTurn`, `bonusReason`, `nextTurnColor`, `gameFinished`, and message.

### `src/features/ludo/engine/ludo.token.ts`
- **`LudoTokenHelper.createInitialTokens(color)`**: Creates 4 base tokens initialized with `step: -1`, `state: 'BASE'`.
- **`LudoTokenHelper.resolvePosition(color, step)`**: Mathematical translation of relative step count (0..56) to board coordinates (`TRACK` on common track 0..51, `CORRIDOR` 1..5, or `HOME`).
- **`LudoTokenHelper.canMove(token, diceValue)`**: Enforces entry rule (needs 6 to leave base), board boundaries, and exact-roll-to-reach-home rule (no overshooting).
- **`LudoTokenHelper.applyMove(token, diceValue)`**: Advances token and returns updated immutable state.

### `src/features/ludo/engine/ludo.board.ts`
- **`LudoBoardHelper.isSafeSquare(commonSquare)`**: Checks if a common track square is one of the 8 designated safe/star squares.
- **`LudoBoardHelper.checkCollision(movedToken, players)`**: Detects collisions on non-safe track squares, sends captured opponent token back to yard (`step: -1`), and returns capture metadata.

### `src/features/ludo/engine/ludo.engine.ts`
- **`LudoEngine.createGame(roomCode, playersData)`**: Pure factory initializing a 2-4 player Ludo state machine with assigned colors and initial yard tokens.
- **`LudoEngine.generateDiceValue()`**: Generates cryptographically secure random integers 1 to 6.
- **`LudoEngine.rollDice(state, userId, forcedRoll?)`**: Server-authoritative dice roll execution. Enforces turn validity, handles 3-consecutive-sixes turn penalty, calculates valid tokens, and executes auto-turn-pass if no legal moves exist.
- **`LudoEngine.moveToken(state, userId, tokenId)`**: Server-authoritative token movement. Enforces valid moves, detects captures (katti), grants bonus turns for rolling 6, capturing an opponent, or reaching home, assigns final ranks, and checks game completion.
- **`LudoEngine.advanceTurn(state)`**: Circular turn rotation skipping already finished players.

### `src/features/ludo/ludo.model.ts`
- **`GameRoom` Mongoose Model**: Persists room codes, creator, players, game state snapshots, and turn deadlines.

### `src/features/ludo/ludo.service.ts`
- **`createRoom(userId, dto)`**: Creates room with unique 6-character room code.
- **`joinRoom(userId, roomCode)`**: Adds players to waiting room and auto-starts when room is filled.
- **`startGame(userId, roomCode)`**: Manually starts match by creator for 2-4 players.
- **`rollDice(userId, roomCode)`**: Validates turn, executes engine roll, persists updated state to MongoDB.
- **`moveToken(userId, roomCode, tokenId)`**: Validates move, executes engine move, handles game finish, persists state.
- **`getGameState(userId, roomCode)`**: Retrieves full game state.
- **`leaveRoom(userId, roomCode)`**: Handles graceful forfeit during active matches or player exit from lobby.

### `src/features/ludo/ludo.controller.ts` & `ludo.routes.ts`
- Mounts REST endpoints under `/api/v1/ludo` with authentication and Zod validation.


