import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import soundService from '../services/soundService';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  LifeBuoy,
  Repeat,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

export default function NotificationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);

  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      category: 'orders',
      title: 'Order Dispatched from Swagath Grand! 🍛',
      message: 'Neighborhood rider Ramesh has picked up your Handi Dum Biryani. Arriving in 18 mins.',
      time: '5m ago',
      isRead: false,
      link: '/orders',
    },
    {
      id: 'n-2',
      category: 'refunds',
      title: 'Refund Credited: ₹32 via UPI 💸',
      message: 'Your refund for the damaged milk packet on Ticket #TKT-8942 has been successfully credited.',
      time: '35m ago',
      isRead: false,
      link: '/support',
    },
    {
      id: 'n-3',
      category: 'stores',
      title: 'Niloufer Cafe Evening Batch Ready ☕',
      message: 'Fresh Irani Dum Chai and melt-in-mouth Osmania biscuits ready for 15-min delivery.',
      time: '2h ago',
      isRead: true,
      link: '/feed',
    },
    {
      id: 'n-4',
      category: 'offers',
      title: 'Weekend Biryani Fest: 20% Off',
      message: 'Use code SWAGATHFREE on family handi packs across Madhapur & Gachibowli.',
      time: '5h ago',
      isRead: true,
      link: '/app',
    },
    {
      id: 'n-5',
      category: 'recurring',
      title: 'Monthly Pantry Schedule Reminder 🌾',
      message: 'Your monthly staple order with Sri Lakshmi Kirana is due for authorization in 2 days.',
      time: 'Yesterday',
      isRead: true,
      link: '/recurring',
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.category === 'orders') {
      soundService.playOrderChime();
    } else {
      soundService.playDealDing();
    }
    onClose();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredNotifs =
    activeCategory === 'all'
      ? notifications
      : notifications.filter((n) => n.category === activeCategory);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#003527]/5 via-orange-50/50 to-amber-50/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm">Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Live order status, stores, & community alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200 transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Explanation Banner (Module 12) */}
        {showPermissionBanner && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-start justify-between text-xs text-emerald-950">
            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold block">Keep Push Notifications Active</span>
                <span className="text-[11px] text-emerald-800 leading-tight block">
                  Enables live order tracking, rider arrival alerts, and refund notifications.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPermissionBanner(false)}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Category Filters Bar */}
        <div className="flex border-b border-slate-100 px-3 py-2 bg-slate-50/80 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'orders', label: 'Orders' },
            { id: 'refunds', label: 'Refunds' },
            { id: 'stores', label: 'Shops' },
            { id: 'offers', label: 'Offers' },
            { id: 'recurring', label: 'Pantry' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[11px] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Action Controls: Mark Read & Clear */}
        <div className="px-4 py-2 bg-white flex items-center justify-between text-xs text-slate-500 border-b border-slate-50">
          <button
            onClick={markAllAsRead}
            className="font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
          <button
            onClick={clearAllNotifications}
            className="hover:text-red-600 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No notifications in this category</p>
              <p className="text-[11px] text-slate-400">You're completely up to date!</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 group ${
                  !notif.isRead
                    ? 'bg-orange-50/40 border-orange-200 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  notif.category === 'orders'
                    ? 'bg-orange-100 text-orange-700'
                    : notif.category === 'refunds'
                    ? 'bg-emerald-100 text-emerald-700'
                    : notif.category === 'stores'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {notif.category === 'orders' && <ShoppingBag className="w-4 h-4" />}
                  {notif.category === 'refunds' && <RotateCcw className="w-4 h-4" />}
                  {notif.category === 'stores' && <Sparkles className="w-4 h-4" />}
                  {notif.category === 'offers' && <Tag className="w-4 h-4" />}
                  {notif.category === 'recurring' && <Repeat className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-orange-600">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.time}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (notif.category === 'orders') soundService.playOrderChime();
                        else if (notif.category === 'refunds') soundService.playDealDing();
                        else soundService.playRiderChirp();
                      }}
                      className="text-slate-400 hover:text-orange-600 p-1 rounded-md hover:bg-white transition-colors"
                      title="Preview Tone"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Link to Soundboard & Architecture Page */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Web Audio Synthesizer</span>
          </div>
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-xs font-bold text-[#055c24] hover:text-[#004217] flex items-center space-x-1 bg-white border border-emerald-300 px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors"
          >
            <span>Open Soundboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}

