# 01 - Architecture and Project Overview

## 📌 Introduction

This backend is architected following **Feature-Driven / Domain-Modular Architecture** in **TypeScript** using **Express 5** and **MongoDB (Mongoose)**. The goal is to provide enterprise-grade maintainability, separation of concerns, scalability, and robust security out of the box.

---

## 🏛️ Architectural Principles

1. **Feature-Wise Organization (`/src/features`)**:
   - Rather than grouping files by type alone (e.g., placing all controllers in one folder, all models in another), code is grouped by business domain / feature (e.g., `auth`, `email`).
   - Each feature encapsulates its own **routes**, **controller**, **service**, **model**, **validation schemas**, and **interfaces**.
   - Makes adding or removing features seamless without touching unrelated parts of the codebase.

2. **Layered Separation of Concerns**:
   - **Routes Layer (`*.routes.ts`)**: Defines HTTP endpoints, attaches rate-limiters, input validation middlewares, and auth guards.
   - **Controller Layer (`*.controller.ts`)**: Handles HTTP requests, extracts cookies/headers/body, coordinates service calls, and formats standard responses using `ApiResponse`.
   - **Service Layer (`*.service.ts`)**: Pure business logic, DB queries, security hashing, external email dispatch via Resend. Reusable across different interfaces (e.g., HTTP, WebSockets, background jobs).
   - **Data Layer (`*.model.ts`)**: Mongoose schemas, indexes, schema hooks, and instance methods.
   - **Validation Layer (`*.validation.ts`)**: Schema-based request body/query/params validation using Zod.
   - **Types Layer (`*.interface.ts`)**: Strongly-typed interfaces and DTOs.

3. **Shared Core Infrastructure (`/src/shared`)**:
   - Reusable utilities, custom error classes, global middlewares, database configuration, and environment validation.

---

## 📁 Directory Structure

```text
Backend/
├── .env.example                       # Environment template with dummy keys
├── .env                               # Active environment variables (git-ignored)
├── .gitignore                         # Git exclusion rules
├── package.json                       # Scripts and dependencies
├── tsconfig.json                      # Strict TypeScript compiler options
├── README.md                          # Quick start instructions
│
├── docs/                              # Comprehensive documentation suite
│   ├── 01-ARCHITECTURE-AND-OVERVIEW.md# System architecture, principles, structure
│   ├── 02-PACKAGES-AND-DEPENDENCIES.md# Package catalog, reasons & roles
│   ├── 03-FILES-AND-FUNCTIONS-MAP.md  # File-by-file function/class breakdown
│   ├── 04-AUTH-FLOWS-AND-LIFECYCLE.md # Mermaid sequence diagrams & auth flows
│   └── 05-API-DOCUMENTATION.md        # Complete REST API reference with examples
│
└── src/
    ├── app.ts                         # Express application setup & middleware pipeline
    ├── server.ts                      # Server bootstrap & graceful shutdown hooks
    │
    ├── shared/                        # Shared cross-cutting components
    │   ├── config/
    │   │   ├── env.config.ts          # Zod-validated environment config
    │   │   └── db.config.ts           # Mongoose MongoDB connection & lifecycle listeners
    │   ├── constants/
    │   │   └── httpStatus.ts          # Semantic HTTP status code constants
    │   ├── errors/
    │   │   └── apiError.ts            # Custom operational ApiError class
    │   ├── middlewares/
    │   │   ├── auth.middleware.ts     # JWT verification & role authorization guards
    │   │   ├── error.middleware.ts    # Centralized global error handling middleware
    │   │   ├── notFound.middleware.ts # 404 Route Not Found handler
    │   │   ├── rateLimiter.middleware.ts # DDoS & brute-force protection
    │   │   └── validate.middleware.ts # Zod request validation middleware
    │   └── utils/
    │       ├── apiResponse.ts         # Standardized REST JSON envelope
    │       ├── asyncHandler.ts        # Async try/catch wrapper for route controllers
    │       ├── hash.util.ts           # Bcrypt password hashing & comparison
    │       ├── jwt.util.ts            # JWT signing & verification (Access & Refresh)
    │       ├── logger.ts              # Clean color-coded structured logger
    │       └── otp.util.ts            # Cryptographic 6-digit OTP generator & SHA-256 hasher
    │
    └── features/                      # Feature modules
        ├── auth/                      # Authentication & Identity domain
        │   ├── auth.controller.ts     # HTTP request handlers & cookie setters
        │   ├── auth.interface.ts      # TypeScript interfaces, types & DTOs
        │   ├── auth.model.ts          # User Mongoose schema & model
        │   ├── auth.routes.ts         # Express router for /api/v1/auth
        │   ├── auth.service.ts        # Core authentication business logic
        │   └── auth.validation.ts     # Zod validation schemas
        ├── email/                     # Transactional email service via Resend
        │   ├── email.interface.ts     # Email options & response contracts
        │   ├── email.service.ts       # Resend client wrapper & email methods
        │   └── templates/             # Responsive HTML email templates
        │       ├── passwordResetEmail.ts # Password reset OTP template
        │       ├── verificationEmail.ts  # Email verification OTP template
        │       └── welcomeEmail.ts       # Post-verification welcome template
        ├── friends/                   # 👥 Friends & Social system
        │   ├── friends.controller.ts  # Handlers: request, accept, reject, block, search
        │   ├── friends.interface.ts   # Friendship interfaces & DTOs
        │   ├── friends.model.ts       # Mongoose Schema with Canonical Pair indexing
        │   ├── friends.routes.ts      # Express router for /api/v1/friends
        │   ├── friends.service.ts     # Friendship business logic & online status
        │   └── friends.validation.ts  # Zod schemas for IDs and queries
        └── ludo/                      # 🎲 Ludo Game Engine & Room Matchmaking
            ├── engine/                # Server-Authoritative Pure Ludo State Machine
            │   ├── ludo.constants.ts  # Board geometry, 8 safe/star squares, color offsets
            │   ├── ludo.types.ts      # Types: TokenState, BoardState, MoveResult
            │   ├── ludo.token.ts      # Coordinate calculations & entry/overshoot checks
            │   ├── ludo.board.ts      # Safe zones & capture/collision detection
            │   └── ludo.engine.ts     # State machine: rollDice, moveToken, turns, ranks
            ├── ludo.controller.ts     # HTTP handlers: rooms, roll, move, leave
            ├── ludo.interface.ts      # GameRoom document & player DTOs
            ├── ludo.model.ts          # Mongoose GameRoom model
            ├── ludo.routes.ts         # Express router for /api/v1/ludo
            ├── ludo.service.ts        # Matchmaking, room codes & state persistence
            └── ludo.validation.ts     # Zod request validators
```

---

## 🛡️ Production Readiness Features

1. **Security Headers**: Configured using `helmet()` to guard against common web vulnerabilities (XSS, clickjacking, MIME sniffing).
2. **CORS Policy**: Configured strictly with `env.CLIENT_URL` with credentials allowed for secure cross-origin cookie sharing.
3. **Dual Token Authentication**: Short-lived Access Token (15m) + Long-lived Refresh Token (7d) with automatic Token Rotation and reuse detection.
4. **HttpOnly Cookie Support**: Tokens can be delivered via HTTP response body as well as secure `HttpOnly` cookies.
5. **Rate Limiting**:
   - General API limiter prevents denial of service.
   - Sensitive auth limiter (20 requests / 15 mins) prevents brute-force credential stuffing and OTP spamming.
6. **Centralized Error Handling**: Transforms Zod validation errors, MongoDB duplicate keys, JWT expirations, and unexpected exceptions into a clean JSON structure without leaking sensitive stack traces in production.
7. **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to finish in-flight requests and cleanly close MongoDB connections before terminating the process.
