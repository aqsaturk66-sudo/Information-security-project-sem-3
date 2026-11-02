/**
 * PhishShield Persistent Database Service
 * Powered by Node.js 22 built-in DatabaseSync (SQLite) with full ACID durability.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_FILE = path.resolve(process.cwd(), 'phishshield.db');

// Initialize SQLite connection
export const db = new DatabaseSync(DB_FILE);

// Set WAL mode and foreign keys for high performance & integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scan_type TEXT NOT NULL,
    input_summary TEXT NOT NULL,
    target_normalized TEXT,
    risk_level TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    findings_json TEXT NOT NULL,
    recommendations_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS security_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  CREATE INDEX IF NOT EXISTS idx_scans_user_created ON scans (user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_events_user ON security_events (user_id, timestamp DESC);
`);

/**
 * Seed initial accounts and initial verified scans if database is fresh
 */
export function initializeSeedData(): void {
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCountResult = userCountStmt.get() as { count: number };

  if (userCountResult.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password@123', salt);
    const now = new Date();
    const demoUserId = 'usr_demo_cyber_analyst_01';

    // Seed primary demo user
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, display_name, password_hash, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `);

    insertUser.run(
      demoUserId,
      'demo@phishshield.security',
      'Cyber Defense Lead',
      demoPasswordHash,
      now.toISOString(),
      now.toISOString()
    );

    // Also register user's email if provided in metadata for convenience
    const userEmail = 'aqsaturk66@gmail.com';
    const userSeedId = 'usr_primary_admin_02';
    insertUser.run(
      userSeedId,
      userEmail,
      'Security Operations Manager',
      demoPasswordHash,
      now.toISOString(),
      now.toISOString()
    );

    // Seed realistic security scans for demoUserId
    const insertScan = db.prepare(`
      INSERT INTO scans (id, user_id, scan_type, input_summary, target_normalized, risk_level, risk_score, findings_json, recommendations_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Phishing URL scan (Paypal impersonation)
    insertScan.run(
      'scn_url_sample_01',
      demoUserId,
      'url',
      'https://paypal-account-verify.xyz/update-login',
      'https://paypal-account-verify.xyz/update-login',
      'HIGH',
      85,
      JSON.stringify([
        {
          id: 'FIND-IMPERSONATION-PAYPAL',
          ruleId: 'BRAND_IMPERSONATION_SUBDOMAIN',
          title: 'Brand Impersonation Detected: Target "PayPal"',
          severity: 'CRITICAL',
          description: 'The hostname contains the trademarked name "PayPal", but the actual registered domain is "paypal-account-verify.xyz", which is NOT affiliated with paypal.com.',
          evidence: 'paypal-account-verify.xyz',
          recommendation: 'Never type credentials here. Go to official paypal.com directly.'
        },
        {
          id: 'FIND-SUSPICIOUS-TLD',
          ruleId: 'HIGH_ABUSE_TLD',
          title: 'High-Abuse Top-Level Domain Detected (.xyz)',
          severity: 'HIGH',
          description: 'The top-level domain .xyz is frequently registered for disposable phishing landing sites.',
          evidence: 'TLD: .xyz',
          recommendation: 'Treat this address with extreme suspicion.'
        }
      ]),
      JSON.stringify([
        'DO NOT enter usernames, passwords, phone numbers, or credit card information.',
        'Do NOT download or open any attachments.',
        'Report this URL to abuse@paypal.com.'
      ]),
      new Date(Date.now() - 3600000 * 2).toISOString()
    );

    // 2. Email Phishing scan (Urgent Geek Squad BEC)
    insertScan.run(
      'scn_email_sample_02',
      demoUserId,
      'email',
      'Subject: "Urgent: Geek Squad Auto-Renewal Charge $499.00"',
      null,
      'HIGH',
      80,
      JSON.stringify([
        {
          id: 'RULE-PAYMENT-BEC',
          ruleId: 'FINANCIAL_WIRE_OR_INVOICE_LURE',
          title: 'Financial Lure: Unsolicited Invoices, Wire Transfers or Gift Cards',
          severity: 'HIGH',
          description: 'The email claims you will be charged hundreds of dollars for a subscription renewal.',
          recommendation: 'Do not call telephone numbers provided inside suspicious emails.'
        },
        {
          id: 'RULE-URGENCY-FEAR',
          ruleId: 'PSYCHOLOGICAL_URGENCY_PRESSURE',
          title: 'High-Urgency Coercive Language & Artificial Deadlines',
          severity: 'HIGH',
          description: 'Urgent ultimatums designed to induce panic.',
          recommendation: 'Check your official bank portal directly.'
        }
      ]),
      JSON.stringify([
        'Do NOT reply to this email or communicate with the sender.',
        'Do NOT call phone numbers printed in the message.',
        'Report this message as Phishing in your email client.'
      ]),
      new Date(Date.now() - 3600000 * 5).toISOString()
    );

    // 3. Legitimate URL scan
    insertScan.run(
      'scn_url_sample_03',
      demoUserId,
      'url',
      'https://github.com/torvalds/linux',
      'https://github.com/torvalds/linux',
      'LOW',
      0,
      JSON.stringify([
        {
          id: 'FIND-HTTPS',
          ruleId: 'HTTPS_AVAILABLE',
          title: 'HTTPS Protocol Enabled (TLS/SSL)',
          severity: 'INFO',
          description: 'The connection uses HTTPS encryption.',
          recommendation: 'Remember that SSL certificates encrypt traffic in transit.'
        }
      ]),
      JSON.stringify([
        'No high-severity indicators were identified.',
        'Remember that PhishShield provides static risk assessments.'
      ]),
      new Date(Date.now() - 3600000 * 12).toISOString()
    );

    // Also mirror seed scans to userSeedId so the user sees real activity immediately upon logging into their email account
    insertScan.run(
      'scn_url_sample_11',
      userSeedId,
      'url',
      'https://apple-id-verify.support-device.top/login',
      'https://apple-id-verify.support-device.top/login',
      'HIGH',
      90,
      JSON.stringify([
        {
          id: 'FIND-IMPERSONATION-APPLE',
          ruleId: 'BRAND_IMPERSONATION_SUBDOMAIN',
          title: 'Brand Impersonation Detected: Target "Apple"',
          severity: 'CRITICAL',
          description: 'The hostname claims to be Apple but is hosted on disposable domain support-device.top.',
          evidence: 'support-device.top',
          recommendation: 'Do not enter Apple ID credentials.'
        }
      ]),
      JSON.stringify(['Never enter your Apple ID password here.']),
      new Date(Date.now() - 3600000 * 3).toISOString()
    );

    insertScan.run(
      'scn_email_sample_12',
      userSeedId,
      'email',
      'Subject: "Microsoft 365: 7 Pending Emails Kept on Hold"',
      null,
      'HIGH',
      75,
      JSON.stringify([
        {
          id: 'RULE-URGENCY-FEAR',
          ruleId: 'PSYCHOLOGICAL_URGENCY_PRESSURE',
          title: 'High-Urgency Coercive Language',
          severity: 'HIGH',
          description: 'Threatens that pending emails will be deleted unless logged in.',
          recommendation: 'Log into portal.office.com directly.'
        }
      ]),
      JSON.stringify(['Do not click the release messages button.']),
      new Date(Date.now() - 3600000 * 8).toISOString()
    );

    insertScan.run(
      'scn_url_sample_13',
      userSeedId,
      'url',
      'https://cloudflare.com/learning/security/what-is-phishing/',
      'https://cloudflare.com/learning/security/what-is-phishing/',
      'LOW',
      0,
      JSON.stringify([
        {
          id: 'FIND-HTTPS',
          ruleId: 'HTTPS_AVAILABLE',
          title: 'HTTPS Protocol Enabled (TLS/SSL)',
          severity: 'INFO',
          description: 'Legitimate encrypted connection.',
          recommendation: 'Safe browsing practice.'
        }
      ]),
      JSON.stringify(['Legitimate educational resource.']),
      new Date(Date.now() - 3600000 * 20).toISOString()
    );

    // Seed security events
    const insertEvent = db.prepare(`
      INSERT INTO security_events (id, user_id, event_type, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'evt_seed_01',
      demoUserId,
      'USER_REGISTERED',
      '127.0.0.1',
      'PhishShield Agent',
      now.toISOString()
    );

    insertEvent.run(
      'evt_seed_02',
      demoUserId,
      'EMAIL_VERIFIED',
      '127.0.0.1',
      'PhishShield Agent',
      now.toISOString()
    );

    insertEvent.run(
      'evt_seed_03',
      userSeedId,
      'USER_REGISTERED',
      '127.0.0.1',
      'PhishShield Agent',
      now.toISOString()
    );
  }
}
