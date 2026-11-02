/**
 * Deterministic Rule-Based Email Phishing Detection Engine
 * Privacy-first: analyzes text heuristics without transmitting email content to third parties.
 */

import { EmailAnalysisResult, Finding, RiskLevel } from '../types/index.ts';

interface PatternRule {
  id: string;
  ruleId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  penalty: number;
  pattern: RegExp;
  description: string;
  recommendation: string;
  flagField?: keyof EmailAnalysisResult['detectedIndicators'];
}

const EMAIL_PATTERNS: PatternRule[] = [
  // 1. Password & Credential Requests
  {
    id: 'RULE-PWD-REQ',
    ruleId: 'CREDENTIAL_HARVESTING_LURE',
    title: 'Explicit Request for Password or Login Credentials',
    severity: 'CRITICAL',
    penalty: 50,
    pattern: /(enter|reply\s+with|provide|confirm|update|verify|send|input|share)\s+(?:[\w\s]{0,25})?(password|passcode|pin|secret\s+key|private\s+key|login\s+details|credentials)/i,
    description: 'Legitimate organizations, banks, and technology providers will NEVER ask you to disclose your password, PIN, or private security keys via email.',
    recommendation: 'Never type or send passwords in response to an email. Treat this message as a credential harvesting attempt.',
    flagField: 'hasCredentialRequest'
  },

  // 2. Multi-Factor / OTP Theft
  {
    id: 'RULE-OTP-THEFT',
    ruleId: 'OTP_INTERCEPTION_ATTEMPT',
    title: 'Request for One-Time Passcode (OTP) or Verification Code',
    severity: 'CRITICAL',
    penalty: 50,
    pattern: /(one-time\s+password|otp|verification\s+code|2fa\s+code|security\s+code|authentication\s+pin|6-digit\s+code|sms\s+code)/i,
    description: 'The email prompts for a verification code or OTP. Attackers who have already acquired your password use this tactic to hijack your account in real-time by stealing your two-factor token.',
    recommendation: 'Never share authentication codes with anyone. OTP codes are meant exclusively for direct entry into your known authenticator prompt.',
    flagField: 'hasOtpRequest'
  },

  // 3. Urgent or Threatening Language / Fake Deadlines
  {
    id: 'RULE-URGENCY-FEAR',
    ruleId: 'PSYCHOLOGICAL_URGENCY_PRESSURE',
    title: 'High-Urgency Coercive Language & Artificial Deadlines',
    severity: 'HIGH',
    penalty: 30,
    pattern: /(within\s+(24|48|12)\s+hours|immediately|immediate\s+action\s+required|urgent\s+action|account\s+will\s+be\s+(closed|suspended|locked|terminated|deleted)|legal\s+action|arrest\s+warrant|penalty\s+fee|final\s+notice|last\s+warning)/i,
    description: 'The email utilizes aggressive urgency, fear, or impending disciplinary/legal action to bypass logical skepticism and force rapid, uncritical clicking.',
    recommendation: 'Take a breath. Legitimate critical issues rarely give 24-hour ultimatums via unsolicited email. Independently contact the organization using an established channel.',
    flagField: 'hasUrgentLanguage'
  },

  // 4. Fake Account Suspension / Security Alert
  {
    id: 'RULE-ACCOUNT-ALERT',
    ruleId: 'DECEPTIVE_SECURITY_ALERT',
    title: 'Fabricated Account Suspension or Security Breach Notification',
    severity: 'HIGH',
    penalty: 25,
    pattern: /(suspicious\s+activity\s+detected|unauthorized\s+sign-in|unauthorized\s+transaction|account\s+has\s+been\s+restricted|security\s+alert|failed\s+login\s+attempt|verify\s+your\s+identity\s+now)/i,
    description: 'Attackers create fake security panic claiming your account was compromised or restricted, tricking you into clicking their fake "Unlock" or "Verify" link.',
    recommendation: 'Do not click the link in the email. Instead, open a new browser tab, go directly to the service provider, and log in to inspect official notifications in your account center.',
    flagField: 'hasBrandImpersonation'
  },

  // 5. Payment Lure / Fake Invoices / Wire Transfers (BEC)
  {
    id: 'RULE-PAYMENT-BEC',
    ruleId: 'FINANCIAL_WIRE_OR_INVOICE_LURE',
    title: 'Financial Lure: Unsolicited Invoices, Wire Transfers or Gift Cards',
    severity: 'HIGH',
    penalty: 30,
    pattern: /(overdue\s+invoice|wire\s+transfer|remittance\s+advice|purchase\s+order\s+attached|direct\s+deposit|gift\s+card|apple\s+gift\s+card|steam\s+card|cryptocurrency\s+payment|bitcoin\s+transfer|geek\s+squad|norton\s+renewal|mcafee\s+auto-renewal|charged\s+\$\d{2,4})/i,
    description: 'Common Business Email Compromise (BEC) and refund scam lure. The email claims you will be charged hundreds of dollars unless you call a fake support number or authorize an urgent wire transfer.',
    recommendation: 'Do not call telephone numbers provided inside suspicious emails. Check your credit card or bank portal directly to verify whether any charge actually exists.',
    flagField: 'hasFinancialLure'
  },

  // 6. Lottery, Prize, or Inheritance Scams
  {
    id: 'RULE-LOTTERY-SCAM',
    ruleId: 'ADVANCE_FEE_PRIZE_SCAM',
    title: 'Unrealistic Prize, Lottery, or Inheritance Claim',
    severity: 'HIGH',
    penalty: 35,
    pattern: /(congratulations!|you\s+have\s+won|lottery\s+winner|million\s+dollars|beneficiary|inheritance\s+fund|claim\s+your\s+prize|exclusive\s+reward|crypto\s+giveaway)/i,
    description: 'Advance-fee scam pattern. Attackers promise millions of dollars or prizes in exchange for "processing fees" or bank account verification.',
    recommendation: 'You cannot win a lottery or prize you never entered. Delete this message immediately.',
    flagField: 'hasFinancialLure'
  },

  // 7. Generic Greetings (Impersonal)
  {
    id: 'RULE-GENERIC-GREETING',
    ruleId: 'IMPERSONAL_GENERIC_GREETING',
    title: 'Impersonal Generic Salutation Detected',
    severity: 'LOW',
    penalty: 15,
    pattern: /(?:^|\n)\s*(dear\s+(customer|user|client|member|account\s+holder|valued\s+customer|friend)|attention\s+sir\/madam|hello\s+dear)/i,
    description: 'Mass phishing kits broadcast emails to millions of recipients without knowing individual names, relying on impersonal placeholders like "Dear Customer". Organizations you do business with usually address you by your actual registered name.',
    recommendation: 'Compare this greeting against legitimate past billing emails from the same organization.',
    flagField: 'hasGenericGreeting'
  },

  // 8. Brand Impersonation In Text
  {
    id: 'RULE-BRAND-IMPERSONATION',
    ruleId: 'HIGH_PROFILE_BRAND_IMPERSONATION',
    title: 'Brand Impersonation Markers in Message Body',
    severity: 'MEDIUM',
    penalty: 20,
    pattern: /(paypal\s+security\s+team|microsoft\s+account\s+team|apple\s+support\s+desk|google\s+security\s+operations|dhl\s+express\s+delivery|usps\s+tracking|federal\s+reserve|internal\s+revenue\s+service|irs\s+refund)/i,
    description: 'The email cites reputable multinational institutions known to be among the most heavily spoofed brands globally.',
    recommendation: 'Scrutinize the real sender email address domain (the part after @) to check if it matches the legitimate company domain.',
    flagField: 'hasBrandImpersonation'
  },

  // 9. Suspicious Attachment References
  {
    id: 'RULE-ATTACHMENT-LURE',
    ruleId: 'MALICIOUS_ATTACHMENT_LURE',
    title: 'Dangerous Attachment Lure Mentioned in Text',
    severity: 'HIGH',
    penalty: 30,
    pattern: /(see\s+the\s+attached|attached\s+(zip|iso|exe|scr|vbs|html|rar|macro|document|invoice|receipt)|open\s+the\s+attachment|enable\s+macros|enable\s+editing)/i,
    description: 'The email urges the recipient to download or open an attachment, or prompts the user to enable macros. Malicious Office files and compressed archives are primary delivery vehicles for ransomware and spyware.',
    recommendation: 'Never open attachments from unexpected emails. Never click "Enable Content" or "Enable Macros" on downloaded documents.',
    flagField: 'hasSuspiciousAttachments'
  },

  // 10. Deceptive Action Links Mentioned
  {
    id: 'RULE-CLICK-HERE',
    ruleId: 'VAGUE_CALL_TO_ACTION_LINK',
    title: 'Vague Call-To-Action Link ("Click Here", "Update Now")',
    severity: 'MEDIUM',
    penalty: 15,
    pattern: /(click\s+here\s+to\s+(verify|update|unlock|restore|login)|follow\s+this\s+link|visit\s+the\s+link\s+below|click\s+the\s+button\s+below)/i,
    description: 'Urging users to click generic hyperlinks masks the true destination URL behind friendly display text.',
    recommendation: 'Hover over the link without clicking to inspect the true destination address shown in the browser or mail client status bar.',
    flagField: 'hasSuspiciousLinks'
  }
];

export function analyzeEmail(subject: string | undefined, body: string): EmailAnalysisResult {
  const cleanBody = (body || '').trim();
  const cleanSubject = (subject || '').trim();

  if (!cleanBody && !cleanSubject) {
    throw new Error('Please enter email content or an email subject to analyze.');
  }

  const combinedText = `${cleanSubject}\n\n${cleanBody}`;
  const findings: Finding[] = [];
  const recommendations: string[] = [];
  let totalPenalty = 0;

  const detectedIndicators = {
    hasUrgentLanguage: false,
    hasCredentialRequest: false,
    hasOtpRequest: false,
    hasSuspiciousLinks: false,
    hasSuspiciousAttachments: false,
    hasGenericGreeting: false,
    hasBrandImpersonation: false,
    hasFinancialLure: false
  };

  // Evaluate all heuristic pattern rules
  for (const rule of EMAIL_PATTERNS) {
    if (rule.pattern.test(combinedText)) {
      totalPenalty += rule.penalty;
      findings.push({
        id: rule.id,
        ruleId: rule.ruleId,
        title: rule.title,
        severity: rule.severity,
        description: rule.description,
        recommendation: rule.recommendation
      });

      if (rule.flagField) {
        detectedIndicators[rule.flagField] = true;
      }
    }
  }

  // Look for raw embedded URLs in text
  const urlMatches = combinedText.match(/https?:\/\/[^\s]+/gi) || [];
  if (urlMatches.length > 0) {
    detectedIndicators.hasSuspiciousLinks = true;
    findings.push({
      id: 'RULE-EMBEDDED-LINKS',
      ruleId: 'EMBEDDED_HYPERLINKS_FOUND',
      title: `${urlMatches.length} Embedded Hyperlink(s) Identified in Email Body`,
      severity: urlMatches.length > 3 ? 'HIGH' : 'MEDIUM',
      description: `The email contains ${urlMatches.length} explicit link(s). Always analyze each destination link with the PhishShield URL Analyzer before interacting.`,
      recommendation: 'Copy the destination URL safely and scan it in PhishShield\'s URL Phishing Analyzer.'
    });
    totalPenalty += Math.min(25, urlMatches.length * 8);
  }

  // Cap score between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(0, totalPenalty));

  let riskLevel: RiskLevel = 'LOW';
  if (finalRiskScore >= 60) {
    riskLevel = 'HIGH';
  } else if (finalRiskScore >= 25) {
    riskLevel = 'SUSPICIOUS';
  } else {
    riskLevel = 'LOW';
  }

  // Build recommendations
  if (riskLevel === 'HIGH') {
    recommendations.push('Do NOT reply to this email or communicate with the sender.');
    recommendations.push('Do NOT click any links, open attachments, or call phone numbers in the message.');
    recommendations.push('Report this message as Phishing in your email client (e.g. Gmail/Outlook) to update spam filters.');
    recommendations.push('If you already clicked a link or sent credentials, reset your password immediately and contact your IT administrator.');
  } else if (riskLevel === 'SUSPICIOUS') {
    recommendations.push('Exercise caution. Contact the supposed sender via a known trusted phone number or new email thread.');
    recommendations.push('Verify whether you were genuinely anticipating this transaction or message.');
    recommendations.push('Scan any specific links in this email using the PhishShield URL Analyzer.');
  } else {
    recommendations.push('No obvious high-severity phishing signatures were detected in this text.');
    recommendations.push('Note that text-only analysis cannot verify the true identity of the sender or mail server reputation.');
    recommendations.push('Always confirm the authenticity of unexpected requests, especially those involving funds or credentials.');
  }

  // Generate privacy-conscious preview summary (do NOT store entire sensitive body)
  const previewSummary = cleanSubject
    ? `Subject: "${cleanSubject.slice(0, 60)}${cleanSubject.length > 60 ? '...' : ''}"`
    : `Body excerpt: "${cleanBody.slice(0, 60)}${cleanBody.length > 60 ? '...' : ''}"`;

  return {
    subject: cleanSubject || undefined,
    previewSummary,
    riskLevel,
    riskScore: finalRiskScore,
    findings,
    recommendations,
    detectedIndicators,
    analyzedAt: new Date().toISOString(),
    scanType: 'email'
  };
}
