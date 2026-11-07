/**
 * PhishShield Analysis API Routes
 * Static rule-based deterministic URL and Email scanners with persistent user record isolation.
 */

import { Router, type Response } from 'express';
import { analyzeUrl } from '../../src/detection/urlAnalyzer.ts';
import { analyzeEmail } from '../../src/detection/emailAnalyzer.ts';
import { db } from '../db.ts';
import type { AuthRequest } from '../auth.ts';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'phishshield_super_secure_jwt_secret_key_2026';

export const analyzeRouter = Router();

// Optional token extractor middleware for analysis routes
function optionalAuth(req: AuthRequest, _res: Response, next: () => void): void {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Ignore invalid optional token
    }
  }
  next();
}

// URL Phishing Analysis Endpoint
analyzeRouter.post('/url', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { url, saveToHistory } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({ error: 'Please submit a valid URL string to analyze.' });
      return;
    }

    // Execute deterministic rule-based analysis
    const result = analyzeUrl(url);

    let savedScanId: string | undefined;

    // Persist scan if user is authenticated and wishes to save
    if (req.user?.id && saveToHistory !== false) {
      savedScanId = `scn_url_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO scans (id, user_id, scan_type, input_summary, target_normalized, risk_level, risk_score, findings_json, recommendations_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        savedScanId,
        req.user.id,
        'url',
        result.targetUrl,
        result.normalizedUrl,
        result.riskLevel,
        result.riskScore,
        JSON.stringify(result.findings),
        JSON.stringify(result.recommendations),
        now
      );

      // Log event
      db.prepare(`
        INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `evt_${Date.now()}`,
        req.user.id,
        'URL_SCAN_PERFORMED',
        req.ip || '127.0.0.1',
        req.get('user-agent') || 'Unknown',
        now
      );
    }

    res.json({
      ...result,
      scanId: savedScanId,
      saved: Boolean(savedScanId)
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Failed to analyze URL.'
    });
  }
});

// Email Phishing Analysis Endpoint
analyzeRouter.post('/email', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { subject, body, saveToHistory } = req.body;

    if (!body && !subject) {
      res.status(400).json({ error: 'Please provide email text or subject to analyze.' });
      return;
    }

    // Execute deterministic rule-based analysis
    const result = analyzeEmail(subject, body);

    let savedScanId: string | undefined;

    // Persist scan if user is authenticated
    // Privacy-conscious storage: only store preview summary and findings, NOT sensitive email body!
    if (req.user?.id && saveToHistory !== false) {
      savedScanId = `scn_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO scans (id, user_id, scan_type, input_summary, target_normalized, risk_level, risk_score, findings_json, recommendations_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        savedScanId,
        req.user.id,
        'email',
        result.previewSummary,
        null,
        result.riskLevel,
        result.riskScore,
        JSON.stringify(result.findings),
        JSON.stringify(result.recommendations),
        now
      );

      db.prepare(`
        INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `evt_${Date.now()}`,
        req.user.id,
        'EMAIL_SCAN_PERFORMED',
        req.ip || '127.0.0.1',
        req.get('user-agent') || 'Unknown',
        now
      );
    }

    res.json({
      ...result,
      scanId: savedScanId,
      saved: Boolean(savedScanId)
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Failed to analyze email content.'
    });
  }
});
