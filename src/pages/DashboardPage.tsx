import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { DashboardStats, ScanRecord } from '../types/index.ts';
import { RiskMeter } from '../components/RiskMeter.tsx';
import { ScanDetailModal } from '../components/ScanDetailModal.tsx';
import {
  Globe,
  Mail,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Activity,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenScan = (scan: ScanRecord) => {
    setSelectedScan(scan);
    setModalOpen(true);
  };

  const handleDeleteScan = async (id: string) => {
    try {
      await api.deleteScan(id);
      fetchStats();
    } catch (err) {
      console.error('Delete scan failed', err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading live security statistics...</p>
      </div>
    );
  }

  const hasScans = stats && stats.totalScans > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Operations Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              LIVE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-200">{user?.displayName}</strong>. Here is your personal cyber threat posture based on persistent database records.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/analyzer/url"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-sm shadow-cyan-500/20"
          >
            <Globe className="w-4 h-4" />
            <span>Scan URL</span>
          </Link>

          <Link
            to="/analyzer/email"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Scan Email</span>
          </Link>

          <button
            onClick={fetchStats}
            title="Refresh Metrics"
            aria-label="Refresh Metrics"
            className="p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total URLs */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">URLs Analyzed</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats?.totalUrlScans ?? 0}</div>
          <p className="text-[11px] text-slate-400">Total verified link scans</p>
        </div>

        {/* Total Emails */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Emails Analyzed</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats?.totalEmailScans ?? 0}</div>
          <p className="text-[11px] text-slate-400">Messages screened for BEC/lures</p>
        </div>

        {/* High Risk Detections */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-red-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-red-300">High Risk Alerts</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{stats?.highRiskCount ?? 0}</div>
          <p className="text-[11px] text-red-300/80">Severe threats mitigated</p>
        </div>

        {/* Suspicious Findings */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300">Suspicious</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats?.suspiciousCount ?? 0}</div>
          <p className="text-[11px] text-amber-300/80">Moderate risk warnings</p>
        </div>

        {/* Average Threat Score */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Avg Risk Score</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.averageRiskScore ?? 0}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">Aggregate threat density</p>
        </div>
      </div>

      {/* Main Charts & Visualizations Row */}
      {hasScans ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Distribution Chart */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                Risk Distribution
              </h3>
              <span className="text-xs text-slate-400">By Classification</span>
            </div>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.riskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.riskDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">LOW</span>
                <span className="text-sm font-bold text-emerald-400">{stats?.lowRiskCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">SUSPICIOUS</span>
                <span className="text-sm font-bold text-amber-400">{stats?.suspiciousCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">HIGH</span>
                <span className="text-sm font-bold text-red-400">{stats?.highRiskCount}</span>
              </div>
            </div>
          </div>

          {/* Activity Over Time Area Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                  Scan Activity Trends
                </h3>
                <p className="text-xs text-slate-400">Recorded scans over the last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Total Scans
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> High Risk
                </span>
              </div>
            </div>

            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.activityOverTime || []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(str) => str.slice(5)}
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total Scans"
                  />
                  <Area
                    type="monotone"
                    dataKey="highRisk"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHigh)"
                    name="High Risk Threats"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Proper Empty State for Fresh Users */
        <div className="p-12 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Scan Records Found Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Your dashboard metrics and risk distribution charts will populate automatically once you analyze your first suspicious URL or email.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/analyzer/url"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
            >
              Analyze a URL
            </Link>
            <Link
              to="/analyzer/email"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              Analyze an Email
            </Link>
          </div>
        </div>
      )}

      {/* Recent Scans Table */}
      {hasScans && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-mono text-white">Recent Security Scans</h3>
              <p className="text-xs text-slate-400">Latest threat analyses recorded under your account</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Analyzed Target</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {stats?.recentScans.map((scan) => {
                  const riskBadges = {
                    HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
                    SUSPICIOUS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  };

                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="flex items-center gap-1.5">
                          {scan.scanType === 'url' ? (
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span className="uppercase">{scan.scanType}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-200 max-w-md truncate">
                        {scan.inputSummary}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${riskBadges[scan.riskLevel]}`}>
                          {scan.riskLevel}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs font-bold text-white">
                        {scan.riskScore}/100
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenScan(scan)}
                          className="px-2.5 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <ScanDetailModal
        scan={selectedScan}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDeleteScan}
      />
    </div>
  );
};
