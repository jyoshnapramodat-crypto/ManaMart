import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Bot,
  Sparkles,
  Compass,
  Navigation,
  Search,
  Store,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Utensils,
  ShoppingBag,
  Pill,
  Cake,
} from 'lucide-react';

export default function ManaAIScout({ onStoreSelect }) {
  const [coords, setCoords] = useState({ lat: 17.4480, lng: 78.3910 });
  const [detectedAddress, setDetectedAddress] = useState('Madhapur & Hitec City, Hyderabad');
  const [detecting, setDetecting] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeRadius, setActiveRadius] = useState(3); // km

  // Rich nearby stores dataset with real geo-coordinates
  const nearbyPlaces = [
    {
      id: 'm-1',
      name: 'Swagath Grand Family Kitchen',
      category: 'food',
      type: 'Restaurant',
      lat: 17.4410,
      lng: 78.3960,
      distance: 0.6,
      eta: '18 mins',
      rating: 4.8,
      specialty: 'Aromatic Hyderabadi Dum Biryani & Gongura Mutton',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
      isOpen: true,
      fssai: '13619011000452',
    },
    {
      id: 'm-2',
      name: 'Sri Lakshmi Kirana & General Store',
      category: 'kirana',
      type: 'Kirana Store',
      lat: 17.4520,
      lng: 78.3890,
      distance: 0.4,
      eta: '12 mins',
      rating: 4.9,
      specialty: 'Sona Masoori Rice, Pure Ghee, Farm Fresh Dal & Spices',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      isOpen: true,
      fssai: '23620014000189',
    },
    {
      id: 'm-3',
      name: 'MedPlus 24x7 Express Pharmacy',
      category: 'pharmacy',
      type: 'Pharmacy',
      lat: 17.4470,
      lng: 78.3840,
      distance: 0.8,
      eta: '15 mins',
      rating: 4.7,
      specialty: '24-Hour Emergency Medicines, Diabetes Care & First Aid',
      image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80',
      isOpen: true,
      fssai: 'TS-MD-2022-77189',
    },
    {
      id: 'm-4',
      name: 'Karachi Bakery & Confectionery',
      category: 'bakery',
      type: 'Bakery',
      lat: 17.4360,
      lng: 78.3820,
      distance: 1.2,
      eta: '22 mins',
      rating: 4.8,
      specialty: 'Fresh Tea Osmania Biscuits, Plum Cakes & Pastries',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
      isOpen: true,
      fssai: '13618012000892',
    },
    {
      id: 'm-7',
      name: 'Paradise Biryani & Kebabs',
      category: 'food',
      type: 'Restaurant',
      lat: 17.4490,
      lng: 78.3980,
      distance: 0.9,
      eta: '20 mins',
      rating: 4.9,
      specialty: 'Royal Mutton Biryani, Chicken 65, Mirchi Ka Salan',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
      isOpen: true,
      fssai: '13621014000812',
    },
    {
      id: 'm-8',
      name: 'Ratnadeep Supermarket Express',
      category: 'kirana',
      type: 'Supermarket',
      lat: 17.4440,
      lng: 78.3920,
      distance: 0.5,
      eta: '14 mins',
      rating: 4.8,
      specialty: 'Fresh Organic Fruits, Cold Pressed Oils & Household Essentials',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
      isOpen: true,
      fssai: '13620014000341',
    },
  ];

  // Detect Live GPS Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setDetectedAddress(`Live GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Neighborhood Verified)`);
        setDetecting(false);
        runAiRecommendation(`Locate top open merchants within ${activeRadius}km`);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        // Fallback default
        setCoords({ lat: 17.4480, lng: 78.3910 });
        setDetectedAddress('Madhapur & Hitec City, Hyderabad (GPS Approximate)');
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  // Run AI Scout Analysis
  const runAiRecommendation = (queryText) => {
    const q = (queryText || aiQuery).toLowerCase();
    setAiQuery(queryText || aiQuery);

    let matched = nearbyPlaces;
    let title = 'ManaAI Neighborhood Scout Recommendations';
    let explanation = `Based on your live position at ${detectedAddress}, here are the fastest delivery stores within ${activeRadius}km:`;

    if (q.includes('biryani') || q.includes('food') || q.includes('lunch') || q.includes('dinner')) {
      matched = nearbyPlaces.filter((p) => p.category === 'food');
      title = 'Top Hyderabadi Biryani & Regional Dining';
      explanation = 'Found 2 authentic FSSAI-certified kitchen partners within 15-20 min delivery:';
    } else if (q.includes('medicine') || q.includes('pharmacy') || q.includes('fever') || q.includes('urgent')) {
      matched = nearbyPlaces.filter((p) => p.category === 'pharmacy');
      title = '24x7 Emergency Medical Support';
      explanation = 'Verified licensed pharmacy partner ready with urgent 15-minute doorstep delivery:';
    } else if (q.includes('kirana') || q.includes('grocery') || q.includes('milk') || q.includes('ration') || q.includes('rice')) {
      matched = nearbyPlaces.filter((p) => p.category === 'kirana');
      title = 'Fresh Kirana, Dairy & Supermarkets';
      explanation = 'Local neighborhood grocers carrying farm-fresh staples with 0% inflated prices:';
    } else if (q.includes('bakery') || q.includes('biscuit') || q.includes('chai') || q.includes('sweet')) {
      matched = nearbyPlaces.filter((p) => p.category === 'bakery');
      title = 'Fresh Bakery, Chai & Confectioneries';
      explanation = 'Iconic bakery offering hot Osmania biscuits and pastries:';
    }

    setAiResponse({
      title,
      explanation,
      stores: matched,
    });

    if (matched.length > 0) {
      setSelectedPin(matched[0]);
    }
  };

  useEffect(() => {
    runAiRecommendation('biryani');
  }, []);

  return (
    <div className="bg-white rounded-3xl sm:rounded-4xl border border-slate-200/80 shadow-xl overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#006837] via-[#0A7A3E] to-[#FF5A00] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>ManaAI Hyperlocal GPS Scout</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              AI Live Neighborhood Radar & Google Maps
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Detects your live location and discovers nearby food, grocery, and pharmacy stores within 15–30 mins.
            </p>
          </div>

          {/* Live Detect Button */}
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className="inline-flex items-center space-x-2 bg-white text-[#006837] hover:bg-emerald-50 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex-shrink-0 disabled:opacity-75"
          >
            {detecting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF5A00]" />
            ) : (
              <Navigation className="w-4 h-4 text-[#FF5A00]" />
            )}
            <span>{detecting ? 'Acquiring GPS...' : 'Detect Live Location'}</span>
          </button>
        </div>

        {/* Current Location Ribbon */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-emerald-100 gap-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-amber-300" />
            <span className="font-semibold text-white">{detectedAddress}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] opacity-80">Search Radius:</span>
            {[1, 3, 5, 10].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setActiveRadius(r);
                  runAiRecommendation(aiQuery);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  activeRadius === r
                    ? 'bg-white text-[#006837]'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Map on Left, AI Concierge on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Interactive Google Map Visualizer */}
        <div className="lg:col-span-7 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-[#FF5A00]" />
              <span>Interactive Neighborhood Store Map</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live GPS Sync Active
            </span>
          </div>

          {/* Styled Map Container */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-slate-100 overflow-hidden border border-slate-200/80 shadow-inner group">
            {/* Map Background Canvas (Google Maps Satellite / Street Style Canvas) */}
            <div className="absolute inset-0 bg-[#E8ECE9] opacity-95">
              {/* Grid Roads */}
              <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#CBD5E1" strokeWidth="2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Arterial Highway */}
                <path d="M 0 120 Q 200 180 400 140 T 800 200" fill="none" stroke="#FDE68A" strokeWidth="12" />
                <path d="M 160 0 Q 180 200 240 400" fill="none" stroke="#CBD5E1" strokeWidth="8" />
                <path d="M 450 0 Q 420 180 490 400" fill="none" stroke="#CBD5E1" strokeWidth="8" />
              </svg>
            </div>

            {/* User Live GPS Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-lg" />
              </span>
              <span className="mt-1 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md backdrop-blur-xs">
                You Are Here
              </span>
            </div>

            {/* Store Markers on Map */}
            {nearbyPlaces.map((store, idx) => {
              // Distribute pins realistically around center
              const positions = [
                { top: '28%', left: '32%' },
                { top: '65%', left: '26%' },
                { top: '22%', left: '68%' },
                { top: '70%', left: '72%' },
                { top: '42%', left: '78%' },
                { top: '55%', left: '46%' },
              ];
              const pos = positions[idx % positions.length];
              const isSelected = selectedPin?.id === store.id;

              return (
                <button
                  key={store.id}
                  onClick={() => setSelectedPin(store)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all transform hover:scale-125 focus:outline-none ${
                    isSelected ? 'scale-125 z-40' : ''
                  }`}
                  title={`${store.name} (${store.distance} km)`}
                >
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black shadow-md border ${
                      isSelected
                        ? 'bg-[#FF5A00] text-white border-white ring-2 ring-orange-300'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-orange-400'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[#FF5A00]'}`} />
                    <span className="truncate max-w-[80px]">{store.name.split(' ')[0]}</span>
                    <span className="opacity-75">{store.distance}k</span>
                  </div>
                </button>
              );
            })}

            {/* Selected Store Floating Preview Card */}
            {selectedPin && (
              <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedPin.image}
                    alt={selectedPin.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {selectedPin.name}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedPin.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {selectedPin.specialty}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-600 font-semibold pt-0.5">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                        {selectedPin.rating}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{selectedPin.eta}</span>
                      <span>•</span>
                      <span>{selectedPin.distance} km away</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/merchant/${selectedPin.id}`}
                  className="inline-flex items-center space-x-1 bg-[#FF5A00] hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex-shrink-0"
                >
                  <span>Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* AI Concierge Chat & Quick Prompts */}
        <div className="lg:col-span-5 p-4 sm:p-6 space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#006837] to-[#FF5A00] text-white flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    ManaAI Concierge
                  </h4>
                  <p className="text-[10px] text-slate-400">Live Context: {detectedAddress.split(',')[0]}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                AI Agent Active
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                Instant Neighborhood Searches:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Biryani Near Me', q: 'biryani' },
                  { label: 'Kirana & Milk', q: 'kirana milk' },
                  { label: '24x7 Medicine', q: 'medicine emergency' },
                  { label: 'Hot Osmania Chai', q: 'bakery' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => runAiRecommendation(chip.q)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#FF5A00] text-[11px] font-semibold text-slate-700 transition-colors border border-transparent hover:border-orange-200"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Display */}
            {aiResponse && (
              <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-orange-200/80 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Bot className="w-3.5 h-3.5 text-[#FF5A00]" />
                  <span>{aiResponse.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {aiResponse.explanation}
                </p>

                {/* Compact Store List */}
                <div className="space-y-2 pt-1">
                  {aiResponse.stores.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedPin(s)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        selectedPin?.id === s.id
                          ? 'border-[#FF5A00] bg-orange-50/50'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[10px] text-slate-500">{s.specialty}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="font-extrabold text-[#006837] block">{s.eta}</span>
                        <span className="text-[10px] text-slate-400">{s.distance} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Search Prompt Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (aiQuery.trim()) runAiRecommendation(aiQuery.trim());
            }}
            className="pt-2 relative flex items-center"
          >
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask ManaAI (e.g. Find fresh curd & bread nearby)..."
              className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-slate-100 focus:bg-white text-xs border border-transparent focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 rounded-xl bg-[#FF5A00] hover:bg-orange-600 text-white shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
