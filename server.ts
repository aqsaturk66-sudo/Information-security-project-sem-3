/**
 * PhishShield Full-Stack Application Server
 * Express REST API backend integrated with Vite middlewares on Port 3000.
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeSeedData } from './server/db.ts';
import { authRouter } from './server/routes/authRoutes.ts';
import { analyzeRouter } from './server/routes/analyzeRoutes.ts';
import { scanRouter } from './server/routes/scanRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production' || (!process.env.NODE_ENV && fs.existsSync(path.resolve(__dirname, 'dist/index.html')));

const app = express();

// Initialize database tables and initial demo seeds
initializeSeedData();

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request body parser with payload size restriction (prevents body overflow DoS)
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// In-Memory Sliding-Window Rate Limiter for API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests per minute

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    next();
  } else if (clientData.count < MAX_REQUESTS_PER_WINDOW) {
    clientData.count++;
    next();
  } else {
    res.status(429).json({
      error: 'Rate limit exceeded. Too many requests from your network. Please wait a moment.',
      retryAfterSeconds: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Apply rate limiter to all /api routes
app.use('/api', rateLimiter);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'PhishShield Cyber Threat Engine',
    engineVersion: '2.4.0-enterprise',
    database: 'SQLite 3 (ACID WAL)',
    timestamp: new Date().toISOString()
  });
});

// Mount Core REST Endpoints
app.use('/api/auth', authRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api', scanRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal cybersecurity engine error.',
    code: 'INTERNAL_ERROR'
  });
});

// Vite middleware or Production Static File Serving
async function startServer() {
  if (!isProduction) {
    // Development mode: dynamically import Vite dev server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('Production build folder dist/ not found. Run "npm run build" first.');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PhishShield] Enterprise Security Engine active on port ${PORT}`);
    console.log(`[PhishShield] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
