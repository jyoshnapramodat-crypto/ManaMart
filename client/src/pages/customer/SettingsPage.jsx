import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Globe,
  Moon,
  Sun,
  Bell,
  Lock,
  User,
  Trash2,
  FileText,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Check,
  AlertTriangle,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Language State
  const currentLang = i18n.language || 'en';

  // Theme Mode State
  const themeMode = theme;

  // Accessibility State
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('manamart_high_contrast') === 'true');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('manamart_large_text') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('manamart_reduced_motion') === 'true');

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    orderStatus: true,
    deliveryTracking: true,
    storePromos: true,
    refundUpdates: true,
    monthlyReminders: true,
  });

  // Modals State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('manamart_lang', lang);
  };

  const handleThemeToggle = (mode) => {
    setTheme(mode);
  };

  const handleToggleAccessibility = (key, val, setter) => {
    setter(val);
    localStorage.setItem(`manamart_${key}`, String(val));
  };

  const handleAccountDelete = () => {
    if (deleteConfirmationInput !== 'DELETE') {
      alert('Please type DELETE to confirm account removal request.');
      return;
    }
    alert('Your account deletion request has been scheduled according to privacy guidelines. You have been signed out.');
    logout();
    navigate('/');
  };

  return (
    <div className={`max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24 ${largeText ? 'text-base' : 'text-sm'}`}>
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">App Settings & Preferences</h1>
          <p className="text-xs text-slate-500">Customize language, notifications, display, and account security</p>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
          v2.4.0 Stitch
        </span>
      </div>

      {/* SECTION 1: LANGUAGE PREFERENCE (English & Telugu) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Language / భాష
            </h3>
            <span className="text-[11px] text-slate-500">Select your preferred app interface language</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
              currentLang === 'en'
                ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-200'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-black block">English</span>
              <span className="text-[10px] text-slate-500">Standard English UI</span>
            </div>
            {currentLang === 'en' && <Check className="w-4 h-4 text-orange-600" />}
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('te')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
              currentLang === 'te'
                ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-200'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-black block">తెలుగు (Telugu)</span>
              <span className="text-[10px] text-slate-500">మన ఊరు. మన మార్కెట్.</span>
            </div>
            {currentLang === 'te' && <Check className="w-4 h-4 text-orange-600" />}
          </button>
        </div>
      </div>

      {/* SECTION 2: THEME & DISPLAY */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            {themeMode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Appearance & Theme
            </h3>
            <span className="text-[11px] text-slate-500">Toggle between Light and Dark interface</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleThemeToggle('light')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-2.5 ${
              themeMode === 'light'
                ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-200'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-xs font-bold block">Light Mode</span>
              <span className="text-[10px] text-slate-500">Warm Ivory & Jade</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeToggle('dark')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-2.5 ${
              themeMode === 'dark'
                ? 'border-orange-500 bg-slate-900 text-white font-bold ring-1 ring-orange-200'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-xs font-bold block">Dark Mode</span>
              <span className="text-[10px] text-slate-400">Night & Low-light</span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: ACCESSIBILITY ENHANCEMENTS (Module 13) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Accessibility & Comfort
            </h3>
            <span className="text-[11px] text-slate-500">Readable typography and friendly touch ergonomics</span>
          </div>
        </div>

        <div className="space-y-2 pt-1 divide-y divide-slate-100 text-xs">
          {/* High Contrast */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">High Contrast Mode</span>
              <span className="text-[11px] text-slate-500">Increases border and text sharpness</span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => handleToggleAccessibility('high_contrast', e.target.checked, setHighContrast)}
              className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
            />
          </div>

          {/* Large Text Size */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Larger Text Sizing</span>
              <span className="text-[11px] text-slate-500">Enhance readability for elderly customers</span>
            </div>
            <input
              type="checkbox"
              checked={largeText}
              onChange={(e) => handleToggleAccessibility('large_text', e.target.checked, setLargeText)}
              className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
            />
          </div>

          {/* Reduced Motion */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Reduced Motion</span>
              <span className="text-[11px] text-slate-500">Minimize animations and transition effects</span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => handleToggleAccessibility('reduced_motion', e.target.checked, setReducedMotion)}
              className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: NOTIFICATION PREFERENCES */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Notification Preferences
            </h3>
            <span className="text-[11px] text-slate-500">Choose which alerts you wish to receive</span>
          </div>
        </div>

        <div className="space-y-2 pt-1 divide-y divide-slate-100 text-xs">
          {[
            { key: 'orderStatus', label: 'Order Confirmation & Status Updates', desc: 'Instant kitchen prep and dispatched alerts' },
            { key: 'deliveryTracking', label: 'Rider Live GPS Tracking', desc: 'When rider is 5 minutes away from your address' },
            { key: 'refundUpdates', label: 'Refund & Wallet Credit Alerts', desc: 'Notifications on successful UPI / card refunds' },
            { key: 'storePromos', label: 'Followed Store Special Offers', desc: 'Weekend handi biryani or fresh bakery batch updates' },
            { key: 'monthlyReminders', label: 'Monthly Recurring Shopping Reminders', desc: 'Preview and confirm recurring lists prior to dispatch' },
          ].map((item) => (
            <div key={item.key} className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">{item.label}</span>
                <span className="text-[11px] text-slate-500">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs[item.key]}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: ACCOUNT & PRIVACY */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Security & Privacy
            </h3>
            <span className="text-[11px] text-slate-500">Password, privacy rights, and data management</span>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-800 font-bold transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setShowAboutModal(true)}
            className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-800 font-bold transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-slate-500" />
              <span>About ManaMart & Terms of Service</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 px-3 rounded-xl hover:bg-red-50 border border-red-200 flex items-center justify-between text-red-600 font-bold transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Request Account Deletion</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* SECTION 6: LOGOUT */}
      <div className="pt-2">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-extrabold text-xs transition-colors flex items-center justify-center space-x-2 border border-slate-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from ManaMart</span>
        </button>
      </div>

      {/* MODAL: CHANGE PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-black text-sm text-slate-900">Change Account Password</h3>
            {passwordNotice ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl">
                Password updated successfully!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPasswordNotice(true);
                  setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordNotice(false);
                  }, 1200);
                }}
                className="space-y-3"
              >
                <input
                  type="password"
                  placeholder="Current Password"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  type="password"
                  placeholder="New Secure Password"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-orange-600 rounded-xl"
                  >
                    Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ABOUT & TERMS */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm text-slate-900">About ManaMart</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>ManaMart (Mana Ooru. Mana Market.)</strong> connects local neighborhood stores, kirana shops, fresh rythu bazaars, and iconic authentic restaurants directly to local customers within 25-35 minutes.
            </p>
            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border">
              <p>• 100% Verified Neighborhood Merchants</p>
              <p>• Guaranteed Transparent Pricing & Zero Hidden Surcharges</p>
              <p>• Direct Fair Compensation to Local Delivery Partners</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ACCOUNT DELETION CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-slate-900 text-center">
              Request Account Deletion?
            </h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              This action will schedule permanent deletion of your profile, saved addresses, wallet balance, and order history. Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder='Type "DELETE"'
              className="w-full text-xs text-center font-bold px-3 py-2 rounded-xl border border-red-300 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationInput('');
                }}
                className="flex-1 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAccountDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

