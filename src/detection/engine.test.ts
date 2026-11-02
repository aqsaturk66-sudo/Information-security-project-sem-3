import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeUrl, isInternalOrPrivateHost } from './urlAnalyzer.ts';
import { analyzeEmail } from './emailAnalyzer.ts';

test('SSRF safety: blocks localhost and private networks', () => {
  assert.equal(isInternalOrPrivateHost('localhost'), true);
  assert.equal(isInternalOrPrivateHost('127.0.0.1'), true);
  assert.equal(isInternalOrPrivateHost('192.168.1.1'), true);
  assert.equal(isInternalOrPrivateHost('10.0.0.5'), true);
  assert.equal(isInternalOrPrivateHost('169.254.169.254'), true);
  assert.equal(isInternalOrPrivateHost('metadata.google.internal'), true);
  assert.equal(isInternalOrPrivateHost('google.com'), false);
  assert.equal(isInternalOrPrivateHost('phishshield.app'), false);

  assert.throws(() => {
    analyzeUrl('http://localhost:3000/admin');
  }, /Security restriction/);

  assert.throws(() => {
    analyzeUrl('http://169.254.169.254/latest/meta-data/');
  }, /Security restriction/);
});

test('URL Analyzer: detects IP-based phishing URLs', () => {
  const result = analyzeUrl('http://198.51.100.42/login.php');
  assert.equal(result.riskLevel, 'HIGH');
  assert.ok(result.riskScore >= 60);
  assert.ok(result.findings.some(f => f.ruleId === 'RAW_IP_HOSTNAME'));
  assert.ok(result.findings.some(f => f.ruleId === 'INSECURE_PROTOCOL'));
});

test('URL Analyzer: detects authority spoofing with @ symbol', () => {
  const result = analyzeUrl('https://paypal.com@attacker-controlled-server.com/login');
  assert.equal(result.riskLevel, 'HIGH');
  assert.ok(result.findings.some(f => f.ruleId === 'AUTHORITY_SPOOF_AT_SYMBOL'));
});

test('URL Analyzer: detects deceptive subdomains impersonating brands', () => {
  const result = analyzeUrl('https://paypal.com.verify-billing-update.com/signin');
  assert.equal(result.riskLevel, 'HIGH');
  assert.ok(result.findings.some(f => f.ruleId === 'BRAND_IMPERSONATION_SUBDOMAIN'));
  assert.ok(result.findings.some(f => f.ruleId === 'SENSITIVE_ACTION_KEYWORDS'));
});

test('URL Analyzer: detects URL shorteners and high-abuse TLDs', () => {
  const shortener = analyzeUrl('https://bit.ly/3xY9zQ');
  assert.ok(shortener.findings.some(f => f.ruleId === 'URL_SHORTENER_DETECTED'));

  const badTld = analyzeUrl('http://update-secure-account.xyz/index');
  assert.ok(badTld.findings.some(f => f.ruleId === 'HIGH_ABUSE_TLD'));
  assert.equal(badTld.riskLevel, 'HIGH');
});

test('URL Analyzer: normalizes legit clean domain with low risk', () => {
  const clean = analyzeUrl('https://docs.github.com/en/get-started');
  assert.equal(clean.riskLevel, 'LOW');
  assert.ok(clean.riskScore < 25);
  assert.equal(clean.safeToVisit, true);
});

test('Email Analyzer: detects credential harvesting and OTP theft', () => {
  const emailText = `
    Dear Customer,
    Your account will be suspended within 24 hours due to suspicious activity.
    Please reply with your current password and your 6-digit OTP verification code immediately.
  `;
  const result = analyzeEmail('Urgent: Account Suspended', emailText);
  assert.equal(result.riskLevel, 'HIGH');
  assert.ok(result.riskScore >= 70);
  assert.equal(result.detectedIndicators.hasCredentialRequest, true);
  assert.equal(result.detectedIndicators.hasOtpRequest, true);
  assert.equal(result.detectedIndicators.hasUrgentLanguage, true);
  assert.equal(result.detectedIndicators.hasGenericGreeting, true);
});

test('Email Analyzer: detects BEC invoice scam with fake phone / wire transfer', () => {
  const emailText = `
    Attention Sir/Madam,
    Your Geek Squad renewal has charged $499 to your credit card.
    If you did not authorize this wire transfer, call our support desk to claim your refund.
    See attached invoice.zip.
  `;
  const result = analyzeEmail('Geek Squad Invoice Overdue', emailText);
  assert.equal(result.riskLevel, 'HIGH');
  assert.equal(result.detectedIndicators.hasFinancialLure, true);
  assert.equal(result.detectedIndicators.hasSuspiciousAttachments, true);
});

test('Email Analyzer: identifies normal conversational message as low risk', () => {
  const emailText = `
    Hi Sarah,
    Looking forward to our sync meeting tomorrow at 10 AM.
    The project presentation slides are ready for review.
    Let me know if you need any changes.
  `;
  const result = analyzeEmail('Team sync tomorrow', emailText);
  assert.equal(result.riskLevel, 'LOW');
  assert.ok(result.riskScore < 25);
});
