/**
 * PhishShield Authentication REST Routes
 */

import { Router, type Request, type Response } from 'express';
import { db } from '../db.ts';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateAuthToken,
  generateCryptoToken,
  authenticateToken,
  type AuthRequest
} from '../auth.ts';

export const authRouter = Router();

// Registration Endpoint
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, confirmPassword, displayName, termsAccepted } = req.body;

    if (!termsAccepted) {
      res.status(400).json({ error: 'You must accept the PhishShield Security & Privacy Terms.' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2) {
      res.status(400).json({ error: 'Full name must be at least 2 characters.' });
      return;
    }

    if (!password || password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      res.status(400).json({ error: passwordCheck.message || 'Password does not meet cybersecurity requirements.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const passwordHash = await hashPassword(password);
    const verificationToken = generateCryptoToken();
    const now = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, display_name, password_hash, email_verified, verification_token, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?)
    `);

    insertUser.run(
      userId,
      normalizedEmail,
      displayName.trim(),
      passwordHash,
      verificationToken,
      now,
      now
    );

    // Record security audit event
    const logEvent = db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    logEvent.run(
      `evt_${Date.now()}`,
      userId,
      'USER_REGISTERED',
      req.ip || '127.0.0.1',
      req.get('user-agent') || 'Unknown',
      now
    );

    const userPayload = {
      id: userId,
      email: normalizedEmail,
      displayName: displayName.trim(),
      emailVerified: false
    };

    const token = generateAuthToken(userPayload);

    res.status(201).json({
      message: 'Account created successfully. Please verify your email.',
      token,
      user: {
        ...userPayload,
        createdAt: now
      },
      verificationToken
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during account registration. Please try again.' });
  }
});

// Login Endpoint
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      // Log failed login event
      const logEvent = db.prepare(`
        INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      logEvent.run(
        `evt_${Date.now()}`,
        user.id,
        'LOGIN_FAILED',
        req.ip || '127.0.0.1',
        req.get('user-agent') || 'Unknown',
        new Date().toISOString()
      );

      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Log success
    const logEvent = db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    logEvent.run(
      `evt_${Date.now()}`,
      user.id,
      'LOGIN_SUCCESS',
      req.ip || '127.0.0.1',
      req.get('user-agent') || 'Unknown',
      new Date().toISOString()
    );

    const userPayload = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      emailVerified: Boolean(user.email_verified)
    };

    const token = generateAuthToken(userPayload);

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        ...userPayload,
        createdAt: user.created_at
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

// Current User Profile Endpoint
authRouter.get('/me', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const user = db.prepare('SELECT id, email, display_name, email_verified, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        emailVerified: Boolean(user.email_verified),
        createdAt: user.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Email Verification Endpoint
authRouter.post('/verify-email', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const now = new Date().toISOString();

    db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, userId);

    db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `evt_${Date.now()}`,
      userId,
      'EMAIL_VERIFIED',
      req.ip || '127.0.0.1',
      req.get('user-agent') || 'Unknown',
      now
    );

    res.json({
      message: 'Email address verified successfully.',
      emailVerified: true
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify email address.' });
  }
});

// Forgot Password Endpoint (Safe response to prevent user enumeration)
authRouter.post('/forgot-password', (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail) as any;

    let resetToken: string | undefined;
    if (user) {
      resetToken = generateCryptoToken();
      const expiresAt = Date.now() + 3600000; // 1 hour
      db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(resetToken, expiresAt, user.id);

      db.prepare(`
        INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `evt_${Date.now()}`,
        user.id,
        'PASSWORD_RESET_REQUESTED',
        req.ip || '127.0.0.1',
        req.get('user-agent') || 'Unknown',
        new Date().toISOString()
      );
    }

    // Always return safe affirmative response
    res.json({
      message: 'If an account exists with this email address, a password reset link has been dispatched.',
      // Provide demo reset token for offline demonstration ease
      demoResetToken: resetToken
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Password recovery service unavailable.' });
  }
});

// Reset Password Endpoint
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Reset token and new password are required.' });
      return;
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      res.status(400).json({ error: passwordCheck.message || 'Password does not meet complexity standards.' });
      return;
    }

    const user = db.prepare('SELECT id, reset_token_expires FROM users WHERE reset_token = ?').get(token) as any;

    if (!user || user.reset_token_expires < Date.now()) {
      res.status(400).json({ error: 'This password reset link is invalid or has expired. Please request a new one.' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = ? WHERE id = ?')
      .run(passwordHash, now, user.id);

    db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `evt_${Date.now()}`,
      user.id,
      'PASSWORD_RESET_COMPLETED',
      req.ip || '127.0.0.1',
      req.get('user-agent') || 'Unknown',
      now
    );

    res.json({ message: 'Password has been reset successfully. You may now sign in with your new password.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to complete password reset.' });
  }
});
