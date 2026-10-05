import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './shared/config/env.config';
import { generalLimiter } from './shared/middlewares/rateLimiter.middleware';
import { notFoundHandler } from './shared/middlewares/notFound.middleware';
import { errorHandler } from './shared/middlewares/error.middleware';
import { ApiResponse } from './shared/utils/apiResponse';
import authRoutes from './features/auth/auth.routes';
import friendsRoutes from './features/friends/friends.routes';
import ludoRoutes from './features/ludo/ludo.routes';

const app: Application = express();

// Trust reverse proxy (Nginx) for accurate IP resolution in rate limiting
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://dicey.in',
  'http://dicey.in',
  'https://www.dicey.in',
  'http://www.dicey.in',
  env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.dicey.in') ||
        origin.endsWith('.onrender.com') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for JWT tokens stored in HttpOnly cookies
app.use(cookieParser());

// HTTP request logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Global API Rate Limiter
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  return ApiResponse.success(res, 'Dicey Backend Service is healthy and operational', {
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Feature Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/friends', friendsRoutes);
app.use('/api/v1/ludo', ludoRoutes);

// Static Client Serving (Fullstack Single App)
const possibleClientPaths = [
  path.resolve(__dirname, '../client'),
  path.resolve(__dirname, '../../Frontend/dist'),
  path.resolve(process.cwd(), 'client'),
  path.resolve(process.cwd(), 'Frontend/dist'),
];

const clientPath = possibleClientPaths.find((p) => fs.existsSync(p));

if (clientPath) {
  app.use(express.static(clientPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    return res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// 404 Not Found Middleware (For API routes that don't match)
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
