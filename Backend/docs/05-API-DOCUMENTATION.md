# 05 - REST API Documentation

**Base URL**: `http://localhost:5000/api/v1`

---

## 📌 Standard Response Envelope

All API endpoints return JSON payloads conforming to the standardized structure:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

## 🔐 Authentication Endpoints

### 1. Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Auth Required**: No (Rate limited: 20 req / 15 min)
- **Request Body**:
```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "Password123"
}
```
- **Password Rules**:
  - Minimum 8 characters, maximum 100 characters
  - At least one uppercase letter (`A-Z`)
  - At least one lowercase letter (`a-z`)
  - At least one number (`0-9`)
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful! Please check your email for the 6-digit verification code.",
  "data": {
    "email": "alex@example.com"
  }
}
```

---

### 2. Verify Email with OTP
- **Method**: `POST`
- **Path**: `/api/v1/auth/verify-email`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "otp": "489201"
}
```
- **Success Response (200 OK)**:
  - *Cookies Set*: `accessToken`, `refreshToken` (HttpOnly)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully. Welcome to Dicey!",
  "data": {
    "user": {
      "id": "673f8a421b8c091f9b3a1a9e",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "role": "user",
      "isVerified": true,
      "createdAt": "2026-10-04T00:50:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

### 3. Resend Verification OTP
- **Method**: `POST`
- **Path**: `/api/v1/auth/resend-otp`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@example.com"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "A fresh verification code has been sent to your email address."
}
```

---

### 4. User Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "Password123"
}
```
- **Success Response (200 OK)**:
  - *Cookies Set*: `accessToken`, `refreshToken` (HttpOnly)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "673f8a421b8c091f9b3a1a9e",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "role": "user",
      "isVerified": true,
      "lastLogin": "2026-10-04T01:05:00.000Z",
      "createdAt": "2026-10-04T00:50:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

### 5. Refresh Tokens
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh-token`
- **Auth Required**: No (Uses refresh token from HttpOnly cookie or request body)
- **Request Body** *(Optional if sent via cookie)*:
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOi...new...",
    "refreshToken": "eyJhbGciOi...new..."
  }
}
```

---

### 6. User Logout
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Auth Required**: Yes (`Bearer <token>` or cookie)
- **Success Response (200 OK)**:
  - Clears `accessToken` and `refreshToken` cookies
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

### 7. Forgot Password (Request Reset OTP)
- **Method**: `POST`
- **Path**: `/api/v1/auth/forgot-password`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@example.com"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "If an account exists with this email, a 6-digit password reset code has been sent."
}
```

---

### 8. Reset Password with OTP
- **Method**: `POST`
- **Path**: `/api/v1/auth/reset-password`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "otp": "951832",
  "newPassword": "NewStrongPassword456"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful! You can now log in with your new password."
}
```

---

### 9. Change Password (Logged In User)
- **Method**: `POST`
- **Path**: `/api/v1/auth/change-password`
- **Auth Required**: Yes (`Bearer <token>` or cookie)
- **Request Body**:
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewStrongPassword456"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password updated successfully."
}
```

---

### 10. Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth Required**: Yes (`Authorization: Bearer <accessToken>` or cookie)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched successfully",
  "data": {
    "id": "673f8a421b8c091f9b3a1a9e",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "user",
    "isVerified": true,
    "lastLogin": "2026-10-04T01:05:00.000Z",
    "createdAt": "2026-10-04T00:50:00.000Z"
  }
}
```

---

## 🩺 System Health Check

- **Method**: `GET`
- **Path**: `/health`
- **Auth Required**: No
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dicey Backend Service is healthy and operational",
  "data": {
    "environment": "development",
    "uptime": 12.43,
    "timestamp": "2026-10-04T01:10:00.000Z"
  }
}
```

---

## 👥 Friends & Social Endpoints (`/api/v1/friends`)

> **Note**: All Friends endpoints require authentication (`Authorization: Bearer <accessToken>` or `accessToken` cookie).

### 1. Get Friends List
- **Method**: `GET`
- **Path**: `/api/v1/friends?page=1&limit=20&search=alex`
- **Query Params**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
  - `search` (optional string filter by name/email)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Friends list retrieved successfully",
  "data": [
    {
      "id": "673f8a421b8c091f9b3a1a9e",
      "name": "Sarah Connor",
      "email": "sarah@example.com",
      "avatar": "https://...",
      "role": "user",
      "isOnline": true,
      "lastActive": "2026-10-04T01:30:00.000Z",
      "friendsSince": "2026-10-04T01:15:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### 2. Search Users (To Add Friends)
- **Method**: `GET`
- **Path**: `/api/v1/friends/search?query=sarah&page=1&limit=20`
- **Query Params**:
  - `query` (required, 1-50 characters)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users search results retrieved",
  "data": [
    {
      "id": "673f8a421b8c091f9b3a1a9e",
      "name": "Sarah Connor",
      "email": "sarah@example.com",
      "avatar": "",
      "relationshipStatus": "none",
      "isOnline": false
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```
*Possible `relationshipStatus` values: `none`, `friends`, `request_sent`, `request_received`, `blocked`, `blocked_by`.*

---

### 3. Send Friend Request
- **Method**: `POST`
- **Path**: `/api/v1/friends/request/:recipientId`
- **Path Params**: `recipientId` (24-char ObjectId)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Friend request sent successfully"
}
```

---

### 4. Accept Friend Request
- **Method**: `POST`
- **Path**: `/api/v1/friends/accept/:requestId`
- **Path Params**: `requestId` (24-char ObjectId)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Friend request accepted successfully"
}
```

---

### 5. Reject Friend Request
- **Method**: `POST`
- **Path**: `/api/v1/friends/reject/:requestId`
- **Path Params**: `requestId` (24-char ObjectId)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Friend request rejected"
}
```

---

### 6. Cancel Outgoing Friend Request
- **Method**: `POST`
- **Path**: `/api/v1/friends/cancel/:requestId`
- **Path Params**: `requestId` (24-char ObjectId)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Friend request cancelled successfully"
}
```

---

### 7. Remove Friend (Unfriend)
- **Method**: `DELETE`
- **Path**: `/api/v1/friends/remove/:friendId`
- **Path Params**: `friendId` (24-char ObjectId)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Friend removed successfully"
}
```

---

### 8. Get Received Friend Requests
- **Method**: `GET`
- **Path**: `/api/v1/friends/requests/received?page=1&limit=20`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Received friend requests retrieved",
  "data": [
    {
      "requestId": "673f8e5b1b8c091f9b3a1b02",
      "user": {
        "id": "673f8a421b8c091f9b3a1a9e",
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "avatar": "",
        "isOnline": true
      },
      "sentAt": "2026-10-04T01:40:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### 9. Get Sent Friend Requests
- **Method**: `GET`
- **Path**: `/api/v1/friends/requests/sent?page=1&limit=20`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sent friend requests retrieved",
  "data": [
    {
      "requestId": "673f8e5b1b8c091f9b3a1b02",
      "user": {
        "id": "673f8a421b8c091f9b3a1a9e",
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "avatar": "",
        "isOnline": true
      },
      "sentAt": "2026-10-04T01:40:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### 10. Block User
- **Method**: `POST`
- **Path**: `/api/v1/friends/block/:targetUserId`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User blocked successfully"
}
```

---

### 11. Unblock User
- **Method**: `POST`
- **Path**: `/api/v1/friends/unblock/:targetUserId`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User unblocked successfully"
}
```

---

### 12. Get Blocked Users List
- **Method**: `GET`
- **Path**: `/api/v1/friends/blocked?page=1&limit=20`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Blocked users retrieved successfully",
  "data": [
    {
      "id": "673f8a421b8c091f9b3a1a9e",
      "name": "Bad Actor",
      "email": "bad@example.com",
      "avatar": "",
      "role": "user",
      "isOnline": false
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

## 🎲 Ludo Game Engine Endpoints (`/api/v1/ludo`)

> **Note**: All Ludo gameplay endpoints require authentication (`Authorization: Bearer <accessToken>` or `accessToken` cookie).

### 1. Create Game Room
- **Method**: `POST`
- **Path**: `/api/v1/ludo/rooms`
- **Request Body**:
```json
{
  "maxPlayers": 4
}
```
*`maxPlayers` can be `2` or `4`.*
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Game room created successfully",
  "data": {
    "id": "673f91801b8c091f9b3a1b55",
    "roomCode": "LDK78P",
    "creatorId": "673f8a421b8c091f9b3a1a9e",
    "maxPlayers": 4,
    "status": "WAITING",
    "players": [
      {
        "userId": "673f8a421b8c091f9b3a1a9e",
        "name": "Alex Mercer",
        "avatar": "",
        "isReady": true
      }
    ]
  }
}
```

---

### 2. Join Game Room
- **Method**: `POST`
- **Path**: `/api/v1/ludo/rooms/:roomCode/join`
- **Path Params**: `roomCode` (e.g. `LDK78P`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Joined game room successfully",
  "data": {
    "roomCode": "LDK78P",
    "status": "WAITING",
    "players": [ ... ]
  }
}
```
*Note: If the room reaches its `maxPlayers` count upon joining, the engine automatically initializes and starts the game (`status: "PLAYING"`).*

---

### 3. Start Game Manually (Room Creator)
- **Method**: `POST`
- **Path**: `/api/v1/ludo/rooms/:roomCode/start`
- **Path Params**: `roomCode` (e.g. `LDK78P`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Game started successfully",
  "data": {
    "roomCode": "LDK78P",
    "status": "PLAYING",
    "gameState": {
      "currentTurnColor": "RED",
      "players": [ ... ]
    }
  }
}
```

---

### 4. Roll Dice
- **Method**: `POST`
- **Path**: `/api/v1/ludo/rooms/:roomCode/roll`
- **Path Params**: `roomCode` (e.g. `LDK78P`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Alex Mercer rolled a 6! Select a token to move.",
  "data": {
    "rollResult": {
      "diceValue": 6,
      "validMoves": [0, 1, 2, 3],
      "consecutiveSixes": 1,
      "turnPassed": false,
      "bonusTurn": true,
      "message": "Alex Mercer rolled a 6! Select a token to move."
    },
    "gameState": {
      "currentTurnColor": "RED",
      "diceValue": 6,
      "hasRolledDice": true,
      "validMoveTokenIds": [0, 1, 2, 3]
    }
  }
}
```

---

### 5. Move Token
- **Method**: `POST`
- **Path**: `/api/v1/ludo/rooms/:roomCode/move`
- **Path Params**: `roomCode` (e.g. `LDK78P`)
- **Request Body**:
```json
{
  "tokenId": 0
}
```
*`tokenId` is an integer between `0` and `3`.*
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Alex Mercer moved token 0 and earned a bonus turn (ROLLED_SIX)!",
  "data": {
    "moveResult": {
      "success": true,
      "movedToken": {
        "tokenId": 0,
        "color": "RED",
        "step": 0,
        "state": "TRACK",
        "commonSquare": 0,
        "corridorStep": null
      },
      "reachedHome": false,
      "bonusTurn": true,
      "bonusReason": "ROLLED_SIX",
      "nextTurnColor": "RED",
      "gameFinished": false,
      "message": "Alex Mercer moved token 0 and earned a bonus turn (ROLLED_SIX)!"
    },
    "gameState": { ... }
  }
}
```

---

### 6. Get Current Game State
- **Method**: `GET`
- **Path**: `/api/v1/ludo/rooms/:roomCode`
- **Path Params**: `roomCode` (e.g. `LDK78P`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Game state retrieved successfully",
  "data": {
    "roomCode": "LDK78P",
    "status": "PLAYING",
    "gameState": {
      "roomCode": "LDK78P",
      "status": "PLAYING",
      "currentTurnIndex": 0,
      "currentTurnColor": "RED",
      "diceValue": null,
      "hasRolledDice": false,
      "validMoveTokenIds": [],
      "players": [ ... ],
      "winners": []
    }
  }
}
```

---

### 7. Leave / Forfeit Game Room
- **Method**: `POST`
- **Path**: `/api/v1/ludo/rooms/:roomCode/leave`
- **Path Params**: `roomCode` (e.g. `LDK78P`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully left the room"
}
```


