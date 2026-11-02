import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { EmailAnalysisResult } from '../types/index.ts';
import { RiskMeter } from '../components/RiskMeter.tsx';
import {
  Mail,
  Search,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  EyeOff,
  CheckCircle2,
  Copy,
  FileText
} from 'lucide-react';

const SAMPLE_EMAILS = [
  {
    name: 'OTP & Password Stealer',
    subject: 'Urgent: Account Suspension Notice',
    body: `Dear Customer,

Your account will be suspended within 24 hours due to suspicious unauthorized sign-in attempts.

To secure your identity immediately, reply to this email with your current password and the 6-digit OTP verification code just sent to your mobile phone.

Failure to verify will lead to permanent account termination.

Security Operations Team`
  },
  {
    name: 'BEC Fake Invoice',
    subject: 'Geek Squad Auto-Renewal Charge $499.00',
    body: `Attention Sir/Madam,

Thank you for renewing your annual subscription with Geek Squad Total Tech Care.
We have charged $499.00 to your credit card on file.

If you did not authorize this wire transfer or wish to cancel this transaction, call our customer support helpline immediately.

See the attached invoice.zip for full billing itemization.`
  },
  {
    name: 'Legitimate Workplace Sync',
    subject: 'Sprint Planning Meeting Tomorrow',
    body: `Hi Alex,

I have updated the engineering sprint backlog for next week.
Let's review the milestone deadlines during tomorrow's team standup at 10:00 AM.

Let me know if you want to add any other discussion items to the agenda.

Best,
Jordan`
  }
];

export const EmailAnalyzerPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saveToHistory, setSaveToHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!body.trim() && !subject.trim()) {
      setErrorMsg('Please enter email content or a subject line to analyze.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.analyzeEmail({
        subject: subject.trim(),
        body: body.trim(),
        saveToHistory: isAuthenticated ? saveToHistory : false
      });
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during email heuristic evaluation.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSubject('');
    setBody('');
    setResult(null);
    setErrorMsg('');
  };

  const handleSelectSample = (sample: typeof SAMPLE_EMAILS[0]) => {
    setSubject(sample.subject);
    setBody(sample.body);
    setErrorMsg('');
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `PhishShield Email Phishing Analysis Report
Subject: ${result.subject || 'N/A'}
Risk Level: ${result.riskLevel} (${result.riskScore}/100)
Findings Count: ${result.findings.length}
Analyzed At: ${new Date(result.analyzedAt).toLocaleString()}
Recommendations:\n- ${result.recommendations.join('\n- ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Email Phishing Analyzer
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Inspect suspicious email messages for social engineering lures, credential theft prompts, OTP interception schemes, fake invoices, and artificial urgency.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <EyeOff className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Privacy Guarantee:</strong> PhishShield analyzes email heuristics in local memory. Sensitive email messages are <em>never</em> sent to third-party APIs or permanently logged in full in the database.
          </span>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          PRIVACY PROTECTED
        </span>
      </div>

      {/* Input Console */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email-subject" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Email Subject Line (Optional)
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Urgent: Account Verification Required or Invoice Overdue"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-slate-100 font-mono text-sm placeholder:text-slate-500 focus:outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email-body" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Email Message Body / Text Content
            </label>
            <textarea
              id="email-body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the suspicious email message body text here for heuristic triage..."
              className="w-full p-4 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-slate-100 font-mono text-sm placeholder:text-slate-500 focus:outline-none transition leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {isAuthenticated ? (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToHistory}
                  onChange={(e) => setSaveToHistory(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Save privacy-conscious scan summary to my history</span>
              </label>
            ) : (
              <span className="text-xs text-slate-500">
                (Sign in to save this scan summary to your personal history)
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition flex items-center gap-2 shadow-sm shadow-cyan-500/20 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Evaluating Heuristics...' : 'Analyze Email'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Sample Lures */}
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
            Load Pre-Engineered Test Templates:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_EMAILS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-mono transition text-left"
              >
                <span className="text-cyan-400 font-semibold">{sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Score Header Card */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <RiskMeter score={result.riskScore} riskLevel={result.riskLevel} size="lg" />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-2 text-xs font-mono font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copied ? 'Copied Report!' : 'Copy Report'}</span>
                </button>
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
                  <span>Timestamp: {new Date(result.analyzedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Heuristic Trigger Indicators Grid */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
                Heuristic Signatures Evaluated:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Password / Credential Request', active: result.detectedIndicators.hasCredentialRequest },
                  { label: 'OTP / 2FA Interception', active: result.detectedIndicators.hasOtpRequest },
                  { label: 'Coercive Urgency / Deadlines', active: result.detectedIndicators.hasUrgentLanguage },
                  { label: 'Financial Lure / BEC', active: result.detectedIndicators.hasFinancialLure },
                  { label: 'Impersonal Generic Salutation', active: result.detectedIndicators.hasGenericGreeting },
                  { label: 'Brand Impersonation', active: result.detectedIndicators.hasBrandImpersonation },
                  { label: 'Suspicious Attachment Mentions', active: result.detectedIndicators.hasSuspiciousAttachments },
                  { label: 'Embedded Hyperlinks', active: result.detectedIndicators.hasSuspiciousLinks }
                ].map((indicator, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
                      indicator.active
                        ? 'bg-red-500/10 border-red-500/30 text-red-300 font-semibold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="truncate">{indicator.label}</span>
                    <span className="text-[10px] shrink-0 font-bold">
                      {indicator.active ? 'FLAGGED' : 'CLEAR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Findings List */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span>Specific Threat Warnings Identified ({result.findings.length})</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No high-severity phishing signatures were identified in this message text.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {result.findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          f.severity === 'CRITICAL'
                            ? 'bg-red-500/15 text-red-300 border-red-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {f.severity}
                        </span>
                        <h4 className="text-sm font-bold text-white">{f.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{f.ruleId}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>

                    <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                      <strong className="text-slate-300">Defense Action:</strong> {f.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Recommended Defensive Steps</span>
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
