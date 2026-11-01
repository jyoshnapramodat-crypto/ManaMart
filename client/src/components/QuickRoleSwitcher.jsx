import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Store, Bike, ShieldCheck, Wrench, X, LogOut, RefreshCw } from 'lucide-react';

export default function QuickRoleSwitcher() {
  const { role, quickSwitchRole, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: 'customer', label: 'Customer', icon: User, path: '/app' },
    { id: 'merchant', label: 'Merchant (Owner)', icon: Store, path: '/merchant' },
    { id: 'rider', label: 'Rider Partner', icon: Bike, path: '/rider' },
    { id: 'admin', label: 'Platform Admin', icon: ShieldCheck, path: '/admin' },
  ];

  const handleRoleChange = async (targetRole, path) => {
    await quickSwitchRole(targetRole);
    navigate(path);
  };

  const handleClearSession = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // Minimized floating floating developer pill (non-intrusive)
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-950 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg border border-slate-700/80 backdrop-blur-md transition-all group"
          title="Open Developer Role Simulator"
        >
          <Wrench className="w-3.5 h-3.5 text-[#FF5A00] group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Role Simulator</span>
          <span className="bg-[#006837] text-white text-[9px] px-1.5 py-0.2 rounded-full uppercase">
            {role}
          </span>
        </button>
      </div>
    );
  }

  // Expanded Developer Simulator Drawer
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-slate-700/80 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Developer Role Simulator
          </h4>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2">
        <p className="text-[11px] text-slate-400">
          Current State:{' '}
          <strong className="text-orange-400 uppercase">{role}</strong> ({user?.name || 'Guest User'})
        </p>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id, r.path)}
                className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-[#FF5A00] text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <button
          onClick={handleClearSession}
          className="flex items-center space-x-1 text-red-400 hover:text-red-300 font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Reset to Clean Customer</span>
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
