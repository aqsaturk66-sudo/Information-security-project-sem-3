import React from 'react';
import { RiskLevel } from '../types/index.ts';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskMeterProps {
  score: number;
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, riskLevel, size = 'md' }) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine colors based on risk level
  let strokeColor = '#10b981'; // green
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10 border-emerald-500/30';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (riskLevel === 'HIGH' || clampedScore >= 60) {
    strokeColor = '#ef4444'; // red
    textColor = 'text-red-400';
    bgColor = 'bg-red-500/10 border-red-500/30';
    Icon = ShieldAlert;
    label = 'High Risk';
  } else if (riskLevel === 'SUSPICIOUS' || clampedScore >= 25) {
    strokeColor = '#f59e0b'; // amber
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-500/10 border-amber-500/30';
    Icon = AlertTriangle;
    label = 'Suspicious';
  }

  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const viewBoxSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-4">
      {/* Radial Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          width={viewBoxSize}
          height={viewBoxSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-bold ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-sm'} text-white`}>
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-mono text-slate-400">/ 100</span>
        </div>
      </div>

      {/* Label and description */}
      <div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgColor} ${textColor}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {riskLevel === 'HIGH'
            ? 'Severe threat indicators identified. Do not interact.'
            : riskLevel === 'SUSPICIOUS'
            ? 'Anomalies detected. Exercise heightened vigilance.'
            : 'No high-severity signatures detected.'}
        </p>
      </div>
    </div>
  );
};
