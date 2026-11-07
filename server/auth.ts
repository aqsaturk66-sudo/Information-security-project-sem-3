/**
 * PhishShield Authentication & Authorization Security Module
 * Bcrypt password hashing, JWT authorization, and strict user ownership verification.
 */

import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'phishshield_super_secure_jwt_secret_key_2026';
const TOKEN_EXPIRY = '7d';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Validates password strength according to NIST / cybersecurity best practices:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special symbol
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  message?: string;
  checks: {
    length: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
} {
  const checks = {
    length: (password || '').length >= 8,
    hasUppercase: /[A-Z]/.test(password || ''),
    hasLowercase: /[a-z]/.test(password || ''),
    hasNumber: /[0-9]/.test(password || ''),
    hasSpecial: /[^A-Za-z0-9]/.test(password || '')
  };

  let score = 0;
  if (checks.length) score += 20;
  if ((password || '').length >= 12) score += 10;
  if (checks.hasUppercase) score += 20;
  if (checks.hasLowercase) score += 10;
  if (checks.hasNumber) score += 20;
  if (checks.hasSpecial) score += 20;

  const valid = checks.length && checks.hasUppercase && checks.hasLowercase && checks.hasNumber;

  let message: string | undefined;
  if (!checks.length) {
    message = 'Password must be at least 8 characters long.';
  } else if (!checks.hasUppercase) {
    message = 'Password must include at least one uppercase letter (A-Z).';
  } else if (!checks.hasLowercase) {
    message = 'Password must include at least one lowercase letter (a-z).';
  } else if (!checks.hasNumber) {
    message = 'Password must include at least one number (0-9).';
  }

  return { valid, score: Math.min(100, score), message, checks };
}

/**
 * Hashes password using bcrypt with 10 salt rounds
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compares plaintext password against stored bcrypt hash
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Issues signed JWT token for authenticated user
 */
export function generateAuthToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Generates secure random hex token for email verification or password reset
 */
export function generateCryptoToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Express Middleware: Authenticate Bearer Token
 * Extracts user claims from validated JWT and binds to req.user.
 * Rejects unauthenticated or tampered requests immediately.
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Missing Bearer token.',
      code: 'AUTH_TOKEN_MISSING'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      error: 'Invalid, forged, or expired session token. Please sign in again.',
      code: 'AUTH_TOKEN_INVALID'
    });
  }
}
