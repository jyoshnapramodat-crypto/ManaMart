import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShieldCheck,
  Store,
  Bike,
  AlertTriangle,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  FileText,
  RefreshCw,
} from 'lucide-react';

export default function AdminPortalLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) setStats(res.data.stats);
      } catch (err) {
        // Ok
      }
    }
    loadStats();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
    { to: '/admin/merchants/pending', label: 'Merchant Audits', icon: Store, badge: stats?.pendingMerchants },
    { to: '/admin/riders/pending', label: 'Rider Compliance', icon: Bike, badge: stats?.pendingRiders },
    { to: '/admin/disputes', label: 'Complaints & Disputes', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-slate-900">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Executive Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-slate-950 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 border-r border-slate-800 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm text-white tracking-tight">Root Governance</h2>
                <p className="text-[10px] text-purple-400 font-mono font-bold">ManaMart Platform Admin</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1.5 flex-1">
            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Executive Modules
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Admin User Footer */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-black text-xs">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-purple-300 font-mono">ROOT LEVEL ACCESS</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-900 hover:bg-red-950 hover:text-red-300 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Admin Console</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              ManaMart Governance & Platform Oversight
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Services Online
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

