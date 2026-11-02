import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { ScanRecord } from '../types/index.ts';
import { ScanDetailModal } from '../components/ScanDetailModal.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import {
  History,
  Search,
  Globe,
  Mail,
  Trash2,
  RefreshCw,
  Filter,
  Calendar,
  AlertTriangle,
  Download,
  ExternalLink
} from 'lucide-react';

export const ScanHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'url' | 'email'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'LOW' | 'SUSPICIOUS' | 'HIGH'>('all');

  // Modals state
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await api.getScans({
        type: typeFilter,
        risk: riskFilter,
        search: searchTerm
      });
      setScans(data.scans || []);
    } catch (err) {
      console.error('Failed to load scans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [typeFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScans();
  };

  const handleOpenDetail = (scan: ScanRecord) => {
    setSelectedScan(scan);
    setDetailModalOpen(true);
  };

  const confirmDeleteSingle = async () => {
    if (!deleteId) return;
    try {
      await api.deleteScan(deleteId);
      setDeleteId(null);
      fetchScans();
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  const confirmClearAll = async () => {
    try {
      await api.clearAllScans();
      setConfirmClearOpen(false);
      fetchScans();
    } catch (err) {
      console.error('Failed to clear all scans:', err);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phishshield_scans_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Scan Audit History
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Isolated personal security log for <strong className="text-slate-200">{user?.email}</strong>.
          </p>
        </div>

        {scans.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export All (JSON)</span>
            </button>

            <button
              onClick={() => setConfirmClearOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-white hover:bg-red-600/80 border border-red-500/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search targets or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Scan Type Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'url', 'email'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg uppercase font-mono font-semibold transition ${
                  typeFilter === t
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'LOW', 'SUSPICIOUS', 'HIGH'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded-lg uppercase font-mono font-semibold transition ${
                  riskFilter === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={fetchScans}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
            title="Refresh Scan Log"
            aria-label="Refresh Scan Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scans Table / List */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading audit log...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Matching Scan Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No scans match your current filter criteria or your history is currently empty.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Analyzed Target Summary</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Findings</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {scans.map((scan) => {
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

                      <td className="px-4 py-3 font-mono text-xs text-slate-200 max-w-xs md:max-w-md truncate">
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

                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {scan.findings.length} flagged
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(scan)}
                            className="px-2.5 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => setDeleteId(scan.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete this record"
                            aria-label="Delete this record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onDelete={(id) => {
          setDeleteId(id);
          confirmDeleteSingle();
        }}
      />

      {/* Delete Single Record Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Scan Record"
        message="Are you sure you want to permanently delete this scan record from your audit history? This action cannot be reversed."
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={confirmDeleteSingle}
        onCancel={() => setDeleteId(null)}
      />

      {/* Clear All Confirmation */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear Entire Scan History"
        message="Are you sure you want to delete ALL scans from your personal database? All previous URL and email threat records will be purged immediately."
        confirmLabel="Purge All Records"
        isDestructive={true}
        onConfirm={confirmClearAll}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
