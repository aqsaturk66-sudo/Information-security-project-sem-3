import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Shield,
  Search,
  Mail,
  Lock,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Database,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api.ts';
import { RiskMeter } from '../components/RiskMeter.tsx';
import { UrlAnalysisResult } from '../types/index.ts';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Quick sandbox demo scanner on hero
  const [quickUrl, setQuickUrl] = useState('https://paypal-account-verify.xyz/update-login');
  const [analyzing, setAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState<UrlAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    setAnalyzing(true);
    setErrorMsg('');
    try {
      const data = await api.analyzeUrl({ url: quickUrl, saveToHistory: false });
      setDemoResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Deterministic Cyber Threat Analysis Engine Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Intelligent Phishing Detection &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Cyber Threat Analysis
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Dissect deceptive URLs, brand impersonations, typosquatting domains, and social engineering email attacks with transparent, deterministic cybersecurity rules.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition hover:-translate-y-0.5"
            >
              <span>{isAuthenticated ? 'Open Security Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/analyzer/url"
              className="px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 transition"
            >
              Launch URL Analyzer
            </Link>
          </div>

          {/* Live Quick Interactive Inspection Sandbox */}
          <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  Live Rule Evaluation Sandbox
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">No network packets sent to target</span>
            </div>

            <form onSubmit={handleQuickAnalyze} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="Paste any suspicious link..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-slate-200 text-sm font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={analyzing}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {analyzing ? 'Scanning...' : 'Test Scan'}
              </button>
            </form>

            {errorMsg && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Result Render */}
            {demoResult && (
              <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <RiskMeter score={demoResult.riskScore} riskLevel={demoResult.riskLevel} size="md" />
                  <div className="text-xs text-slate-400">
                    Host: <span className="text-cyan-300 font-mono">{demoResult.hostname}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <span className="text-xs font-mono uppercase text-slate-400">Triggered Heuristics:</span>
                  <div className="space-y-1.5">
                    {demoResult.findings.slice(0, 2).map((f, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span><strong>{f.title}:</strong> {f.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to="/analyzer/url"
                    className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Open Full Deep Analyzer <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Operational Methodology</h2>
          <p className="text-3xl font-bold text-white tracking-tight">How PhishShield Protects You</p>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Deterministic rule-based heuristics that analyze syntactic patterns without exposing your browser to remote exploits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 relative group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-mono font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Safe Air-Gapped Parsing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Target URLs and text are parsed in an isolated sandbox. PhishShield never clicks, executes JavaScript, or downloads payloads from the suspect server.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 relative group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-mono font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Rule Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evaluates 15+ proven indicators: RFC authority spoofing (@), Shannon entropy, typosquatting edit distance, TLD abuse, and psychological urgency triggers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 relative group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Actionable Defense Triage</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Provides an intelligible 0–100 risk score, itemized evidence logs, plain-language explanations, and explicit steps to prevent credential compromise.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Core Capabilities</h2>
          <p className="text-3xl font-bold text-white tracking-tight">Built for Real-World Cyber Hygiene</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">URL Phishing Analyzer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects brand impersonations, URL shorteners, raw IP hosts, high-abuse TLDs, and punycode homoglyphs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Email Threat Scanner</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies credential theft lures, OTP interception schemes, fake invoices, and social engineering coercion.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Threat Encyclopedia</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Educational reference explaining cyber threats, attacker motivations, real attack examples, and counter-tactics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Awareness Center</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              8 in-depth, practical security guides on FIDO2 passkeys, password managers, and incident response checklists.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Isolated Scan History</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personal scan audit trail with search, filters, full report modal inspection, and complete data deletion control.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Privacy-First Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sensitive email bodies are never permanently retained. Only calculated findings and preview summaries are stored.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Ethics Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-[#0a0f1d] border border-slate-800 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Responsible Cybersecurity Principle</h3>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            PhishShield is engineered to empower human skepticism through transparency. We clearly explain exactly why a URL or email is flagged, demystifying cyber threats without opaque black-box verdicts or marketing gimmicks.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
            >
              Start Analyzing Threat Indicators
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
