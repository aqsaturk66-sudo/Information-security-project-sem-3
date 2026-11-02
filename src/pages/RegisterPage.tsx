import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, Eye, EyeOff, Lock, Mail, User, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Strength Evaluation
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  const strengthCount = Object.values(checks).filter(Boolean).length;
  const strengthPercentage = (strengthCount / 5) * 100;
  const isPasswordValid = checks.length && checks.hasUpper && checks.hasLower && checks.hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMsg('You must agree to the Security Terms & Privacy Policy to create an account.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Password does not fulfill cybersecurity complexity criteria.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        termsAccepted
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create PhishShield Account</h1>
          <p className="text-xs text-slate-400">
            Set up your persistent security dashboard and personal scan telemetry
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@domain.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm font-mono placeholder:text-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-8 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm font-mono placeholder:text-slate-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-cyan-400 text-slate-100 text-sm font-mono placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Checklist Meter */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">Password Entropy:</span>
              <span className={`font-mono font-bold ${strengthCount >= 4 ? 'text-emerald-400' : strengthCount >= 3 ? 'text-amber-400' : 'text-red-400'}`}>
                {strengthCount >= 4 ? 'Strong' : strengthCount >= 3 ? 'Moderate' : 'Weak'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strengthPercentage >= 80 ? 'bg-emerald-400' : strengthPercentage >= 60 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${strengthPercentage}%` }}
              />
            </div>

            {/* Criteria chips */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{checks.length ? '✓' : '○'}</span> At least 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${checks.hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{checks.hasUpper ? '✓' : '○'}</span> 1 uppercase (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${checks.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{checks.hasLower ? '✓' : '○'}</span> 1 lowercase (a-z)
              </div>
              <div className={`flex items-center gap-1.5 ${checks.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{checks.hasNumber ? '✓' : '○'}</span> 1 number (0-9)
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>
              I agree to the <strong>Terms of Service</strong> and acknowledge that PhishShield provides heuristic threat assessments rather than absolute guarantees.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
