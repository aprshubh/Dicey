# 02 - Packages & Dependencies Reference

This document provides a detailed breakdown of every package installed in this backend, why it was selected, and its role in production.

---

## 📦 Production Dependencies (`dependencies`)

| Package | Version | Purpose / Role in Production |
| :--- | :--- | :--- |
| **`express`** | `^5.2.1` | The foundational web framework for routing, middleware handling, and HTTP lifecycle management. Express 5 provides native asynchronous error handling and modern routing. |
| **`mongoose`** | `^9.10.4` | Object Data Modeling (ODM) library for MongoDB. Provides strict schema enforcement, hooks (e.g. password hashing pre-save), validations, and indexing. |
| **`zod`** | `^4.6.5` | TypeScript-first schema declaration and data validation library. Used to validate incoming request bodies, queries, params, and application environment variables with type inference. |
| **`resend`** | `^6.32.0` | Modern, reliable transactional email API SDK. Used to dispatch OTP verification codes, password reset notifications, and welcome emails with HTML templates. |
| **`jsonwebtoken`** | `^9.0.3` | Industry standard implementation of JSON Web Tokens (RFC 7519). Used to sign and verify stateless Access Tokens (short-lived) and Refresh Tokens (long-lived). |
| **`bcryptjs`** | `^3.0.3` | Optimized JavaScript implementation of the bcrypt cryptographic password hashing algorithm with salt rounds (12 rounds used for maximum security). |
| **`cookie-parser`** | `^1.4.7` | Parses cookie headers and populates `req.cookies`. Critical for secure `HttpOnly` JWT cookie management preventing client-side script access (XSS mitigation). |
| **`cors`** | `^2.8.6` | Cross-Origin Resource Sharing middleware. Controls which origins (e.g., React/Vue/Next.js frontend) can make requests and send credentials/cookies. |
| **`helmet`** | `^8.3.0` | Security middleware that configures secure HTTP response headers (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, etc.). |
| **`express-rate-limit`**| `^8.7.0` | Middleware to rate-limit repeated requests to public APIs and sensitive authentication endpoints to prevent brute-force attacks and abuse. |
| **`morgan`** | `^1.12.1` | HTTP request logger middleware for Node.js. Logs incoming methods, URLs, status codes, and response times for observability during development and production. |
| **`dotenv`** | `^18.0.5` | Loads environment variables from `.env` file into `process.env` at bootstrap. |

---

## 🛠️ Development Dependencies (`devDependencies`)

| Package | Version | Purpose / Role in Development |
| :--- | :--- | :--- |
| **`typescript`** | `^7.0.2` | Strong static typing, modern ECMAScript features compilation, and compile-time error detection. |
| **`tsx`** | `^4.23.15` | Blazing-fast TypeScript execution engine and watcher (powered by esbuild). Enables instantaneous restarts during development (`npm run dev`). |
| **`rimraf`** | `^6.1.3` | Cross-platform directory cleaner. Used in `npm run build` to safely remove the `dist` directory before compiling. |
| **`@types/node`** | `^26.6.4` | TypeScript definitions for Node.js standard runtime APIs (crypto, process, buffer, etc.). |
| **`@types/express`** | `^5.0.6` | Type definitions for Express 5 request, response, next function, and router objects. |
| **`@types/cors`** | `^2.8.19` | TypeScript definitions for CORS options and callback signatures. |
| **`@types/cookie-parser`** | `^1.4.10` | TypeScript definitions for cookie parsing middleware. |
| **`@types/bcryptjs`** | `^2.4.6` | TypeScript definitions for bcrypt functions (`hash`, `compare`). |
| **`@types/jsonwebtoken`** | `^9.0.10` | TypeScript definitions for JWT signing options, verify methods, and decoded payloads. |
| **`@types/morgan`** | `^1.9.10` | TypeScript definitions for Morgan log formats and streams. |

---

## 💡 Why These Choices Were Made

1. **Zod over Joi / express-validator**:
   - Zod infers TypeScript types directly from schemas (`z.infer<typeof schema>`), eliminating duplicate interface declarations and keeping validation schemas and types always in sync.
2. **Resend over Nodemailer / SendGrid**:
   - Resend offers superior deliverability, modern developer-friendly SDK, and reliable cloud-based delivery without needing complex SMTP port forwarding configurations.
3. **Dual Token Flow (Access + Refresh)**:
   - Access tokens are short-lived (15 minutes), minimizing risk if intercepted.
   - Refresh tokens are long-lived (7 days) and stored in MongoDB with **Token Rotation** and **Reuse Detection** (if a compromised token is reused, all user sessions are terminated).
4. **Bcryptjs with Salt Rounds 12**:
   - Balances strong cryptographic resistance against dictionary attacks with fast response times for users.
