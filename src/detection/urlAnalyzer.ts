/**
 * Deterministic Rule-Based URL Phishing Detection Engine
 * Strictly static analysis: no external web requests, no SSRF, safe parsing.
 */

import type { Finding, RiskLevel, UrlAnalysisResult } from '../types/index.ts';

// Top abuse/free TLDs frequently used in mass phishing campaigns
const HIGH_ABUSE_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'top', 'xyz', 'work', 'click', 'buzz',
  'fit', 'surf', 'monster', 'quest', 'rest', 'cc', 'ru', 'su', 'icu'
]);

// Common URL shorteners used to conceal destination
const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly',
  'buff.ly', 'rb.gy', 'shorte.st', 'bc.vc', 'adf.ly', 'bl.ink'
]);

// Target brands frequently impersonated in phishing attacks
const MONITORED_BRANDS = [
  { name: 'PayPal', pattern: /paypal/i, legitDomain: 'paypal.com' },
  { name: 'Google', pattern: /google/i, legitDomain: 'google.com' },
  { name: 'Microsoft', pattern: /microsoft|office365|onedrive|outlook/i, legitDomain: 'microsoft.com' },
  { name: 'Apple', pattern: /apple|icloud/i, legitDomain: 'apple.com' },
  { name: 'Amazon', pattern: /amazon|prime/i, legitDomain: 'amazon.com' },
  { name: 'Netflix', pattern: /netflix/i, legitDomain: 'netflix.com' },
  { name: 'Facebook/Meta', pattern: /facebook|instagram|whatsapp/i, legitDomain: 'meta.com' },
  { name: 'Chase Bank', pattern: /chase/i, legitDomain: 'chase.com' },
  { name: 'Wells Fargo', pattern: /wellsfargo/i, legitDomain: 'wellsfargo.com' },
  { name: 'Bank of America', pattern: /bankofamerica/i, legitDomain: 'bankofamerica.com' },
  { name: 'Binance', pattern: /binance/i, legitDomain: 'binance.com' },
  { name: 'Coinbase', pattern: /coinbase/i, legitDomain: 'coinbase.com' },
  { name: 'Dropbox', pattern: /dropbox/i, legitDomain: 'dropbox.com' },
  { name: 'DocuSign', pattern: /docusign/i, legitDomain: 'docusign.com' }
];

// Sensitive security keywords
const SUSPICIOUS_KEYWORDS = [
  'verify', 'verification', 'login', 'signin', 'sign-in', 'log-in',
  'account', 'security', 'secure', 'banking', 'update', 'wallet',
  'recover', 'confirm', 'authentication', 'authenticate', 'billing',
  'password', 'credential', 'unlock', 'urgent', 'suspend'
];

// Calculate Shannon entropy to identify randomly generated domains (DGA)
function calculateEntropy(str: string): number {
  if (!str) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// Levenshtein distance for typosquatting detection
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Checks if host is an internal IP or reserved network (SSRF defense & safety)
export function isInternalOrPrivateHost(hostname: string): boolean {
  const cleanHost = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost === '::1' ||
    cleanHost === '0.0.0.0' ||
    cleanHost === 'metadata.google.internal' ||
    cleanHost === '169.254.169.254'
  ) {
    return true;
  }

  // IPv4 regex
  const ipv4Match = cleanHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, a, b] = ipv4Match.map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local
  }

  return false;
}

export function analyzeUrl(rawInput: string): UrlAnalysisResult {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    throw new Error('Please provide a URL to analyze.');
  }

  // Normalization: prepend protocol if missing
  let normalizedUrl = trimmed;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    // If input doesn't start with protocol, check if it starts with another protocol
    if (/^[a-zA-Z0-9+-.]+:\/\//i.test(normalizedUrl)) {
      // e.g. ftp:// or file://
      // Allow parse
    } else {
      normalizedUrl = `http://${normalizedUrl}`;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch (err) {
    throw new Error('Invalid URL format. Please verify the URL structure.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();
  const pathname = parsed.pathname;
  const search = parsed.search;
  const port = parsed.port;
  const fullHref = parsed.href;

  // SSRF and private network rejection check
  if (isInternalOrPrivateHost(hostname)) {
    throw new Error('Security restriction: Analysis of localhost, internal, loopback, and cloud metadata addresses is forbidden.');
  }

  const findings: Finding[] = [];
  const recommendations: string[] = [];
  let penaltyPoints = 0;

  // 1. Protocol Check (HTTP vs HTTPS)
  if (protocol === 'http:') {
    penaltyPoints += 20;
    findings.push({
      id: 'FIND-HTTP',
      ruleId: 'INSECURE_PROTOCOL',
      title: 'Unencrypted Insecure HTTP Protocol Used',
      severity: 'HIGH',
      description: 'The URL uses standard HTTP rather than encrypted HTTPS. Data transmitted to this website is unencrypted and susceptible to eavesdropping or man-in-the-middle manipulation.',
      evidence: `Protocol: ${protocol}`,
      recommendation: 'Do not enter passwords, payment cards, or sensitive data on unencrypted HTTP pages.'
    });
  } else if (protocol === 'https:') {
    findings.push({
      id: 'FIND-HTTPS',
      ruleId: 'HTTPS_AVAILABLE',
      title: 'HTTPS Protocol Enabled (TLS/SSL)',
      severity: 'INFO',
      description: 'The connection uses HTTPS encryption. Important caveat: over 80% of modern phishing websites also deploy free HTTPS certificates. HTTPS alone does NOT verify site trustworthiness.',
      evidence: `Protocol: ${protocol}`,
      recommendation: 'Remember that SSL certificates only encrypt traffic in transit; they do not authenticate the moral legitimacy of the website owner.'
    });
  }

  // 2. IP Address Used As Hostname
  const isIpv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(hostname);
  const isIpv6 = hostname.includes(':');
  if (isIpv4 || isIpv6) {
    penaltyPoints += 45;
    findings.push({
      id: 'FIND-IP-HOST',
      ruleId: 'RAW_IP_HOSTNAME',
      title: 'Raw IP Address Instead of Registered Domain Name',
      severity: 'CRITICAL',
      description: 'Legitimate consumer and enterprise services use registered brand domain names. Using a direct IP address bypasses domain reputation systems and is a very strong indicator of cyber threat infrastructure.',
      evidence: `Host: ${hostname}`,
      recommendation: 'Avoid visiting raw IP addresses unless explicitly intended for authorized internal administrative operations.'
    });
  }

  // 3. Authority Spoofing (@ Symbol in URL)
  if (rawInput.includes('@')) {
    penaltyPoints += 60;
    findings.push({
      id: 'FIND-AT-SYMBOL',
      ruleId: 'AUTHORITY_SPOOF_AT_SYMBOL',
      title: 'Deceptive Authentication Authority Symbol (@) Detected',
      severity: 'CRITICAL',
      description: 'In URL syntax, text before the "@" character is treated as user credentials and discarded by browsers, routing you directly to whatever host appears after the "@". Attackers use this to trick users (e.g., "paypal.com@attacker-site.com").',
      evidence: 'Contains "@" symbol in URL authority',
      recommendation: 'Do not open this URL. It is actively attempting to spoof a legitimate brand identity.'
    });
  }

  // 4. URL Shorteners
  if (URL_SHORTENERS.has(hostname)) {
    penaltyPoints += 25;
    findings.push({
      id: 'FIND-SHORTENER',
      ruleId: 'URL_SHORTENER_DETECTED',
      title: 'URL Shortening / Redirection Service Detected',
      severity: 'MEDIUM',
      description: `The URL utilizes a public link shortener (${hostname}). Attackers frequently leverage shortening services to conceal malicious landing domains from security filters and users.`,
      evidence: `Domain: ${hostname}`,
      recommendation: 'Use a link expander tool or request the full destination URL before navigating to shortened links.'
    });
  }

  // 5. Hostname Structure & Subdomains
  const hostParts = hostname.split('.');
  const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';
  const secondLevelDomain = hostParts.length >= 2 ? hostParts.slice(-2).join('.') : hostname;

  // Check Suspicious / High-Abuse TLDs
  if (HIGH_ABUSE_TLDS.has(tld)) {
    penaltyPoints += 25;
    findings.push({
      id: 'FIND-SUSPICIOUS-TLD',
      ruleId: 'HIGH_ABUSE_TLD',
      title: `High-Abuse Top-Level Domain Detected (.${tld})`,
      severity: 'HIGH',
      description: `The top-level domain .${tld} is historically associated with disproportionately elevated volumes of disposable spam, malware staging, and phishing campaigns due to minimal registry oversight.`,
      evidence: `TLD: .${tld}`,
      recommendation: 'Exercise heightened caution when dealing with unfamiliar or low-cost top-level domain extensions.'
    });
  }

  // Excessive Subdomains
  if (hostParts.length > 4) {
    penaltyPoints += 20;
    findings.push({
      id: 'FIND-EXCESSIVE-SUBDOMAINS',
      ruleId: 'EXCESSIVE_SUBDOMAINS',
      title: `Excessive Subdomain Stacking (${hostParts.length - 2} levels)`,
      severity: 'HIGH',
      description: 'The hostname contains an unusually deep tree of subdomains. Phishing kits frequently concatenate names like "login.secure.bank.verification.malicious.com" to push the true root domain off-screen on mobile devices.',
      evidence: `Hostname: ${hostname}`,
      recommendation: 'Always read the domain from right-to-left to determine the true primary registered domain name.'
    });
  }

  // 6. Misleading Subdomains & Brand Impersonation
  let brandImpersonated: string | null = null;
  for (const brand of MONITORED_BRANDS) {
    if (brand.pattern.test(hostname)) {
      // Check if the registered second-level domain is NOT the brand's legitimate domain
      if (!hostname.endsWith(brand.legitDomain)) {
        brandImpersonated = brand.name;
        penaltyPoints += 45;
        findings.push({
          id: `FIND-IMPERSONATION-${brand.name.toUpperCase().replace(/\W/g, '')}`,
          ruleId: 'BRAND_IMPERSONATION_SUBDOMAIN',
          title: `Brand Impersonation Detected: Target "${brand.name}"`,
          severity: 'CRITICAL',
          description: `The hostname contains the trademarked name "${brand.name}", but the actual registered domain is "${secondLevelDomain}", which is NOT affiliated with ${brand.legitDomain}. This is a textbook phishing structure.`,
          evidence: `Host: ${hostname} (Legitimate root: ${brand.legitDomain})`,
          recommendation: `Never provide credentials here. If you need ${brand.name}, manually type https://${brand.legitDomain} directly into your browser address bar.`
        });
        break;
      }
    }
  }

  // 7. Lookalike / Typosquatting Analysis (Levenshtein Distance)
  if (!brandImpersonated && hostParts.length >= 2) {
    const sldName = hostParts[hostParts.length - 2];
    for (const brand of MONITORED_BRANDS) {
      const legitBrandName = brand.legitDomain.split('.')[0];
      const dist = levenshteinDistance(sldName, legitBrandName);
      if (dist === 1 || (dist === 2 && sldName.length >= 6)) {
        penaltyPoints += 40;
        findings.push({
          id: `FIND-TYPOSQUAT-${brand.name.toUpperCase().replace(/\W/g, '')}`,
          ruleId: 'TYPOSQUATTING_DOMAIN',
          title: `Suspected Typosquatting Lookalike Domain (${brand.name})`,
          severity: 'HIGH',
          description: `The domain "${sldName}" closely mimics the recognized brand "${legitBrandName}" (edit distance of ${dist}). Attackers register lookalike domains to deceive users who mistype or fail to spot subtle character swaps.`,
          evidence: `Domain: ${secondLevelDomain} (Similar to ${brand.legitDomain})`,
          recommendation: 'Carefully verify character spelling. Bookmark trusted websites rather than following external links.'
        });
        break;
      }
    }
  }

  // 8. Punycode & Homoglyph Obfuscation
  if (hostname.includes('xn--')) {
    penaltyPoints += 35;
    findings.push({
      id: 'FIND-PUNYCODE',
      ruleId: 'PUNYCODE_HOMOGLYPH_ATTACK',
      title: 'Punycode / Internationalized Domain Name Detected',
      severity: 'HIGH',
      description: 'The domain starts with "xn--", signaling an Internationalized Domain Name (IDN). Attackers frequently exploit Cyrillic or Greek lookalike glyphs (e.g. Cyrillic "а" instead of Latin "a") to create visually identical fraudulent URLs.',
      evidence: `Punycode host: ${hostname}`,
      recommendation: 'Check the browser address bar for ASCII conversion to confirm the true alphabet used.'
    });
  }

  // 9. Excessive Hyphens in Domain
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    penaltyPoints += 20;
    findings.push({
      id: 'FIND-HYPHENS',
      ruleId: 'EXCESSIVE_HYPHENS',
      title: `Excessive Hyphens in Domain Name (${hyphenCount} found)`,
      severity: 'MEDIUM',
      description: 'Legitimate established services rarely concatenate multiple hyphens in their primary domain name. Phishing URLs frequently use hyphen chains like "account-update-login-verify.com" to stitch fake security terms.',
      evidence: `Hostname: ${hostname}`,
      recommendation: 'Inspect why the domain requires numerous hyphens to describe its identity.'
    });
  }

  // 10. URL Length Checks
  const fullLength = fullHref.length;
  if (fullLength > 120) {
    penaltyPoints += 20;
    findings.push({
      id: 'FIND-EXTREME-LENGTH',
      ruleId: 'ABNORMAL_URL_LENGTH',
      title: `Abnormally Long URL Structure (${fullLength} characters)`,
      severity: 'MEDIUM',
      description: 'The URL exceeds 120 characters in length. Excessively long URLs are routinely used by cybercriminals to bury malicious domains or append token tracking parameters that disguise the true payload destination.',
      evidence: `Length: ${fullLength} characters`,
      recommendation: 'Review query parameters for suspicious redirect targets or base64-encoded strings.'
    });
  } else if (fullLength > 75) {
    penaltyPoints += 10;
  }

  // 11. Suspicious Security Keywords in Subdomain or Path
  const fullSearchAndPath = `${hostname}${pathname}${search}`.toLowerCase();
  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter(kw => fullSearchAndPath.includes(kw));
  if (matchedKeywords.length >= 2) {
    const penalty = Math.min(30, matchedKeywords.length * 10);
    penaltyPoints += penalty;
    findings.push({
      id: 'FIND-KEYWORDS',
      ruleId: 'SENSITIVE_ACTION_KEYWORDS',
      title: `Multiple Credential/Urgency Keywords Detected (${matchedKeywords.slice(0, 4).join(', ')})`,
      severity: 'HIGH',
      description: `The URL contains keywords strongly associated with credential harvesting and urgent account action: [${matchedKeywords.slice(0, 5).join(', ')}].`,
      evidence: `Keywords matched: ${matchedKeywords.join(', ')}`,
      recommendation: 'If this page asks for your login credentials or 2FA code, do not enter them.'
    });
  }

  // 12. Unusual Port Numbers
  if (port && port !== '80' && port !== '443') {
    penaltyPoints += 20;
    findings.push({
      id: 'FIND-NONSTANDARD-PORT',
      ruleId: 'NONSTANDARD_PORT',
      title: `Non-Standard Network Port Detected (:${port})`,
      severity: 'MEDIUM',
      description: `The URL specifies a custom port :${port} rather than standard HTTP (80) or HTTPS (443). Phishing kits and command-and-control servers frequently run on non-standard ports to evade standard firewall egress filters.`,
      evidence: `Port: ${port}`,
      recommendation: 'Verify why the service requires connection through a non-standard port.'
    });
  }

  // 13. Double Extension or Executable in Path
  const dangerousExtensionMatch = pathname.match(/\.(pdf|doc|docx|xls|xlsx|jpg|png)\.(exe|scr|bat|cmd|vbs|js|msi|zip)$/i);
  if (dangerousExtensionMatch) {
    penaltyPoints += 45;
    findings.push({
      id: 'FIND-DOUBLE-EXT',
      ruleId: 'DOUBLE_FILE_EXTENSION',
      title: 'Dangerous Double File Extension Payload In Path',
      severity: 'CRITICAL',
      description: `The URL path references a file with a deceptive double extension (${dangerousExtensionMatch[0]}). This technique disguises an executable program as a harmless document or image.`,
      evidence: `Path: ${pathname}`,
      recommendation: 'Do NOT download or execute any file originating from this path.'
    });
  }

  // 14. Domain Entropy (DGA / Algorithmically Generated Domain)
  const rootDomainName = hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostname;
  const entropy = calculateEntropy(rootDomainName);
  if (entropy > 3.8 && rootDomainName.length > 9) {
    penaltyPoints += 20;
    findings.push({
      id: 'FIND-HIGH-ENTROPY',
      ruleId: 'HIGH_DOMAIN_ENTROPY_DGA',
      title: 'High Domain Randomness (Possible DGA / Disposable Staging)',
      severity: 'MEDIUM',
      description: `The domain label "${rootDomainName}" demonstrates high mathematical randomness (entropy score: ${entropy.toFixed(2)}). Domain Generation Algorithms (DGAs) generate pseudo-random domain names for temporary botnet and phishing infrastructures.`,
      evidence: `Entropy: ${entropy.toFixed(2)} bits/char`,
      recommendation: 'Exercise vigilance. Disposable domains are typically discarded within hours to days.'
    });
  }

  // 15. URL Obfuscation / Encoded Characters
  if (/%[0-9a-fA-F]{2}/.test(rawInput)) {
    const hexMatches = (rawInput.match(/%[0-9a-fA-F]{2}/g) || []).length;
    if (hexMatches >= 3) {
      penaltyPoints += 15;
      findings.push({
        id: 'FIND-HEX-ENCODED',
        ruleId: 'URL_CHARACTER_OBFUSCATION',
        title: `Heavy Hex/URL Encoding Obfuscation (${hexMatches} sequences)`,
        severity: 'MEDIUM',
        description: 'The URL uses multiple percent-encoded hexadecimal sequences. While common in complex queries, attackers also use percent-encoding to mask suspicious keywords or redirection destinations from static inspection.',
        evidence: `Matches: ${hexMatches} encoded sequences`,
        recommendation: 'Review the decoded representation of the link parameters before proceeding.'
      });
    }
  }

  // Calculate final score: cap between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(0, penaltyPoints));

  let riskLevel: RiskLevel = 'LOW';
  if (finalRiskScore >= 60) {
    riskLevel = 'HIGH';
  } else if (finalRiskScore >= 25) {
    riskLevel = 'SUSPICIOUS';
  } else {
    riskLevel = 'LOW';
  }

  // Generate actionable recommendations
  if (riskLevel === 'HIGH') {
    recommendations.push('DO NOT enter usernames, passwords, phone numbers, or credit card information.');
    recommendations.push('Do NOT download, open, or run any attachments or files downloaded from this destination.');
    recommendations.push('If you already entered credentials, immediately change your password on the authentic official service.');
    recommendations.push('Report this URL to your organization\'s IT/Security team or abuse@provider.');
  } else if (riskLevel === 'SUSPICIOUS') {
    recommendations.push('Verify the exact spelling of the domain against official documentation.');
    recommendations.push('Check whether you were expecting this communication or if it originated from an unsolicited notification.');
    recommendations.push('Navigate to the organization\'s verified homepage via a search engine rather than clicking this link.');
  } else {
    recommendations.push('No obvious high-severity indicators were identified by static rule analysis.');
    recommendations.push('Remember that PhishShield provides risk assessments based on static heuristics, not a 100% guarantee.');
    recommendations.push('Always check that your browser shows the anticipated domain name before entering sensitive data.');
  }

  return {
    targetUrl: rawInput,
    normalizedUrl: fullHref,
    domain: secondLevelDomain,
    hostname,
    protocol,
    port: port || (protocol === 'https:' ? '443' : '80'),
    path: pathname || '/',
    riskLevel,
    riskScore: finalRiskScore,
    scoreBreakdown: {
      baseScore: 0,
      penaltyPoints,
      mitigationPoints: 0
    },
    findings,
    recommendations,
    safeToVisit: riskLevel === 'LOW',
    analyzedAt: new Date().toISOString(),
    scanType: 'url'
  };
}
