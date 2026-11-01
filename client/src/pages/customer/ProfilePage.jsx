import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Repeat,
  LifeBuoy,
  Settings,
  Wallet,
  Heart,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { savedAddresses, setIsModalOpen } = useLocation();

  const [walletBalance, setWalletBalance] = useState(450);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('500');
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAddWalletMoney = (e) => {
    e.preventDefault();
    const val = Number(addAmount);
    if (!val || val <= 0) return;
    setWalletBalance((prev) => prev + val);
    setAddSuccess(true);
    setTimeout(() => {
      setShowAddMoney(false);
      setAddSuccess(false);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* User Info Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003527] to-[#055c24] text-white flex items-center justify-center font-black text-xl shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-slate-900">
                {user?.name || 'Neighborhood Guest'}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {user?.role || 'Guest'}
              </span>
            </div>
            <span className="text-xs text-slate-500 block">{user?.phone || '+91 98765 43210'}</span>
            <span className="text-[11px] text-slate-400 block">{user?.email || 'customer@gmail.com'}</span>
          </div>
        </div>

        {!isLoggedIn ? (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 transition-colors"
          >
            Sign In
          </Link>
        ) : (
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ManaMart Cash Wallet Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-[#003527] to-[#055c24] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                ManaMart Cash Wallet
              </span>
            </div>
            <div className="text-2xl font-black">₹{walletBalance}</div>
            <span className="text-[11px] text-emerald-200/80 block">
              Usable on all neighborhood stores, bakeries & dining
            </span>
          </div>

          <button
            onClick={() => setShowAddMoney(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* Modal: Top Up Wallet */}
      {showAddMoney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-black text-sm text-slate-900">Add Money to ManaMart Wallet</h3>
            {addSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>₹{addAmount} successfully credited via UPI!</span>
              </div>
            ) : (
              <form onSubmit={handleAddWalletMoney} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {['200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        addAmount === amt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-300'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMoney(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800"
                  >
                    Pay & Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Primary Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            title: 'My Orders & Invoices',
            desc: 'Track active, completed, & cancelled orders',
            icon: ShoppingBag,
            link: '/orders',
            color: 'bg-orange-100 text-orange-700',
          },
          {
            title: 'Delivery Addresses',
            desc: `${savedAddresses.length} saved addresses (Home, Work)`,
            icon: MapPin,
            action: () => setIsModalOpen(true),
            color: 'bg-blue-100 text-blue-700',
          },
          {
            title: 'Monthly Recurring Lists',
            desc: 'Essential groceries & dairy schedule',
            icon: Repeat,
            link: '/recurring',
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            title: 'Followed Shops & Posts',
            desc: 'Special offers from your favorite merchants',
            icon: Heart,
            link: '/feed',
            color: 'bg-rose-100 text-rose-700',
          },
          {
            title: 'Customer Help & Support',
            desc: 'FAQs, complaint tickets, and 24x7 chat',
            icon: LifeBuoy,
            link: '/support',
            color: 'bg-purple-100 text-purple-700',
          },
          {
            title: 'Settings & Language',
            desc: 'English / తెలుగు, theme, and accessibility',
            icon: Settings,
            link: '/settings',
            color: 'bg-slate-100 text-slate-700',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-500">{item.desc}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-orange-600 transition-all" />
            </div>
          );

          return item.link ? (
            <Link key={idx} to={item.link}>
              {content}
            </Link>
          ) : (
            <div key={idx} onClick={item.action}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

