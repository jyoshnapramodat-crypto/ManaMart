import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminAcceptInviteView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setVerifyError('Missing invitation token. Administrator invitation link is invalid.');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await api.get(`/admin/invite/verify?token=${encodeURIComponent(token)}`);
      if (res.data?.success) {
        setInviteData(res.data);
        setName(res.data.name || '');
      }
    } catch (err) {
      setVerifyError(
        err.response?.data?.message ||
          'This invitation link is invalid or has expired (48-hour limit). Please contact your team administrator.'
      );
    } finally {
      setVerifying(false);
    }
  };

  // Live Strong Password Criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setSubmitError('Please ensure all strong password security criteria are satisfied.');
      return;
    }
    if (!passwordsMatch) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post('/admin/accept-invite', {
        token,
        name,
        password,
      });

      if (res.data?.success) {
        setActivated(true);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to activate administrator account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/assets/official-logo.png"
              alt="ManaMart"
              className="h-10 mx-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E8F3EC] text-[#064E3B] border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Secured Staff Onboarding</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin Workspace Activation
          </h2>
          <p className="text-xs text-slate-500">
            Internal Operations, compliance control, and city-level dispatch management
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {verifying ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#064E3B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Verifying signed token security...</p>
            </div>
          ) : verifyError ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900">Invitation Expired or Invalid</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{verifyError}</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-[#064E3B] text-white text-xs font-bold rounded-xl hover:bg-[#033B2D] cursor-pointer"
                >
                  Return to Staff Login
                </button>
              </div>
            </div>
          ) : activated ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-900">Account Activated Successfully!</h3>
                <p className="text-xs text-slate-600">
                  Your administrator profile for <strong>{inviteData?.email}</strong> is now live.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-[#064E3B] font-medium">
                Root administration permissions and audit access have been granted to this email address.
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-[#064E3B] hover:bg-[#033B2D] text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Staff Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="bg-[#E8F3EC] p-3 rounded-2xl border border-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#064E3B]">
                  Invited by: <strong>{inviteData?.invitedBy}</strong>
                  <br />
                  Account Email: <strong>{inviteData?.email}</strong>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Set Strong Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a high-entropy password"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              {/* Live Strong Password Validation Checklist */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-[11px] text-slate-600 block">
                  Mandatory Security Standard:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Min 8 characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {hasLowercase ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {hasNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Numeric digit (0-9)
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {hasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Special char (!@#$...)
                  </span>
                  <span className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {passwordsMatch ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Passwords match
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isPasswordValid || !passwordsMatch}
                className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isPasswordValid && passwordsMatch
                    ? 'bg-[#064E3B] hover:bg-[#033B2D]'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>{submitting ? 'Securing Account...' : 'Activate Administrator Profile'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 text-center">
          © 2026 ManaMart Hyperlocal Technologies Pvt Ltd. Mana Ooru. Mana Market.
        </p>
      </div>
    </div>
  );
}
