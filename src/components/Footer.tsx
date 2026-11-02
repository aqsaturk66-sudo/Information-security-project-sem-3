import React from 'react';
import { Shield, Lock, Activity, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070b16] border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-white font-mono text-base tracking-tight">
                Phish<span className="text-cyan-400">Shield</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Intelligent Phishing Detection & Cyber Threat Analysis System. Built from the ground up for cybersecurity analysts, enterprise employees, students, and everyday internet users to dissect malicious indicators in URLs and emails before irreversible harm occurs.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Detection Core: Active</span>
              <span className="text-slate-600">|</span>
              <span>Database: SQLite ACID WAL</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs mb-3 font-mono">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/analyzer/url" className="hover:text-cyan-400 transition">URL Phishing Analyzer</Link>
              </li>
              <li>
                <Link to="/analyzer/email" className="hover:text-cyan-400 transition">Email Phishing Analyzer</Link>
              </li>
              <li>
                <Link to="/threats" className="hover:text-cyan-400 transition">Threat Explanation Engine</Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-cyan-400 transition">Security Awareness Center</Link>
              </li>
              <li>
                <Link to="/security-tests" className="hover:text-cyan-400 transition">Security Test Suite</Link>
              </li>
            </ul>
          </div>

          {/* Security & Privacy */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs mb-3 font-mono">Security Ethics</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Third-Party Telemetry</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safe Static Parsing (No SSRF)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Strict User Data Isolation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Educational Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p className="leading-relaxed text-center sm:text-left max-w-3xl">
            <strong>Security Disclaimer:</strong> PhishShield performs deterministic static heuristic risk scoring. These metrics are advisory security evaluations, not guaranteed warranties of safety or malice. Never share passwords or private keys regardless of score.
          </p>
          <div className="shrink-0 text-slate-400">
            &copy; {new Date().getFullYear()} PhishShield System. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
