import React from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation, X, Check, Building2, BellRing } from 'lucide-react';

export default function LocationModal() {
  const {
    cities,
    currentCity,
    selectedLocality,
    isModalOpen,
    isDetecting,
    setIsModalOpen,
    detectGPSLocation,
    selectCityAndLocality,
  } = useLocation();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Your Neighborhood</h3>
              <p className="text-xs text-slate-500">Discover shops and services in your locality</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* GPS Auto Detect */}
          <button
            onClick={detectGPSLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Navigation className={`w-5 h-5 ${isDetecting ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <span className="font-bold text-sm text-orange-950 block">
                  {isDetecting ? 'Detecting your coordinates...' : 'Use Current GPS Location'}
                </span>
                <span className="text-xs text-orange-700/80">Using device geolocation sensor</span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-white text-orange-600 px-2.5 py-1 rounded-full shadow-xs">
              Fast Auto-Detect
            </span>
          </button>

          {/* Supported Cities */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              Serviceable Towns & Metros
            </h4>

            <div className="space-y-4">
              {cities.map((city) => (
                <div key={city.id} className="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-slate-800">{city.name}</span>
                      <span className="text-xs text-slate-400">({city.teluguName})</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Service Active
                    </span>
                  </div>

                  {/* Localities chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {city.localities.map((loc) => {
                      const isSelected = currentCity === city.name && selectedLocality === loc;
                      return (
                        <button
                          key={loc}
                          onClick={() => selectCityAndLocality(city.name, loc, city.center)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1 ${
                            isSelected
                              ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-200'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 mr-0.5" />}
                          <span>{loc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Not In Your Town Yet */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Don't see your town?</p>
                <p className="text-[11px] text-slate-500">We are expanding across Andhra & Telangana weekly</p>
              </div>
            </div>
            <button
              onClick={() => {
                alert('Thank you! We will notify you as soon as LocalLoop launches in your locality.');
                setIsModalOpen(false);
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-xl shadow-xs"
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

