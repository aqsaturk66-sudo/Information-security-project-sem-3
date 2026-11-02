/**
 * PhishShield Core TypeScript Definitions
 */

export type RiskLevel = 'LOW' | 'SUSPICIOUS' | 'HIGH';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  severity: SeverityLevel;
  description: string;
  technicalDetails?: string;
  evidence?: string;
  recommendation: string;
}

export interface UrlAnalysisResult {
  targetUrl: string;
  normalizedUrl: string;
  domain: string;
  hostname: string;
  protocol: string;
  port?: string;
  path: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  scoreBreakdown: {
    baseScore: number;
    penaltyPoints: number;
    mitigationPoints: number;
  };
  findings: Finding[];
  recommendations: string[];
  safeToVisit: boolean;
  analyzedAt: string;
  scanType: 'url';
}

export interface EmailAnalysisResult {
  subject?: string;
  previewSummary: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  findings: Finding[];
  recommendations: string[];
  detectedIndicators: {
    hasUrgentLanguage: boolean;
    hasCredentialRequest: boolean;
    hasOtpRequest: boolean;
    hasSuspiciousLinks: boolean;
    hasSuspiciousAttachments: boolean;
    hasGenericGreeting: boolean;
    hasBrandImpersonation: boolean;
    hasFinancialLure: boolean;
  };
  analyzedAt: string;
  scanType: 'email';
}

export interface ScanRecord {
  id: string;
  userId: string;
  scanType: 'url' | 'email';
  inputSummary: string;
  targetNormalized?: string;
  riskLevel: RiskLevel;
  riskScore: number;
  findings: Finding[];
  recommendations: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalScans: number;
  totalUrlScans: number;
  totalEmailScans: number;
  highRiskCount: number;
  suspiciousCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  recentScans: ScanRecord[];
  riskDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  activityOverTime: {
    date: string;
    scans: number;
    highRisk: number;
  }[];
}

export interface ThreatConcept {
  id: string;
  name: string;
  category: 'social_engineering' | 'url_manipulation' | 'credential_theft' | 'infrastructure';
  severity: SeverityLevel;
  shortDescription: string;
  whatItMeans: string;
  whyItMatters: string;
  howAttackersUseIt: string;
  realisticExample: string;
  howToProtect: string[];
}

export interface AwarenessArticle {
  id: string;
  title: string;
  category: string;
  readTimeMinutes: number;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  actionChecklist: string[];
}
