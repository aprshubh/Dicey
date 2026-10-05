# 04 - Authentication Flows & Lifecycle Architecture

This document diagrams the authentication workflows, security measures, and token rotation mechanics implemented in the Dicey backend.

---

## 1. 📝 User Registration & Email Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant Route as Express Router
    participant Validate as Zod Middleware
    participant Service as AuthService
    participant DB as MongoDB
    participant Email as Resend Email Service

    Client->>Route: POST /api/v1/auth/register (name, email, password)
    Route->>Validate: Validate body schema
    Validate-->>Route: Valid payload
    Route->>Service: register(dto)
    Service->>DB: Check if email exists
    alt Email already verified
        DB-->>Service: User exists (isVerified = true)
        Service-->>Client: 409 Conflict: Email already registered
    else Email is new
        Service->>Service: Generate 6-digit OTP & Hash with SHA-256
        Service->>DB: Save User (isVerified: false, hashedOtp, expires: +10m)
        Service->>Email: sendVerificationEmail(email, name, otp)
        Email-->>Client: Receives verification email with 6-digit code
        Service-->>Client: 201 Created: "Registration successful! Please check your email."
    end
```

---

## 2. ✅ Email OTP Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant Route as Express Router
    participant Service as AuthService
    participant DB as MongoDB
    participant Email as Resend Email Service

    Client->>Route: POST /api/v1/auth/verify-email (email, otp)
    Route->>Service: verifyEmail(dto)
    Service->>DB: Find user by email (+verificationOtp)
    Service->>Service: Verify OTP hash & check expiration (< 10 mins)
    alt OTP valid & unexpired
        Service->>Service: Generate Access Token (15m) & Refresh Token (7d)
        Service->>DB: Set isVerified = true, clear OTP fields, save Refresh Token
        Service-)Email: sendWelcomeEmail(email, name) [Async]
        Service-->>Client: 200 OK + Set-Cookie (accessToken, refreshToken) + User Payload
    else Invalid or Expired OTP
        Service-->>Client: 400 Bad Request: Invalid or expired verification code
    end
```

---

## 3. 🔑 User Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant Route as Express Router
    participant Service as AuthService
    participant DB as MongoDB

    Client->>Route: POST /api/v1/auth/login (email, password)
    Route->>Service: login(dto)
    Service->>DB: Find user by email (+password)
    alt User exists
        Service->>Service: bcrypt.compare(password, user.password)
        alt Password matches
            alt User is verified
                Service->>Service: Generate Access Token (15m) & Refresh Token (7d)
                Service->>DB: Store active Refresh Token & update lastLogin
                Service-->>Client: 200 OK + Set-Cookie (accessToken, refreshToken) + User Payload
            else User is NOT verified
                Service-->>Client: 403 Forbidden: Email not verified
            end
        else Password incorrect
            Service-->>Client: 401 Unauthorized: Invalid email or password
        end
    else User not found
        Service-->>Client: 401 Unauthorized: Invalid email or password
    end
```

---

## 4. 🔄 Token Refresh Flow (Token Rotation & Reuse Detection)

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant Route as Express Router
    participant Service as AuthService
    participant DB as MongoDB

    Client->>Route: POST /api/v1/auth/refresh-token (cookie or body)
    Route->>Service: refreshTokens(incomingRefreshToken)
    Service->>Service: verifyRefreshToken(incomingRefreshToken)
    Service->>DB: Find user by ID (+refreshToken)
    alt DB token matches incoming token
        Service->>Service: Generate NEW Access Token (15m) & NEW Refresh Token (7d)
        Service->>DB: Replace stored refreshToken with NEW refreshToken
        Service-->>Client: 200 OK + Set-Cookie (new tokens) + Return new tokens
    else Mismatch (Token Reuse Detected!)
        Service->>DB: Invalidate stored refreshToken (revoke all sessions)
        Service-->>Client: 401 Unauthorized: Compromised token detected
    end
```

---

## 5. 🔓 Password Reset Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant Service as AuthService
    participant DB as MongoDB
    participant Email as Resend Email Service

    Note over Client,Email: Step 1: Request Password Reset
    Client->>Service: POST /api/v1/auth/forgot-password (email)
    Service->>DB: Find user by email
    alt User exists
        Service->>Service: Generate 6-digit OTP & Hash with SHA-256
        Service->>DB: Save hashed OTP (expires: +10m)
        Service->>Email: sendPasswordResetEmail(email, name, otp)
    end
    Service-->>Client: 200 OK: "If an account exists, a reset code has been sent."

    Note over Client,Email: Step 2: Reset Password with OTP
    Client->>Service: POST /api/v1/auth/reset-password (email, otp, newPassword)
    Service->>DB: Find user (+passwordResetOtp)
    Service->>Service: Verify OTP hash & expiration
    Service->>Service: Hash new password
    Service->>DB: Update password, clear reset OTP fields, revoke existing refreshToken
    Service-->>Client: 200 OK: "Password reset successful! Please log in."
```

---

## 6. 🛡️ Protected Route Access Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant AuthGuard as authenticate Middleware
    participant Controller as Protected Controller

    Client->>AuthGuard: GET /api/v1/auth/me (Authorization: Bearer <token> or Cookie)
    AuthGuard->>AuthGuard: Verify Access Token with JWT_ACCESS_SECRET
    alt Valid Token
        AuthGuard->>AuthGuard: Attach decoded { id, email, role } to req.user
        AuthGuard->>Controller: Forward to handler (next())
        Controller-->>Client: 200 OK with User Profile
    else Expired or Invalid Token
        AuthGuard-->>Client: 401 Unauthorized
    end
```
