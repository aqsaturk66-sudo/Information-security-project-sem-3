import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { UrlAnalysisResult, Finding } from '../types/index.ts';
import { RiskMeter } from '../components/RiskMeter.tsx';
import {
  Globe,
  Search,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Terminal,
  BookmarkPlus
} from 'lucide-react';

const SAMPLE_URLS = [
  {
    name: 'Brand Impersonation',
    url: 'https://paypal-account-verify.xyz/update-login',
    desc: 'Spoofed PayPal brand on .xyz TLD'
  },
  {
    name: 'Raw IP Host',
    url: 'http://198.51.100.42/secure/banking-login.php',
    desc: 'Unencrypted HTTP with direct IP'
  },
  {
    name: 'Authority Spoof (@)',
    url: 'https://google.com@attacker-controlled-server.com/signin',
    desc: 'RFC @ credential delimiter diversion'
  },
  {
    name: 'Legitimate Site',
    url: 'https://developer.mozilla.org/en-US/docs/Web/Security',
    desc: 'Authentic HTTPS resource'
  }
];

export const UrlAnalyzerPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [saveToHistory, setSaveToHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a URL to inspect.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.analyzeUrl({
        url: urlInput.trim(),
        saveToHistory: isAuthenticated ? saveToHistory : false
      });
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while analyzing the URL.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setResult(null);
    setErrorMsg('');
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    setErrorMsg('');
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `PhishShield URL Analysis Report
Target: ${result.targetUrl}
Host: ${result.hostname}
Risk Level: ${result.riskLevel} (${result.riskScore}/100)
Findings: ${result.findings.length}
Analyzed At: ${new Date(result.analyzedAt).toLocaleString()}
Recommendations:\n- ${result.recommendations.join('\n- ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            URL Phishing Analyzer
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Submit any web address for static heuristic threat inspection. Evaluates RFC compliance, lookalike typosquatting, brand impersonation, obfuscation, high-abuse TLDs, and structural anomalies without network interaction.
        </p>
      </div>

      {/* Input Console */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url-input" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Target URL or Domain String
            </label>
            <div className="relative">
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. https://paypal-security-update.xyz/verify or http://192.168.1.1"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-slate-100 font-mono text-sm placeholder:text-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Save to history checkbox for logged-in users */}
            {isAuthenticated ? (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToHistory}
                  onChange={(e) => setSaveToHistory(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Save this scan to my account history</span>
              </label>
            ) : (
              <span className="text-xs text-slate-500">
                (Sign in to save this scan to your personal history)
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
                <span>{loading ? 'Evaluating Heuristics...' : 'Analyze URL'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Sample Targets */}
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
            Quick Test Cases:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_URLS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSample(sample.url)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-mono transition text-left"
              >
                <span className="text-cyan-400 font-semibold">{sample.name}:</span>{' '}
                <span className="text-slate-400">{sample.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Evaluation Blocked:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Overview Score Card */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <RiskMeter score={result.riskScore} riskLevel={result.riskLevel} size="lg" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

            {/* Normalized Breakdown Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Host / Domain</span>
                <span className="text-sm font-mono font-semibold text-white truncate block">
                  {result.hostname}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Protocol</span>
                <span className={`text-sm font-mono font-semibold ${result.protocol === 'https:' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.protocol} {result.protocol === 'http:' ? '(INSECURE)' : ''}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Port</span>
                <span className="text-sm font-mono font-semibold text-slate-200">
                  :{result.port}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Path</span>
                <span className="text-sm font-mono font-semibold text-slate-200 truncate block">
                  {result.path || '/'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Findings List */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span>Evaluated Indicators & Findings ({result.findings.length})</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No threat signatures identified in this address structure.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {result.findings.map((f, i) => {
                  const severityStyles = {
                    CRITICAL: 'bg-red-500/15 text-red-300 border-red-500/30',
                    HIGH: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
                    MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    LOW: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                    INFO: 'bg-slate-800 text-slate-300 border-slate-700'
                  };

                  return (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${severityStyles[f.severity] || severityStyles.INFO}`}>
                            {f.severity}
                          </span>
                          <h4 className="text-sm font-bold text-white">{f.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{f.ruleId}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>

                      {f.evidence && (
                        <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-900/40">
                          Evidence: {f.evidence}
                        </div>
                      )}

                      <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                        <strong className="text-slate-300">Defense Action:</strong> {f.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Defensive Actions */}
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
