import React, { useState, useEffect } from 'react';
import AdminPortalLayout from '../../components/admin/AdminPortalLayout';
import api from '../../services/api';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Users,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export default function AdminTeamView() {
  const [admins, setAdmins] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/team');
      if (res.data?.success) {
        setAdmins(res.data.admins || []);
        setPendingInvites(res.data.pendingInvites || []);
      }
    } catch (err) {
      console.error('Error fetching admin team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setInviteError(null);
    try {
      const res = await api.post('/admin/invite', {
        email: inviteEmail,
        name: inviteName,
      });

      if (res.data?.success) {
        setGeneratedLink(res.data.inviteLink);
        fetchTeamData();
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to generate invitation link.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetModal = () => {
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
    setGeneratedLink('');
    setCopied(false);
    setInviteError(null);
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#064E3B] border border-emerald-200">
                Staff & Operations Governance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Admin Team & Role Invites
            </h1>
            <p className="text-xs text-slate-500">
              Manage system administrators and generate signed, expiring (48h) onboarding invites. Public registration is permanently disabled.
            </p>
          </div>

          <button
            onClick={() => {
              resetModal();
              setShowInviteModal(true);
            }}
            className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New Administrator</span>
          </button>
        </div>

        {/* Security Alert Note */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold block">Zero-Trust Admin Creation Protocol</span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              ManaMart does not expose any public admin registration endpoints. All new administrators must be invited by an existing active administrator via a signed, 48-hour expiring JWT token with mandatory strong password requirements.
            </p>
          </div>
        </div>

        {/* Active Administrators Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#064E3B]" />
              <span>Active Administrators ({admins.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading administrators...</div>
          ) : admins.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 border border-slate-200/80">
              No administrators found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#064E3B] font-black text-sm flex items-center justify-center border border-emerald-100">
                        {adm.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{adm.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {adm.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-[#064E3B]">
                      <KeyRound className="w-3 h-3" />
                      Root Permissions
                    </span>
                    <span>
                      {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'Active Member'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations Section */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6B00]" />
              <span>Pending Tokenized Invitations ({pendingInvites.length})</span>
            </h3>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{inv.name || 'Invited Administrator'}</span>
                    <p className="text-slate-500 text-[11px] font-mono">{inv.email}</p>
                    <span className="text-[10px] text-slate-400 block">
                      Invited by: {inv.invitedBy} • Expires at: {new Date(inv.expiresAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                      Awaiting Acceptance
                    </span>
                    <button
                      onClick={() => {
                        const origin = window.location.origin;
                        navigator.clipboard.writeText(`${origin}/admin/accept-invite?token=${inv.token}`);
                        alert('Invitation link copied to clipboard!');
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Generate Expiring Invite Link */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <UserPlus className="w-5 h-5 text-[#064E3B]" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Invite Administrator</h3>
                    <span className="text-[11px] text-slate-400">Generates 48-hour signed registration token</span>
                  </div>
                </div>
                <button
                  onClick={resetModal}
                  className="text-slate-400 hover:text-slate-600 text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!generatedLink ? (
                <form onSubmit={handleGenerateInvite} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Administrator Full Name</label>
                    <input
                      type="text"
                      required
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Priyanjali Rao"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Administrator Work Email</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g. operations@manamart.in"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  {inviteError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                      {inviteError}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetModal}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generating}
                      className="flex-1 py-2.5 rounded-xl font-extrabold text-white bg-[#064E3B] hover:bg-[#033B2D] shadow-sm cursor-pointer transition-colors"
                    >
                      {generating ? 'Generating Link...' : 'Generate 48h Invite Link'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Invite Link Created Successfully!
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      This token is valid for <strong>48 hours</strong> and can only be used once to activate this administrator account.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Secure Invitation URL:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-[11px] text-slate-700"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2.5 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-xl font-bold cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={resetModal}
                    className="w-full py-2.5 rounded-xl font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminPortalLayout>
  );
}

