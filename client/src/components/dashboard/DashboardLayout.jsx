import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import {
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Store,
  Bike,
  User,
  ShoppingBag,
  Sparkles,
  Settings,
  HelpCircle,
  Package,
  CalendarDays,
  Repeat,
  Heart,
  FileText,
  BarChart3,
  Tag,
  Users,
  Navigation,
  Compass,
} from 'lucide-react';

export default function DashboardLayout({
  role = 'customer',
  title,
  subtitle,
  sidebarItems = [],
  activeItem,
  onSelect,
  headerActions,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'Platform Administrator', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'merchant':
        return { label: 'Store Owner', bg: 'bg-[#064E3B] text-white border-emerald-800' };
      case 'rider':
        return { label: 'Delivery Partner', bg: 'bg-[#FF6B00] text-white border-orange-600' };
      default:
        return { label: 'Neighbor / Shopper', bg: 'bg-emerald-100 text-[#064E3B] border-emerald-300' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs px-4 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Logo size="md" showTagline={false} to={role === 'customer' ? '/app' : `/${role}`} />

            {/* Desktop Role Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${roleBadge.bg}`}>
                {roleBadge.label}
              </span>
              {user?.status === 'active' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Actions (if any) */}
            {headerActions}

            {/* Notifications Shortcut */}
            <Link
              to="/notifications"
              className="p-2 rounded-xl text-slate-600 hover:text-[#064E3B] hover:bg-[#E8F3EC] transition-all relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B00]" />
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 line-clamp-1">{user?.name || 'My Account'}</span>
                <span className="text-[10px] text-slate-500 capitalize">{role}</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar for Desktop */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-emerald-900/10 transition-all duration-200 z-30 ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse Toggle */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            {!collapsed && (
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase px-2">
                {role.toUpperCase()} NAVIGATION
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 mx-auto"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon || Compass;
              const isActive = activeItem === item.id || (item.path && location.pathname === item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onSelect) onSelect(item.id);
                    if (item.path) navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all text-left group ${
                    isActive
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-[#E8F3EC] hover:text-[#064E3B]'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FF6B00]' : 'text-slate-500'}`} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#FF6B00] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Settings & Support Link */}
          <div className="p-3 border-t border-slate-100 space-y-1">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#E8F3EC] hover:text-[#064E3B] transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              {!collapsed && <span>Settings</span>}
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#E8F3EC] hover:text-[#064E3B] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              {!collapsed && <span>Help & Support</span>}
            </Link>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Navigation */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <Logo size="sm" showTagline={false} to="/" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}>
                  {roleBadge.label}
                </span>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto py-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon || Compass;
                  const isActive = activeItem === item.id || (item.path && location.pathname === item.path);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSidebarOpen(false);
                        if (onSelect) onSelect(item.id);
                        if (item.path) navigate(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
                        isActive
                          ? 'bg-[#064E3B] text-white'
                          : 'text-slate-700 hover:bg-[#E8F3EC]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#E8F3EC]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Header Banner */}
          {(title || subtitle) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{title}</span>
                  </h1>
                )}
                {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
              </div>
            </div>
          )}

          {/* Children View Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
