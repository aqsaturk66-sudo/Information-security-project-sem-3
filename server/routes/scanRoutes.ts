/**
 * PhishShield Scan Management & Dashboard Statistics Routes
 * Strict user ownership verification on every database operation.
 */

import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, AuthRequest, hashPassword, comparePassword, validatePasswordStrength } from '../auth.ts';

export const scanRouter = Router();

// Retrieve Scan History for Current Authenticated User
scanRouter.get('/scans', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { type, risk, search, limit = '50', offset = '0' } = req.query;

    let query = 'SELECT * FROM scans WHERE user_id = ?';
    const params: any[] = [userId];

    if (type && type !== 'all') {
      query += ' AND scan_type = ?';
      params.push(type);
    }

    if (risk && risk !== 'all') {
      query += ' AND risk_level = ?';
      params.push(risk);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ' AND (input_summary LIKE ? OR target_normalized LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string, 10) || 50, parseInt(offset as string, 10) || 0);

    const rows = db.prepare(query).all(...params) as any[];

    const scans = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      scanType: row.scan_type,
      inputSummary: row.input_summary,
      targetNormalized: row.target_normalized,
      riskLevel: row.risk_level,
      riskScore: row.risk_score,
      findings: JSON.parse(row.findings_json || '[]'),
      recommendations: JSON.parse(row.recommendations_json || '[]'),
      createdAt: row.created_at
    }));

    res.json({ scans, count: scans.length });
  } catch (err: any) {
    console.error('Scan history fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve scan history.' });
  }
});

// Retrieve Single Scan Detail (with IDOR protection)
scanRouter.get('/scans/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const scanId = req.params.id;

    // Enforce ownership: user can ONLY view their own scan record
    const row = db.prepare('SELECT * FROM scans WHERE id = ? AND user_id = ?').get(scanId, userId) as any;

    if (!row) {
      res.status(404).json({ error: 'Scan record not found or access denied.' });
      return;
    }

    res.json({
      id: row.id,
      userId: row.user_id,
      scanType: row.scan_type,
      inputSummary: row.input_summary,
      targetNormalized: row.target_normalized,
      riskLevel: row.risk_level,
      riskScore: row.risk_score,
      findings: JSON.parse(row.findings_json || '[]'),
      recommendations: JSON.parse(row.recommendations_json || '[]'),
      createdAt: row.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch scan detail.' });
  }
});

// Delete Single Scan (with IDOR protection)
scanRouter.delete('/scans/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const scanId = req.params.id;

    const result = db.prepare('DELETE FROM scans WHERE id = ? AND user_id = ?').run(scanId, userId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Scan record not found or permission denied.' });
      return;
    }

    db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `evt_${Date.now()}`,
      userId,
      'SCAN_DELETED',
      req.ip || '127.0.0.1',
      req.get('user-agent') || 'Unknown',
      new Date().toISOString()
    );

    res.json({ message: 'Scan record deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete scan record.' });
  }
});

// Clear All Scans for Current User
scanRouter.delete('/scans', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;

    const result = db.prepare('DELETE FROM scans WHERE user_id = ?').run(userId);

    db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `evt_${Date.now()}`,
      userId,
      'ALL_SCANS_CLEARED',
      req.ip || '127.0.0.1',
      req.get('user-agent') || 'Unknown',
      new Date().toISOString()
    );

    res.json({
      message: 'All scan records cleared successfully.',
      recordsDeleted: result.changes
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear scan history.' });
  }
});

// Real-Time Dashboard Statistics (Computed directly from actual user records)
scanRouter.get('/dashboard/stats', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;

    // Total Scans
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM scans WHERE user_id = ?');
    const totalScans = (totalStmt.get(userId) as any).count;

    // Total URLs & Emails
    const urlStmt = db.prepare("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND scan_type = 'url'");
    const totalUrlScans = (urlStmt.get(userId) as any).count;

    const emailStmt = db.prepare("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND scan_type = 'email'");
    const totalEmailScans = (emailStmt.get(userId) as any).count;

    // Risk Levels
    const highStmt = db.prepare("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND risk_level = 'HIGH'");
    const highRiskCount = (highStmt.get(userId) as any).count;

    const suspStmt = db.prepare("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND risk_level = 'SUSPICIOUS'");
    const suspiciousCount = (suspStmt.get(userId) as any).count;

    const lowStmt = db.prepare("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND risk_level = 'LOW'");
    const lowRiskCount = (lowStmt.get(userId) as any).count;

    // Average Score
    const avgStmt = db.prepare('SELECT AVG(risk_score) as avgScore FROM scans WHERE user_id = ?');
    const avgScoreResult = avgStmt.get(userId) as any;
    const averageRiskScore = avgScoreResult?.avgScore ? Math.round(avgScoreResult.avgScore) : 0;

    // Recent 5 Scans
    const recentRows = db.prepare(`
      SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `).all(userId) as any[];

    const recentScans = recentRows.map(row => ({
      id: row.id,
      userId: row.user_id,
      scanType: row.scan_type,
      inputSummary: row.input_summary,
      targetNormalized: row.target_normalized,
      riskLevel: row.risk_level,
      riskScore: row.risk_score,
      findings: JSON.parse(row.findings_json || '[]'),
      recommendations: JSON.parse(row.recommendations_json || '[]'),
      createdAt: row.created_at
    }));

    // Risk Distribution for Recharts
    const riskDistribution = [
      { name: 'Low Risk', value: lowRiskCount, color: '#10b981' },
      { name: 'Suspicious', value: suspiciousCount, color: '#f59e0b' },
      { name: 'High Risk', value: highRiskCount, color: '#ef4444' }
    ];

    // Activity over time (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const activityRows = db.prepare(`
      SELECT substr(created_at, 1, 10) as day,
             COUNT(*) as total,
             SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as highCount
      FROM scans
      WHERE user_id = ? AND created_at >= ?
      GROUP BY day
      ORDER BY day ASC
    `).all(userId, sevenDaysAgo) as any[];

    const activityOverTime = activityRows.map(row => ({
      date: row.day,
      scans: row.total,
      highRisk: row.highCount || 0
    }));

    res.json({
      totalScans,
      totalUrlScans,
      totalEmailScans,
      highRiskCount,
      suspiciousCount,
      lowRiskCount,
      averageRiskScore,
      recentScans,
      riskDistribution,
      activityOverTime
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to compute dashboard statistics.' });
  }
});

// Profile Management Endpoint
scanRouter.get('/profile', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const user = db.prepare('SELECT id, email, display_name, email_verified, created_at FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    // Fetch recent security events
    const events = db.prepare('SELECT id, event_type, ip_address, timestamp FROM security_events WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10').all(userId);

    res.json({
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        emailVerified: Boolean(user.email_verified),
        createdAt: user.created_at
      },
      auditLog: events
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// Update Profile Information & Password
scanRouter.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { displayName, currentPassword, newPassword } = req.body;
    const now = new Date().toISOString();

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to set a new password.' });
        return;
      }

      const match = await comparePassword(currentPassword, user.password_hash);
      if (!match) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }

      const check = validatePasswordStrength(newPassword);
      if (!check.valid) {
        res.status(400).json({ error: check.message || 'New password does not meet security requirements.' });
        return;
      }

      const newHash = await hashPassword(newPassword);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, userId);

      db.prepare(`
        INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `evt_${Date.now()}`,
        userId,
        'PASSWORD_CHANGED',
        req.ip || '127.0.0.1',
        req.get('user-agent') || 'Unknown',
        now
      );
    }

    // Update display name if provided
    if (displayName && typeof displayName === 'string' && displayName.trim().length >= 2) {
      db.prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?').run(displayName.trim(), now, userId);
    }

    res.json({ message: 'Profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Secure Account Deletion
scanRouter.delete('/profile', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    // SQLite CASCADE handles deletion of scans and security_events automatically
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'Your account and all associated scan data have been permanently removed.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});
