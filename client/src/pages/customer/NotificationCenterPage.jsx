import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import soundService from '../../services/soundService';

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSoundName, setActiveSoundName] = useState('Standby • Click sound cards below to preview');
  const [activePlayingId, setActivePlayingId] = useState(null);
  const [pushStatus, setPushStatus] = useState('granted');
  const [copiedCode, setCopiedCode] = useState(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Live in-app notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'ord-8942',
      category: 'orders',
      type: 'order',
      title: 'New Order #ORD-8942 from Sri Lakshmi Kirana',
      message: '2x Sona Masoori Rice (5kg), 1x Heritage Curd. ₹680 paid via UPI. 10-Min Prep SLA.',
      time: 'Just now',
      isRead: false,
      soundType: 'order',
      badge: 'Merchant Core',
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'rider-302',
      category: 'rider',
      type: 'rider',
      title: 'Rider Naresh is turning into your gully! 🛵',
      message: 'Fresh coriander & milk arriving at Flat 402, Sai Residency. Please keep OTP 5849 ready.',
      time: '2m ago',
      isRead: false,
      soundType: 'rider',
      badge: 'Proximity Radar',
      badgeColor: 'bg-orange-500',
    },
    {
      id: 'deal-771',
      category: 'deals',
      type: 'deal',
      title: 'Banganapalli Mango Flash Drop: ₹99/kg 🥭',
      message: 'Fresh orchard harvest delivered directly to Madhapur & Begumpet residents today only.',
      time: '15m ago',
      isRead: true,
      soundType: 'deal',
      badge: 'Neighborhood Deal',
      badgeColor: 'bg-emerald-700',
    },
    {
      id: 'urg-104',
      category: 'orders',
      type: 'urgent',
      title: '15-Min Dine-In Hold Expiring: Swagath Grand ⏰',
      message: 'Table #4 for 4 guests requires confirmation within 3 minutes before auto-release.',
      time: '22m ago',
      isRead: false,
      soundType: 'urgent',
      badge: 'Urgent Pulse',
      badgeColor: 'bg-red-600',
    },
    {
      id: 'ref-552',
      category: 'refunds',
      type: 'refund',
      title: 'Daily Settlement Cleared: ₹14,820.00 💸',
      message: 'Direct NEFT to Sri Lakshmi Kirana (HDFC A/C ••8942) processed. 48 orders reconciled.',
      time: '1h ago',
      isRead: true,
      soundType: 'deal',
      badge: 'Wallet Credit',
      badgeColor: 'bg-emerald-600',
    },
  ]);

  // Subscribe to sound events
  useEffect(() => {
    const unsub = soundService.subscribe((event) => {
      if (event.type === 'sound_played') {
        setActiveSoundName(`▶ Playing: ${event.name}`);
        setTimeout(() => {
          setActiveSoundName('Standby • Click sound cards below to preview');
          setActivePlayingId(null);
        }, 2200);
      } else if (event.type === 'volume_change') {
        setVolume(Math.round(event.volume * 100));
      } else if (event.type === 'mute_toggle') {
        setIsMuted(event.isMuted);
      }
    });

    return () => unsub();
  }, []);

  // Check browser Notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const requestPushPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushStatus(perm);
        if (perm === 'granted') {
          soundService.playDealDing();
          new Notification('ManaMart Push Notifications Active! 🔔', {
            body: 'You will receive real-time order chimes, rider radar alerts, and dining confirmations.',
            icon: '/logo.png',
          });
        }
      } catch (err) {
        console.error('Permission error:', err);
      }
    }
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const analyser = soundService.getAnalyser();

    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.92;

        ctx.fillStyle = dataArray[i] > 140 ? '#fe6b00' : '#10b981';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
        if (x > canvas.width) break;
      }
    };

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 96;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Sound triggers
  const playSound = (type, id) => {
    setActivePlayingId(id || type);
    if (type === 'order') soundService.playOrderChime();
    else if (type === 'rider') soundService.playRiderChirp();
    else if (type === 'deal') soundService.playDealDing();
    else if (type === 'urgent') soundService.playUrgentAlert();
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    soundService.setVolume(val / 100);
  };

  const toggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifs =
    activeTab === 'all'
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-[#f8f9ff] text-[#121c2a] min-h-screen pb-20 selection:bg-primary-container selection:text-white">
      {/* Top Banner / System Console Breadcrumb */}
      <div className="bg-white border-b border-[#bfc9bc]/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link
              to="/app"
              className="inline-flex items-center text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
              Back to Catalog
            </Link>
            <span className="h-4 w-px bg-slate-200" />
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#055c24] text-white">
              System Console V2.4
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Hyperlocal Dispatch & Web Audio Engine
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>APNs / FCM: Online</span>
            </div>

            {pushStatus !== 'granted' ? (
              <button
                onClick={requestPushPermission}
                className="bg-[#055c24] hover:bg-[#004217] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                <span>Enable Web Push</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-emerald-200">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Push Granted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#bfc9bc]/60">
          <div>
            <div className="flex items-center gap-2 text-[#a93800] font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-base text-[#fd5a05]">notifications_active</span>
              <span>HYPERLOCAL NOTIFICATION ARCHITECTURE & ACOUSTIC DISPATCH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121c2a] tracking-tight">
              ManaMart Soundboard & Push Pipeline
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Complete engineering specification and acoustic frequency lab for instant Kirana merchant alerts,
              rider proximity pulses, and zero-failure push delivery across Android, iOS, and Chromium Web Push workers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <div className="bg-white border border-[#bfc9bc]/70 px-4 py-2.5 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase font-mono">
                AUDIO ENGINE
              </span>
              <span className="text-sm font-bold text-[#055c24] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Web Audio Synthesizer
              </span>
            </div>
            <div className="bg-white border border-[#bfc9bc]/70 px-4 py-2.5 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase font-mono">
                DISPATCH LATENCY
              </span>
              <span className="text-sm font-bold text-[#fe6b00] font-mono">
                &lt; 140ms Hyperlocal SLA
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Adaptive Icon Family & Notification Badges */}
        <section id="icons-showcase">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#a93800] uppercase tracking-wider">
                Asset System Matrix
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
                1. Adaptive Icon Family & Notification Badges
              </h2>
            </div>
            <span className="text-xs bg-slate-200/70 text-slate-700 px-3 py-1 rounded-full font-semibold">
              Design System V2.4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Master Brand Showcase */}
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-[#bfc9bc]/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#055c24] uppercase tracking-wider">
                    Master Brand Notification Asset
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-[#055c24]">
                    1024x1024 Hi-DPI
                  </span>
                </div>

                <div className="relative w-44 h-44 mx-auto my-6 group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-3xl opacity-20 blur-lg transition duration-500 group-hover:opacity-40" />
                  {/* High fidelity emerald squircle badge */}
                  <div className="relative w-44 h-44 rounded-3xl shadow-lg border-2 border-white bg-gradient-to-br from-[#055c24] via-[#004217] to-[#022a0e] flex flex-col items-center justify-center p-4 overflow-hidden">
                    {/* Concentric sound wave circles */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                      <div className="w-36 h-36 rounded-full border border-emerald-300 animate-ping" />
                      <div className="w-24 h-24 rounded-full border border-emerald-200/50 absolute" />
                    </div>
                    {/* Center Icon */}
                    <span className="material-symbols-outlined text-white text-5xl relative z-10 drop-shadow-md">
                      notifications_active
                    </span>
                    <span className="text-white font-extrabold text-xs tracking-wider mt-1 relative z-10 uppercase">
                      ManaMart
                    </span>
                  </div>

                  {/* Bouncing live count badge */}
                  <span className="absolute -top-2 -right-2 bg-[#fd5a05] text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-bounce">
                    {unreadCount || 3}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  ManaMart Bell Glyph + Radiant Pulse Array
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Engineered with deep emerald core (<code className="text-[#055c24] font-bold">#055C24</code>), radiant acoustic wave pulses, and hyper-visible marigold unread dot (<code className="text-[#fd5a05] font-bold">#FD5A05</code>) optimized for OLED contrast.
                </p>
              </div>
            </div>

            {/* Platform Matrix */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Android Stencil */}
              <div className="bg-white p-5 rounded-2xl border border-[#bfc9bc]/70 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">Android Stencil</span>
                    <span className="text-[11px] font-mono text-slate-400">API 24–34</span>
                  </div>
                  <div className="bg-gray-950 rounded-xl p-6 flex flex-col items-center justify-center min-h-[140px] text-white">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border border-gray-700">
                      <span className="material-symbols-outlined text-white text-2xl">
                        notifications_active
                      </span>
                      <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full" />
                    </div>
                    <span className="text-[11px] text-gray-400 mt-3 font-mono">
                      ic_stat_manapush.png
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Monochrome 24dp stencil on transparent canvas. High alpha contrast required by Android Notification Shade.
                </div>
              </div>

              {/* iOS Squircle Badge */}
              <div className="bg-white p-5 rounded-2xl border border-[#bfc9bc]/70 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">iOS App Icon Badge</span>
                    <span className="text-[11px] font-mono text-slate-400">iOS 16+ Live</span>
                  </div>
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[140px]">
                    <div className="relative w-16 h-16 rounded-[22%] bg-gradient-to-b from-[#055c24] to-[#004217] p-2 shadow-lg flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-2xl">storefront</span>
                      <div className="absolute -top-1.5 -right-1.5 bg-[#ff3b30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-md border border-white">
                        7
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-600 mt-2 font-mono">
                      AppIcon-60@3x.png
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Super-ellipse squircle profile with dynamic badge count updated via APNs remote payload <code className="bg-slate-100 px-1 rounded">badge: 7</code>.
                </div>
              </div>

              {/* Web Push Favicon */}
              <div className="bg-white p-5 rounded-2xl border border-[#bfc9bc]/70 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">Web Favicon Badge</span>
                    <span className="text-[11px] font-mono text-slate-400">PWA & Chrome</span>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center min-h-[140px]">
                    <div className="w-full bg-slate-950 rounded-lg p-2.5 flex items-center gap-2 border border-slate-800">
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <span className="material-symbols-outlined text-emerald-400 text-lg">storefront</span>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#fe6b00] rounded-full border border-slate-950" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium truncate">
                        (3) Sri Lakshmi Kirana
                      </span>
                      <span className="text-slate-500 ml-auto text-xs">✕</span>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-3 font-mono">
                      navigator.setAppBadge(3)
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  App Badging API support for Windows Taskbar, macOS Dock, and Chromium tab title state updates.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Notification Audio Synthesizer */}
        <section id="sound-synthesizer">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-xs font-bold text-[#a93800] uppercase tracking-wider">
                Acoustic Engineering
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
                2. Interactive Notification Audio Synthesizer
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Real-time HTML5 Web Audio oscillators. Tones crafted to pierce Indian bazaar background noise without inducing ear fatigue.
              </p>
            </div>

            {/* Global controls */}
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#bfc9bc]/70 shadow-xs flex-shrink-0">
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-[#055c24]">
                  {isMuted ? 'volume_off' : 'volume_up'}
                </span>
              </button>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500" htmlFor="master-volume">
                  Master Gain: <span className="font-mono text-emerald-800">{isMuted ? 'Muted' : `${volume}%`}</span>
                </label>
                <input
                  id="master-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#055c24] w-28"
                />
              </div>
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <button
                onClick={() => soundService.playSequenceTest()}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors flex items-center gap-1 border border-emerald-200"
              >
                <span className="material-symbols-outlined text-sm">play_circle</span>
                <span>Seq Test</span>
              </button>
            </div>
          </div>

          {/* Visualizer & Cards Container */}
          <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 p-6 shadow-xs space-y-6">
            {/* Frequency Canvas Visualizer */}
            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">
                    SYNTHESIZER OSCILLOSCOPE ACTIVE
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  {activeSoundName}
                </div>
              </div>
              <canvas ref={canvasRef} className="w-full h-24 rounded bg-gray-900/60" />
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-2 px-1">
                <span>200 Hz (Sub/Warmth)</span>
                <span>523.25 Hz (C5 Fundamental)</span>
                <span>1046.5 Hz (C6 Brass Overtone)</span>
                <span>2093 Hz (Auditory Pierce)</span>
                <span>4 kHz (Crystal Decay)</span>
              </div>
            </div>

            {/* The 4 Sound Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Profile 1 */}
              <div className="bg-[#eff4ff]/60 border border-[#bfc9bc]/70 hover:border-[#055c24] transition-all p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#055c24] text-white">
                      Merchant Core
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">1.2s • Dual Tone</span>
                  </div>
                  <h3 className="text-base font-bold text-[#055c24] group-hover:text-emerald-800 transition-colors">
                    Hyperlocal Order Chime
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Uplifting dual marimba / brass gong resonant chime. Penetrates 75dB neighborhood shop chatter to announce immediate orders.
                  </p>
                  <div className="mt-3 p-2 bg-white rounded-lg border border-[#bfc9bc]/60 text-[11px] font-mono text-slate-500 space-y-0.5">
                    <div>Primary: 523.25Hz (C5) Sine + Tri</div>
                    <div>Accent: 659.25Hz (E5) Brass chime</div>
                    <div>Decay: Exponential 1200ms</div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => playSound('order')}
                    className="w-full bg-[#055c24] hover:bg-[#004217] active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Play Order Chime</span>
                  </button>
                </div>
              </div>

              {/* Profile 2 */}
              <div className="bg-[#eff4ff]/60 border border-[#bfc9bc]/70 hover:border-[#a93800] transition-all p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fd5a05] text-white">
                      Delivery Radar
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">420ms • Staccato</span>
                  </div>
                  <h3 className="text-base font-bold text-[#a93800] group-hover:text-orange-700 transition-colors">
                    Rider Proximity Alert
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Rapid dual chirp triggered when delivery hero is &lt;200m away. High frequency attention pulse with short envelope.
                  </p>
                  <div className="mt-3 p-2 bg-white rounded-lg border border-[#bfc9bc]/60 text-[11px] font-mono text-slate-500 space-y-0.5">
                    <div>Tone 1: 880Hz (A5) 80ms</div>
                    <div>Tone 2: 1320Hz (E6) 140ms</div>
                    <div>Gap: 60ms Doppler shift</div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => playSound('rider')}
                    className="w-full bg-[#fe6b00] hover:bg-[#a93800] active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Play Proximity Chirp</span>
                  </button>
                </div>
              </div>

              {/* Profile 3 */}
              <div className="bg-[#eff4ff]/60 border border-[#bfc9bc]/70 hover:border-emerald-600 transition-all p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                      Broadcast
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">1.8s • Harmonious</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#055c24] transition-colors">
                    Neighborhood Deal Ding
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Serene Tibetan singing bowl harmonic chime for flash grocery sales, mango arrivals, and festival sweets drops.
                  </p>
                  <div className="mt-3 p-2 bg-white rounded-lg border border-[#bfc9bc]/60 text-[11px] font-mono text-slate-500 space-y-0.5">
                    <div>Fundamental: 432Hz Healing pitch</div>
                    <div>Harmonic: 864Hz octave blend</div>
                    <div>Decay: Warm low-pass decay</div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => playSound('deal')}
                    className="w-full bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border border-slate-300 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Play Deal Ding</span>
                  </button>
                </div>
              </div>

              {/* Profile 4 */}
              <div className="bg-[#eff4ff]/60 border border-[#bfc9bc]/70 hover:border-red-600 transition-all p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ba1a1a] text-white">
                      Urgency Alert
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">750ms • Pulse</span>
                  </div>
                  <h3 className="text-base font-bold text-[#ba1a1a] group-hover:text-red-700 transition-colors">
                    15-Min Timer Alert
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Rhythmic countdown pulse alert for pending order timeouts, table reservations, and expiring cart hold timers.
                  </p>
                  <div className="mt-3 p-2 bg-white rounded-lg border border-[#bfc9bc]/60 text-[11px] font-mono text-slate-500 space-y-0.5">
                    <div>Beep 1 & 2: 740Hz Square blend</div>
                    <div>Final: 987Hz (B5) Attention strike</div>
                    <div>Filter: High-Q bandpass peak</div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => playSound('urgent')}
                    className="w-full bg-[#ba1a1a] hover:bg-red-700 active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Play Urgency Pulse</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Closed-App / Background Locked State Delivery */}
        <section id="closed-app-os">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#a93800] uppercase tracking-wider">
                Device Level Fidelity
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
                3. Zero-App / Background Locked State Delivery
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Exact operating system renders when the user has killed the app, locked the phone, or completely closed their browser window.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mockup A: Android OS Lock Screen */}
            <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 overflow-hidden shadow-xs flex flex-col">
              <div className="bg-gradient-to-r from-gray-900 to-slate-900 p-4 text-white flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">android</span>
                  <span className="font-bold text-xs">Android 14 Lock Screen</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  HIGH PRIORITY CHANNEL
                </span>
              </div>

              <div className="p-4 bg-slate-950 flex-1 flex flex-col justify-center items-center relative min-h-[440px]">
                {/* Clock */}
                <div className="text-center mb-4">
                  <div className="text-4xl font-extralight text-slate-100 tracking-wider">18:42</div>
                  <div className="text-xs text-slate-400">Wednesday, 24 October • Begumpet, HYD</div>
                </div>

                {/* Card */}
                <div className="w-full bg-[#1e293b]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-2xl text-white">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#055c24] flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xs">storefront</span>
                      </div>
                      <span className="font-bold tracking-tight text-white">ManaMart Partner</span>
                      <span className="text-slate-400">• now</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
                      <span className="material-symbols-outlined text-xs">volume_up</span>
                      <span>manachime.wav</span>
                    </div>
                  </div>

                  <div className="flex gap-3 my-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        NEW ORDER #ORD-8942 (₹680.00)
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Sri Lakshmi Kirana: 2x Sona Masoori Rice 5kg, 1x Heritage Curd. Customer paid via UPI.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                          ⚡ 10-Min Prep SLA
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                          Bypasses DND Silent
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60">
                    <button
                      onClick={() => playSound('order')}
                      className="bg-[#055c24] hover:bg-[#004217] text-white text-xs font-bold py-2 px-1 rounded-lg text-center shadow-xs"
                    >
                      Accept (10m)
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-1 rounded-lg text-center border border-slate-600">
                      Dashboard
                    </button>
                    <button className="bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-medium py-2 px-1 rounded-lg text-center border border-red-800/60">
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    Android Full-Screen Intent WakeLock Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 text-xs text-slate-600 border-t border-[#bfc9bc]/60">
                <span className="font-bold text-slate-900 block mb-1">Android OS Implementation:</span>
                Configured with <code className="bg-white border px-1 rounded">PRIORITY_MAX</code>, custom NotificationChannel with audio uri <code className="bg-white border px-1 rounded">android.resource://.../manachime</code> and action intents.
              </div>
            </div>

            {/* Mockup B: iOS Live Activity & Dynamic Island */}
            <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 overflow-hidden shadow-xs flex flex-col">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 text-white flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-300">phone_iphone</span>
                  <span className="font-bold text-xs">iOS 17 Dynamic Island & Lock</span>
                </div>
                <span className="text-[10px] font-mono text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800">
                  APNs LIVE ACTIVITY
                </span>
              </div>

              <div className="p-4 bg-slate-900 flex-1 flex flex-col justify-start items-center relative min-h-[440px]">
                {/* Dynamic Island Capsule */}
                <div className="w-56 bg-black rounded-full px-4 py-2 flex items-center justify-between text-white border border-gray-800 shadow-2xl mb-8 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-black text-[10px]">two_wheeler</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">4m away</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                    <span>#ORD-9842</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                </div>

                {/* iOS Lock Screen Notification Tile */}
                <div className="w-full bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/60 shadow-2xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#004217] flex items-center justify-center overflow-hidden border border-emerald-500/30">
                        <span className="material-symbols-outlined text-emerald-300 text-xs">two_wheeler</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white tracking-tight">MANAMART RIDER</span>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">ManaRider Proximity Alert</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">2m ago</span>
                  </div>

                  <div className="my-2">
                    <div className="font-semibold text-xs text-slate-100">
                      Rider Naresh is turning into your gully!
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Fresh coriander & milk order arriving at Flat 402, Sai Residency. Please keep OTP 5849 ready.
                    </p>
                  </div>

                  {/* ETA progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-1.5 my-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-orange-500 h-1.5 rounded-full w-4/5 animate-pulse" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/50 text-[11px]">
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">pin_drop</span> 140 meters away
                    </span>
                    <button
                      onClick={() => playSound('rider')}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-full font-medium"
                    >
                      Call Rider
                    </button>
                  </div>
                </div>

                <div className="mt-auto mb-2 text-center">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 justify-center">
                    <span className="material-symbols-outlined text-xs">sound_detection_dog_barking</span>
                    Critical Alert Auth Entitlement Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 text-xs text-slate-600 border-t border-[#bfc9bc]/60">
                <span className="font-bold text-slate-900 block mb-1">iOS Pipeline Implementation:</span>
                Delivered via APNs <code className="bg-white border px-1 rounded">live-activity</code> with payload token, custom sound <code className="bg-white border px-1 rounded">rider_chirp.caf</code>, and Lock Screen widget extension.
              </div>
            </div>

            {/* Mockup C: Desktop OS Web Push Toast Banner */}
            <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 overflow-hidden shadow-xs flex flex-col">
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-4 text-white flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400">desktop_windows</span>
                  <span className="font-bold text-xs">Web Push (Chrome & Windows / Mac)</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  SERVICE WORKER ACTIVE
                </span>
              </div>

              <div className="p-4 bg-slate-950 flex-1 flex flex-col justify-center items-end relative min-h-[440px] overflow-hidden">
                <div className="relative z-10 w-full mb-auto pt-2">
                  <div className="bg-slate-800/60 rounded px-2.5 py-1 text-[11px] text-slate-400 font-mono inline-block">
                    Browser State: 0 Open Tabs • System In Idle
                  </div>
                </div>

                {/* Native OS Notification Toast */}
                <div className="relative z-10 w-full max-w-sm bg-gray-900/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-700 shadow-2xl text-white my-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">notifications</span>
                      <span className="font-medium text-gray-300">Google Chrome • manamart.in</span>
                    </div>
                    <button className="text-gray-400 hover:text-white text-xs">✕</button>
                  </div>

                  <div className="flex gap-3 my-2.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700 flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400 text-xl">payments</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Daily Settlement Cleared!</span>
                        <span className="text-emerald-400 font-mono text-[11px]">₹14,820.00</span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1 leading-normal">
                        Direct NEFT to Sri Lakshmi Kirana (HDFC A/C ••8942) has been processed. 48 orders reconciled.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                    <button className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded">
                      Dismiss
                    </button>
                    <button
                      onClick={() => playSound('deal')}
                      className="text-[11px] bg-[#055c24] text-white font-medium px-3 py-1 rounded hover:bg-[#004217]"
                    >
                      View Passbook
                    </button>
                  </div>
                </div>

                <div className="relative z-10 w-full mt-auto pt-2 text-right">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Triggered via ServiceWorkerGlobalScope.showNotification()
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 text-xs text-slate-600 border-t border-[#bfc9bc]/60">
                <span className="font-bold text-slate-900 block mb-1">Web Push Protocol Implementation:</span>
                Push Service wakes up background Service Worker (<code className="bg-white border px-1 rounded">sw.js</code>) even if the user hasn't visited the website for 7 days via persistent VAPID subscription endpoint.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Architecture Pipeline & Code */}
        <section id="architecture-pipeline">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#a93800] uppercase tracking-wider">
                Production Engineering Spec
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
                4. Closed-App Push Notification Architecture & Code Pipeline
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Complete technical blueprint covering service worker registration, high-priority wake locks, fallback gateways, and offline sync.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Service Worker Code */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#bfc9bc]/70 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#055c24]">terminal</span>
                    <h3 className="font-bold text-sm text-slate-900">
                      Service Worker (<code className="text-emerald-700">public/sw.js</code>) Execution Engine
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `self.addEventListener('push', (event) => {\n  const payload = event.data.json();\n  self.registration.showNotification(payload.title, {\n    body: payload.body,\n    icon: '/logo.png',\n    tag: payload.orderId,\n    requireInteraction: payload.priority === 'HIGH'\n  });\n});`
                      );
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {copiedCode ? '✓ Copied' : 'Copy Code'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  This code operates autonomously in the browser's background thread without requiring any open DOM window or active tab:
                </p>

                <div className="bg-gray-950 text-gray-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-gray-800">
                  <pre className="leading-relaxed">
{`// 1. Service Worker: Listen for Push Even When Website Closed
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();

  // Configure rich notification options with high-priority audio & action buttons
  const options = {
    body: payload.body,
    icon: '/logo.png',
    badge: '/logo.png',
    silent: false,
    tag: payload.orderId || 'hyperlocal-order',
    renotify: true,
    requireInteraction: payload.priority === 'HIGH', // Keeps on screen
    data: {
      orderId: payload.orderId,
      url: payload.click_action || '/orders',
      soundType: payload.soundType || 'order'
    },
    actions: [
      { action: 'accept', title: 'Accept (10m)' },
      { action: 'reject', title: 'Reject' }
    ]
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, options),
      // Update App Badging API on OS Taskbar/Dock
      navigator.setAppBadge ? navigator.setAppBadge(payload.unreadCount || 1) : Promise.resolve()
    ])
  );
});`}
                  </pre>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span><strong className="text-[#055c24]">VAPID Standard:</strong> RFC 8292 Application Server Keys</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  TTL: 2419200 (4 Weeks Queueing)
                </span>
              </div>
            </div>

            {/* Right 5 Cols: Failover tree & Payload */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Failover card */}
              <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 p-5 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fe6b00]">alt_route</span>
                  Gateway Failover & Fallback Tree
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#055c24] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">ManaMart Dispatch Microservice</div>
                      <div className="text-[11px] text-slate-500">Order confirmed in DB → triggers webhook (&lt;12ms).</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#055c24] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Dual Pipe Broadcast (FCM + APNs)</div>
                      <div className="text-[11px] text-slate-500">
                        Sends <code className="text-[#055c24] font-bold">priority: "high"</code> payload with wake-lock hints.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#fe6b00] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Telco Fallback: WhatsApp / IVR Pulse</div>
                      <div className="text-[11px] text-slate-500">
                        If unacknowledged within 45s in 2G kirana alleys, system auto-dials automated voice ring.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Background Sync API (IndexedDB)</div>
                      <div className="text-[11px] text-slate-500">
                        Merchant actions cached offline and flushed via <code className="text-[#055c24] font-bold">sync</code> event upon reconnection.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Push Payload Card */}
              <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 p-5 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#055c24]">data_object</span>
                  High-Priority JSON Push Payload
                </h3>
                <div className="bg-gray-950 text-gray-200 rounded-xl p-3 font-mono text-[11px] overflow-x-auto border border-gray-800">
                  <pre>{`{
  "to": "/topics/merchant_HYD8942",
  "priority": "high",
  "android": {
    "priority": "HIGH",
    "notification": {
      "channel_id": "mana_urgent_orders",
      "sound": "manachime",
      "default_vibrate_timings": true
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "manachime.caf",
        "content-available": 1
      }
    }
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Live In-App Notification Center Simulator */}
        <section id="notification-inbox">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <span className="text-xs font-bold text-[#a93800] uppercase tracking-wider">
                User Experience Simulation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
                5. Live Notification Inbox & Simulator
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#055c24] hover:text-[#004217] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                <span>Mark All Read</span>
              </button>
              <button
                onClick={() => {
                  const testNotif = {
                    id: `sim-${Date.now()}`,
                    category: 'orders',
                    type: 'order',
                    title: 'Live Simulated Order Alert #ORD-9999',
                    message: 'Sri Lakshmi Kirana received a new order for Instant Delivery.',
                    time: 'Just now',
                    isRead: false,
                    soundType: 'order',
                    badge: 'Simulated Event',
                    badgeColor: 'bg-[#055c24]',
                  };
                  setNotifications((prev) => [testNotif, ...prev]);
                  playSound('order');
                }}
                className="text-xs font-bold text-white bg-[#fd5a05] hover:bg-[#a93800] px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add_alert</span>
                <span>Simulate Push Event</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#bfc9bc]/70 shadow-xs overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 px-4 py-3 bg-slate-50/70 gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'orders', label: 'Orders & Dining' },
                { id: 'rider', label: 'Rider Radar' },
                { id: 'refunds', label: 'Wallet & Refunds' },
                { id: 'deals', label: 'Store Specials' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#055c24] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification items */}
            <div className="divide-y divide-slate-100">
              {filteredNotifs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                    notifications_off
                  </span>
                  <p className="text-sm font-semibold">No notifications in this category</p>
                </div>
              ) : (
                filteredNotifs.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      !item.isRead ? 'bg-orange-50/20' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs ${
                          item.soundType === 'order'
                            ? 'bg-[#055c24]'
                            : item.soundType === 'rider'
                            ? 'bg-[#fd5a05]'
                            : item.soundType === 'urgent'
                            ? 'bg-[#ba1a1a]'
                            : 'bg-emerald-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {item.soundType === 'order'
                            ? 'shopping_bag'
                            : item.soundType === 'rider'
                            ? 'two_wheeler'
                            : item.soundType === 'urgent'
                            ? 'timer'
                            : 'local_offer'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{item.time}</span>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#fd5a05]" />
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => playSound(item.soundType, item.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                          activePlayingId === item.id
                            ? 'bg-[#055c24] text-white border-[#055c24]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {activePlayingId === item.id ? 'graphic_eq' : 'volume_up'}
                        </span>
                        <span>Preview Tone</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
