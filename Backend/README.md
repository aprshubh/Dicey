# Dicey Backend API (Express + TypeScript)

A production-grade, enterprise-ready Express.js backend engineered with a **Feature-Driven Architecture**, strict TypeScript typings, MongoDB (Mongoose), Resend transactional emails, and a complete authentication suite.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
Ensure you provide:
- `MONGODB_URI`: Your MongoDB database connection string.
- `RESEND_API_KEY`: Your Resend API key (`re_...`). *(In dev mode without an active key, OTPs will be displayed in server logs for testing)*.

### 3. Run Development Server
```bash
npm run dev
```
The server will boot up at `http://localhost:5000` with hot-reloading powered by `tsx`.

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Typecheck
```bash
npm run typecheck
```

---

## 📚 Complete Documentation Suite

Comprehensive documentation is maintained in the [`docs/`](./docs) folder:

- **[01. Architecture & System Design](./docs/01-ARCHITECTURE-AND-OVERVIEW.md)**: Architectural pattern, feature-based modularity, production-readiness, and directory hierarchy.
- **[02. Packages & Dependencies](./docs/02-PACKAGES-AND-DEPENDENCIES.md)**: Catalog of every package installed, versions, and rationale.
- **[03. Files & Functions Map](./docs/03-FILES-AND-FUNCTIONS-MAP.md)**: Exhaustive directory map listing every file, class, function, and utility.
- **[04. Authentication Flows & Lifecycle](./docs/04-AUTH-FLOWS-AND-LIFECYCLE.md)**: Step-by-step authentication diagrams (Registration, OTP verification, Token rotation, Password reset).
- **[05. REST API Documentation](./docs/05-API-DOCUMENTATION.md)**: Endpoints, request schemas, status codes, and JSON response envelopes.
- **[06. Real-time Multiplayer (Socket.IO)](./docs/06-REALTIME-MULTIPLAYER-SOCKETS.md)**: Bi-directional WebSockets, live dice rolls, token moves, turn timers, and in-game emotes.

---

## ✨ Features

- **Feature-Based Modular Architecture**: Domain boundaries isolated in `src/features/`.
- **Complete Auth System**:
  - Email & Password registration with 6-digit OTP verification.
  - Dual-token JWT authentication (15m Access Token + 7d Refresh Token).
  - Refresh Token Rotation with compromised token reuse detection.
  - HttpOnly Cookie + Bearer Authorization header dual compatibility.
  - Forgot password & password reset via email OTP.
  - Change password & Profile (`/me`) endpoints.
  - Role-Based Access Control (`authorizeRoles`).
- **Resend Email Integration**: Branded, responsive HTML templates for Verification, Password Reset, and Welcome emails.
- **Defensive Security**:
  - `helmet` security headers.
  - `cors` with origin whitelisting & credentials.
  - `express-rate-limit` for DDoS prevention and brute-force mitigation on auth routes.
  - Cryptographically secure OTPs (Node.js `crypto.randomInt` + SHA-256 hash storage).
  - Bcrypt password hashing (12 salt rounds).
- **Centralized Error Handling**: Unified operational error formatting with Zod error parsing and MongoDB unique constraint handling.
- **Graceful Shutdown**: Intercepts `SIGINT`/`SIGTERM` to safely drain requests and close MongoDB connections.
