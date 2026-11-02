import React from 'react';
import { ScanRecord } from '../types/index.ts';
import { RiskMeter } from './RiskMeter.tsx';
import { X, ShieldAlert, CheckCircle2, Copy, Trash2, Calendar, Globe, Mail } from 'lucide-react';

interface ScanDetailModalProps {
  scan: ScanRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({
  scan,
  isOpen,
  onClose,
  onDelete
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !scan) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#131d33] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${scan.scanType === 'url' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {scan.scanType === 'url' ? <Globe className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Scan Report:</span>
                <span className="text-cyan-400">{scan.scanType.toUpperCase()} Analysis</span>
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(scan.createdAt).toLocaleString()}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400">{scan.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Target Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Analyzed Target</span>
            <p className="text-sm font-mono text-white break-all bg-black/40 p-2.5 rounded-lg border border-slate-800">
              {scan.inputSummary}
            </p>
          </div>

          {/* Risk Gauge & Score */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <RiskMeter score={scan.riskScore} riskLevel={scan.riskLevel} size="lg" />
            <div className="text-right text-xs text-slate-400 max-w-xs sm:border-l sm:border-slate-800 sm:pl-6">
              <span className="block font-semibold text-slate-300 mb-1">Confidence Rating</span>
              Static deterministic heuristics matched {scan.findings.length} security rules based on RFC standards and threat signatures.
            </div>
          </div>

          {/* Findings List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Identified Findings & Indicators ({scan.findings.length})</span>
            </h3>

            {scan.findings.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>No malicious indicators or anomalies were detected during static rule evaluation.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {scan.findings.map((f, idx) => {
                  const severityColors = {
                    CRITICAL: 'bg-red-500/15 text-red-300 border-red-500/30',
                    HIGH: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
                    MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    LOW: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                    INFO: 'bg-slate-800 text-slate-300 border-slate-700'
                  };

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold text-white leading-snug">{f.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${severityColors[f.severity] || severityColors.INFO}`}>
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
                      {f.evidence && (
                        <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/40">
                          Evidence: {f.evidence}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 bg-slate-800/40 p-2 rounded border border-slate-800">
                        <strong className="text-slate-300">Defense:</strong> {f.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Defensive Actions</span>
            </h3>
            <ul className="space-y-2">
              {scan.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#131d33] border-t border-slate-700/80 flex items-center justify-between">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Export JSON'}</span>
          </button>

          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(scan.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
