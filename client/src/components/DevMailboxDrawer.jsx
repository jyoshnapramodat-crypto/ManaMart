import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import {
  Mail,
  X,
  Copy,
  Check,
  Zap,
  Trash2,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Minimize2,
  Maximize2,
  KeyRound,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function DevMailboxDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'otp' | 'confirmation'

  // Floating notification toast for incoming simulated email
  const [floatingToast, setFloatingToast] = useState(null);

  useEffect(() => {
    // Initial load
    setInbox(notificationService.getInbox());

    // Subscribe to incoming emails
    const unsubscribe = notificationService.subscribe((updatedInbox, latestEmail) => {
      setInbox([...updatedInbox]);
      if (latestEmail) {
        setSelectedEmail(latestEmail);
        setFloatingToast(latestEmail);

        // Auto-dismiss floating toast after 7s
        const timer = setTimeout(() => {
          setFloatingToast((cur) => (cur?.id === latestEmail.id ? null : cur));
        }, 7000);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopyOtp = (otpCode, id) => {
    if (!otpCode) return;
    navigator.clipboard.writeText(otpCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAutoFill = (otpCode) => {
    if (!otpCode) return;
    notificationService.triggerAutoFill(otpCode);
    navigator.clipboard.writeText(otpCode);
    setCopiedId('autofill');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all simulated emails from dev mailbox?')) {
      notificationService.clearInbox();
      setSelectedEmail(null);
    }
  };

  const handleDeleteOne = (e, emailId) => {
    e.stopPropagation();
    notificationService.deleteEmail(emailId);
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const filteredEmails = inbox.filter((em) => {
    if (activeTab === 'otp') return em.type === 'otp';
    if (activeTab === 'confirmation') return em.type === 'confirmation';
    return true;
  });

  const unreadCount = inbox.filter((e) => !e.isRead).length;

  return (
    <>
      {/* FLOATING TOAST POPUP WHEN SIMULATED EMAIL ARRIVES */}
      {floatingToast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-orange-500 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white shadow-xs">
                <Mail className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider block">
                  Simulated Dev Email Sent
                </span>
                <span className="text-xs font-bold text-slate-100 truncate block max-w-[200px]">
                  To: {floatingToast.to}
                </span>
              </div>
            </div>
            <button
              onClick={() => setFloatingToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 font-medium line-clamp-2">
            {floatingToast.subject}
          </p>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            {floatingToast.otpCode && (
              <button
                onClick={() => {
                  handleAutoFill(floatingToast.otpCode);
                  setFloatingToast(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-xs hover:from-orange-500 hover:to-amber-500 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Auto-fill OTP ({floatingToast.otpCode})</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedEmail(floatingToast);
                setIsOpen(true);
                setFloatingToast(null);
              }}
              className="text-xs font-bold text-slate-300 hover:text-white underline ml-auto"
            >
              Open Mailbox
            </button>
          </div>
        </div>
      )}

      {/* FLOATING TRIGGER PILL (Bottom-Right Dev Badge) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-full shadow-2xl border-2 transition-all group ${
            isOpen
              ? 'bg-slate-900 border-orange-500 text-white ring-4 ring-orange-500/20'
              : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-orange-500'
          }`}
          title="Open ManaMart Simulated Fake Mailbox"
        >
          <div className="relative">
            <Mail className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
            {inbox.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {inbox.length}
              </span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">
              Dev Fake Mailbox
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              {inbox.length} {inbox.length === 1 ? 'email' : 'emails'} captured
            </span>
          </div>
        </button>
      </div>

      {/* SIMULATED MAILBOX DRAWER / MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Mailbox Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-white">
                      ManaMart In-Memory Fake Mailbox
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-mono">
                      Mock SMTP Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Captures simulated verification OTPs & reservation confirmation passes in local state
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {inbox.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center space-x-1"
                    title="Clear Mailbox"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs Bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: `All (${inbox.length})` },
                  { id: 'otp', label: `OTPs (${inbox.filter((e) => e.type === 'otp').length})` },
                  { id: 'confirmation', label: `Confirmations (${inbox.filter((e) => e.type === 'confirmation').length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                storage: in-memory + localStorage
              </span>
            </div>

            {/* Main Content: Split View (List on left, Viewer on right) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Email List */}
              <div className="w-full md:w-80 border-r border-slate-200 overflow-y-auto bg-slate-50/50 p-3 space-y-2 flex-shrink-0 max-h-56 md:max-h-none">
                {filteredEmails.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No emails in inbox</p>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                      Submit a Dine-In reservation request to see live OTP emails captured here!
                    </p>
                  </div>
                ) : (
                  filteredEmails.map((email) => {
                    const isSelected = selectedEmail?.id === email.id;
                    const isOtp = email.type === 'otp';

                    return (
                      <div
                        key={email.id}
                        onClick={() => {
                          setSelectedEmail(email);
                          notificationService.markAsRead(email.id);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-white border-orange-500 shadow-sm ring-1 ring-orange-200'
                            : 'bg-white/80 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className={`font-mono font-bold px-1.5 py-0.2 rounded-md ${
                            isOtp ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOtp ? 'OTP CODE' : 'PASS CONFIRMED'}
                          </span>
                          <span>{new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <span className="text-xs font-extrabold text-slate-900 block truncate">
                          {email.subject}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          To: {email.to}
                        </span>

                        {/* Quick 1-click OTP pill right on card */}
                        {isOtp && email.otpCode && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-orange-600 tracking-wider">
                              OTP: {email.otpCode}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAutoFill(email.otpCode);
                              }}
                              className="text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 px-2 py-0.5 rounded-lg flex items-center space-x-1"
                            >
                              <Zap className="w-2.5 h-2.5" />
                              <span>Auto-fill</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Email Viewer */}
              <div className="flex-1 overflow-y-auto bg-white p-4 sm:p-6 flex flex-col">
                {selectedEmail ? (
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="border-b border-slate-100 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          selectedEmail.type === 'otp'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {selectedEmail.type === 'otp' ? 'Verification OTP' : 'Reservation Confirmation Pass'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(selectedEmail.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {selectedEmail.subject}
                      </h2>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 font-mono text-slate-600">
                        <div><strong>From:</strong> reservations@manamart.local (Simulated SMTP Gateway)</div>
                        <div><strong>To:</strong> <span className="text-slate-900 font-bold">{selectedEmail.to}</span></div>
                      </div>
                    </div>

                    {/* Dedicated Quick Action Box for OTP */}
                    {selectedEmail.type === 'otp' && selectedEmail.otpCode && (
                      <div className="p-4 bg-orange-50/70 rounded-2xl border-2 border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 text-center sm:text-left">
                          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                            <KeyRound className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                              Extracted 6-Digit Code
                            </span>
                            <span className="text-2xl font-mono font-black text-slate-900 tracking-widest">
                              {selectedEmail.otpCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleCopyOtp(selectedEmail.otpCode, selectedEmail.id)}
                            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold bg-white transition-all flex items-center justify-center space-x-1"
                          >
                            {copiedId === selectedEmail.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleAutoFill(selectedEmail.otpCode)}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center space-x-1"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Auto-fill in Form</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* HTML Preview Render */}
                    <div className="p-2 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30">
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                        className="email-html-wrapper"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="m-auto text-center space-y-2 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Select an email to view full contents</p>
                    <p className="text-[11px] text-slate-400">
                      Incoming booking OTPs and confirmation passes will appear here in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

