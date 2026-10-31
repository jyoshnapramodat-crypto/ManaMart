import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Store, Bike, ShieldCheck } from 'lucide-react';

export default function QuickRoleSwitcher() {
  const { role, quickSwitchRole, user } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'customer', label: 'Customer', icon: User, path: '/' },
    { id: 'merchant', label: 'Merchant', icon: Store, path: '/merchant' },
    { id: 'rider', label: 'Rider Partner', icon: Bike, path: '/rider' },
    { id: 'admin', label: 'Platform Admin', icon: ShieldCheck, path: '/admin' },
  ];

  const handleRoleChange = async (targetRole, path) => {
    await quickSwitchRole(targetRole);
    navigate(path);
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800 shadow-sm">
      <div className="flex items-center space-x-2 font-medium">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">Test Simulator:</span>
        <span className="text-slate-400 hidden sm:inline">Active as</span>
        <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold border border-orange-500/30">
          {role.toUpperCase()} ({user?.name || 'LocalLoop User'})
        </span>
      </div>

      <div className="flex items-center space-x-1 mt-1 sm:mt-0">
        <span className="text-slate-400 mr-1 text-[11px] hidden md:inline">Switch Role:</span>
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleRoleChange(r.id, r.path)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

