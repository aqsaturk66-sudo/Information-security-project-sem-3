import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Save,
  Trash2,
  LogOut,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, verifyEmail, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      if (data.profile) {
        setDisplayName(data.profile.displayName);
      }
      setAuditLog(data.auditLog || []);
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.updateProfile({
        displayName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      setSuccessMsg('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      await refreshProfile();
      fetchProfileData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try {
      await verifyEmail();
      setSuccessMsg('Email verified successfully.');
      fetchProfileData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify email.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Account deletion failed.');
      setDeleteModalOpen(false);
    }
  };

  if (loading && !displayName) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Loading user profile telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Profile & Account Settings
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Manage your credentials, verify security posture, and audit authenticated sessions.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Summary Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xl font-bold font-mono">
                {user?.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">{user?.displayName}</h3>
                <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email Verification:</span>
                {user?.emailVerified ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    VERIFIED
                  </span>
                ) : (
                  <button
                    onClick={handleVerifyEmail}
                    disabled={verifyingEmail}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer"
                  >
                    {verifyingEmail ? 'Verifying...' : 'Verify Email (1-Click)'}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Created:</span>
                <span className="font-mono text-slate-200">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-mono text-cyan-400">SQLite ACID (WAL)</span>
              </div>
            </div>
          </div>

          {/* Destructive Zone */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-red-500/20 space-y-3">
            <h4 className="text-sm font-bold text-red-400">Danger Zone</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanently delete your PhishShield account, authentication credentials, and all recorded scan history.
            </p>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>

        {/* Right Column: Update Profile & Change Password Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Update Credentials & Profile</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-mono uppercase text-slate-400 block font-bold">
                  Change Password (Leave blank to keep existing)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase text-slate-400">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Required only to set new password"
                      className="w-full px-4 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm font-mono placeholder:text-slate-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase text-slate-400">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, uppercase & numbers"
                      className="w-full px-4 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm font-mono placeholder:text-slate-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition text-xs flex items-center gap-2 shadow-sm shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updating ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security Audit Event Log */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Security Audit Event Log</span>
              </h3>
              <span className="text-xs text-slate-400">Last 10 Account Events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Event Action</th>
                    <th className="px-3 py-2">Source IP</th>
                    <th className="px-3 py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {auditLog.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2.5 font-semibold text-cyan-300">
                        {event.event_type}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">
                        {event.ip_address || '127.0.0.1'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 text-right whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Permanently Delete Account"
        message="Are you certain you wish to delete your PhishShield account? All authentication credentials, user profiles, and scan records will be deleted immediately and permanently."
        confirmLabel="Confirm Permanent Deletion"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
