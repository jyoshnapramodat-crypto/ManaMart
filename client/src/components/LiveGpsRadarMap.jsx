import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Store,
  Bike,
  Navigation,
  Phone,
  Maximize2,
  Minimize2,
  Layers,
  Compass,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import soundService from '../services/soundService';

export default function LiveGpsRadarMap({
  order = {
    orderId: 'ORD-8942',
    merchantName: 'Sri Lakshmi Kirana & General Stores',
    riderName: 'Naresh Rider',
    riderPhone: '9848055555',
    deliveryAddress: 'Flat 402, Sai Residency, Madhapur, Hyderabad',
  },
  onClose,
  isModal = false,
}) {
  const [mapType, setMapType] = useState('street'); // 'street' | 'satellite'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [riderProgress, setRiderProgress] = useState(65); // 0 to 100%
  const [speed, setSpeed] = useState(28); // km/h
  const [distanceRemaining, setDistanceRemaining] = useState(420); // meters
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [turnInstruction, setTurnInstruction] = useState('Turn right into Gully 3 (Ayyappa Society)');
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(true);

  // Simulated GPS waypoints along the route
  const waypoints = [
    { pct: 0, text: 'Picked up from Sri Lakshmi Kirana counter', turn: 'Head North on Main Road' },
    { pct: 25, text: 'Passing Madhapur Metro Pillar 18', turn: 'Take second exit at roundabout' },
    { pct: 50, text: 'Crossed 100 Feet Road junction', turn: 'Turn right into Gully 3' },
    { pct: 75, text: 'Approaching Sai Residency gate', turn: 'Straight 100m to Block A' },
    { pct: 100, text: 'Rider arrived at your building entrance!', turn: 'Keep Delivery OTP 5849 ready' },
  ];

  // Animate rider along route
  useEffect(() => {
    if (!isSimulatingMovement) return;

    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 98) {
          setDistanceRemaining(40);
          setEtaMinutes(1);
          setTurnInstruction('Arrived at your doorstep! Share OTP 5849.');
          soundService.playRiderChirp();
          return 99;
        }
        const next = prev + 1.2;
        const remainingM = Math.max(50, Math.round(1200 * (1 - next / 100)));
        setDistanceRemaining(remainingM);
        setEtaMinutes(Math.max(1, Math.ceil(remainingM / 300)));
        setSpeed(Math.floor(22 + Math.random() * 12));

        if (next > 75) {
          setTurnInstruction(waypoints[3].turn);
        } else if (next > 50) {
          setTurnInstruction(waypoints[2].turn);
        } else if (next > 25) {
          setTurnInstruction(waypoints[1].turn);
        }

        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulatingMovement]);

  // SVG curved path coordinates (x: 40 to 560, y: 220 to 50)
  // Interpolate rider pin position along the bezier curve
  const t = riderProgress / 100;
  // Curve points: P0(60, 240), P1(200, 110), P2(360, 190), P3(540, 70)
  // Cubic bezier formula
  const cx =
    Math.pow(1 - t, 3) * 60 +
    3 * Math.pow(1 - t, 2) * t * 200 +
    3 * (1 - t) * Math.pow(t, 2) * 360 +
    Math.pow(t, 3) * 540;

  const cy =
    Math.pow(1 - t, 3) * 240 +
    3 * Math.pow(1 - t, 2) * t * 110 +
    3 * (1 - t) * Math.pow(t, 2) * 190 +
    Math.pow(t, 3) * 70;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950 text-white ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-3xl' : 'h-[360px] sm:h-[440px]'
      }`}
    >
      {/* Map Background Layer: OpenStreetMap / Satellite Hybrid Vector Tiles */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          mapType === 'satellite' ? 'bg-[#0f172a]' : 'bg-[#090d16]'
        }`}
      >
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Road vector patterns simulating Hyderabad city grid */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="120" x2="600" y2="120" stroke="#334155" strokeWidth="6" />
          <line x1="0" y1="260" x2="600" y2="260" stroke="#334155" strokeWidth="8" />
          <line x1="160" y1="0" x2="160" y2="400" stroke="#334155" strokeWidth="7" />
          <line x1="380" y1="0" x2="380" y2="400" stroke="#334155" strokeWidth="6" />
          <circle cx="200" cy="180" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
        </svg>

        {/* Glowing GPS Route Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 320" preserveAspectRatio="none">
          {/* Base route glow */}
          <path
            d="M 60 240 C 200 110, 360 190, 540 70"
            fill="none"
            stroke="#fe6b00"
            strokeWidth="8"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          {/* Active dashed route line */}
          <path
            d="M 60 240 C 200 110, 360 190, 540 70"
            fill="none"
            stroke="#fe6b00"
            strokeWidth="4"
            strokeDasharray="8 6"
            className="animate-pulse"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Origin Store Pin */}
      <div className="absolute left-8 bottom-12 z-20 flex flex-col items-center">
        <div className="w-10 h-10 rounded-2xl bg-[#003527] border-2 border-white text-white flex items-center justify-center shadow-lg">
          <Store className="w-5 h-5 text-emerald-300" />
        </div>
        <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white mt-1 border border-white/20 whitespace-nowrap">
          {order.merchantName?.split(' ')[0] || 'Store'}
        </div>
      </div>

      {/* Live Rider Pin with Radar Sonar Pulses */}
      <div
        className="absolute z-30 flex flex-col items-center transition-all duration-700 ease-out pointer-events-none"
        style={{
          left: `${(cx / 600) * 100}%`,
          top: `${(cy / 320) * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Animated Radar Pulse Rings */}
        <div className="relative flex items-center justify-center">
          <span className="w-16 h-16 rounded-full bg-orange-500/25 animate-ping absolute" />
          <span className="w-10 h-10 rounded-full bg-emerald-500/40 animate-pulse absolute" />

          {/* Rider Scooter Badge */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#fe6b00] to-amber-400 text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-orange-500/30">
            <Bike className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Live Rider Name & Speed Tag */}
        <div className="bg-[#003527] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border border-emerald-400/50 mt-1 shadow-md flex items-center gap-1 whitespace-nowrap">
          <span>{order.riderName?.split(' ')[0] || 'Rider'}</span>
          <span className="text-emerald-300 font-mono">• {speed} km/h</span>
        </div>
      </div>

      {/* Destination Doorstep Pin */}
      <div className="absolute right-10 top-10 z-20 flex flex-col items-center">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg animate-bounce duration-1000">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white mt-1 border border-white/20 whitespace-nowrap">
          Your Doorstep
        </div>
      </div>

      {/* Top Telemetry Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-3 pointer-events-auto">
        <div className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-emerald-300">
            {riderProgress >= 98 ? 'Arrived at gate!' : `Rider ${distanceRemaining}m away`}
          </span>
          <span className="text-slate-400 text-xs font-mono">• ETA ~{etaMinutes} min</span>
        </div>

        {/* Map Type & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/20">
          <button
            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 text-xs font-bold flex items-center gap-1"
            title="Toggle Map Type"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline capitalize">{mapType}</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 text-xs font-bold ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bottom Live Turn-by-Turn Card & Call Rider Action */}
      <div className="absolute bottom-4 left-4 right-4 z-40 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <Navigation className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{turnInstruction}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live GPS Radar tracking updated via Socket.IO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${order.riderPhone || '9848055555'}`}
            className="px-3.5 py-1.5 rounded-xl bg-[#fe6b00] hover:bg-[#a04100] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider</span>
          </a>
          <button
            onClick={() => {
              soundService.playRiderChirp();
              setRiderProgress(98);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-600 transition-colors"
            title="Fast forward simulated arrival"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
