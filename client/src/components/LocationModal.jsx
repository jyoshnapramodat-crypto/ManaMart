import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import {
  MapPin,
  Navigation,
  X,
  Check,
  Building2,
  Search,
  Plus,
  Home,
  Briefcase,
  MoreHorizontal,
  AlertCircle,
  Bell,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function LocationModal() {
  const {
    cities,
    currentCity,
    selectedLocality,
    coordinates,
    isModalOpen,
    isDetecting,
    savedAddresses,
    activeAddress,
    setIsModalOpen,
    detectGPSLocation,
    selectCityAndLocality,
    checkServiceability,
    addSavedAddress,
    deleteSavedAddress,
    setDefaultAddress,
    setActiveAddress,
  } = useLocation();

  const [activeTab, setActiveTab] = useState('localities'); // 'localities' | 'saved' | 'new_address' | 'unserviceable'
  const [searchQuery, setSearchQuery] = useState('');
  const [unserviceableQuery, setUnserviceableQuery] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // New Address Form State
  const [newTag, setNewTag] = useState('Home');
  const [newFlat, setNewFlat] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newLocality, setNewLocality] = useState(selectedLocality || 'Madhapur');
  const [newCity, setNewCity] = useState(currentCity || 'Hyderabad');
  const [newPincode, setNewPincode] = useState('500081');
  const [newPhone, setNewPhone] = useState('9876543210');
  const [newInstructions, setNewInstructions] = useState('');
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });

  if (!isModalOpen) return null;

  // Handle Autocomplete Search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const check = checkServiceability(searchQuery);
    if (check.serviceable) {
      selectCityAndLocality(check.city, check.locality, check.coords);
      setIsModalOpen(false);
    } else {
      setUnserviceableQuery(searchQuery);
      setActiveTab('unserviceable');
    }
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newFlat || !newStreet) {
      alert('Please provide your flat/house number and street name.');
      return;
    }

    const check = checkServiceability(newLocality || newPincode);
    if (!check.serviceable) {
      setUnserviceableQuery(`${newLocality} (${newPincode})`);
      setActiveTab('unserviceable');
      return;
    }

    addSavedAddress({
      tag: newTag,
      flatNo: newFlat,
      street: newStreet,
      landmark: newLandmark,
      locality: newLocality,
      city: newCity,
      pincode: newPincode,
      phone: newPhone,
      instructions: newInstructions,
      lat: coordinates.lat,
      lng: coordinates.lng,
    });

    setActiveTab('saved');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#003527]/5 via-orange-50/50 to-amber-50/30 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Choose Delivery Location</h3>
              <p className="text-[11px] text-slate-500">Delivering to {selectedLocality}, {currentCity}</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        {activeTab !== 'unserviceable' && (
          <div className="flex border-b border-slate-100 px-4 pt-2 bg-slate-50/50 gap-2">
            <button
              onClick={() => setActiveTab('localities')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'localities'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Choose Area / City
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'saved'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Saved Addresses</span>
              <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 text-[10px] flex items-center justify-center font-bold">
                {savedAddresses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('new_address')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1 ${
                activeTab === 'new_address'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: LOCALITIES & AUTOCOMPLETE */}
          {activeTab === 'localities' && (
            <>
              {/* Autocomplete Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search street, area, landmark, or pincode..."
                  className="w-full text-xs pl-10 pr-20 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 text-[11px] font-bold bg-orange-600 text-white px-3 py-1 rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Check
                </button>
              </form>

              {/* GPS Auto-Detect Button */}
              <button
                onClick={detectGPSLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-200/80 hover:bg-orange-100 transition-all group"
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-orange-950 block">
                      {isDetecting ? 'Detecting current coordinates...' : 'Use Current GPS Location'}
                    </span>
                    <span className="text-[10px] text-orange-700/80">Fast device sensor detection</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                  Instant
                </span>
              </button>

              {/* Interactive Draggable Pin Simulator */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>Adjust Pin on Neighborhood Map</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </span>
                </div>

                <div className="h-28 rounded-xl bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 relative overflow-hidden border border-emerald-200/60 flex items-center justify-center">
                  {/* Grid lines simulating map streets */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#003527_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute top-3 left-4 text-[10px] font-extrabold text-emerald-950 bg-white/80 px-2 py-0.5 rounded-md shadow-xs">
                    {selectedLocality}, {currentCity}
                  </div>

                  {/* Movable Pin */}
                  <div
                    style={{ transform: `translate(${pinOffset.x}px, ${pinOffset.y}px)` }}
                    className="relative cursor-move transition-transform duration-100 flex flex-col items-center"
                    onClick={() => {
                      setPinOffset((prev) => ({
                        x: (Math.random() - 0.5) * 40,
                        y: (Math.random() - 0.5) * 30,
                      }));
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-black/30 mt-0.5 blur-xs" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  Tap pin to fine-tune exact delivery gate or tower entrance
                </p>
              </div>

              {/* Supported Cities & Localities */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1" />
                  Serviceable Towns & Metros
                </h4>

                <div className="space-y-3">
                  {cities.map((city) => (
                    <div key={city.id} className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-800">{city.name}</span>
                          <span className="text-[10px] text-slate-400">({city.teluguName})</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {city.localities.map((loc) => {
                          const isSelected = currentCity === city.name && selectedLocality === loc;
                          return (
                            <button
                              key={loc}
                              onClick={() => selectCityAndLocality(city.name, loc, city.center)}
                              className={`text-[11px] px-2.5 py-1 rounded-xl font-medium transition-all flex items-center space-x-1 ${
                                isSelected
                                  ? 'bg-orange-600 text-white shadow-xs'
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
            </>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              {savedAddresses.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">No Saved Addresses</h4>
                  <p className="text-[11px] text-slate-500">Add your Home or Work address for 1-tap checkout!</p>
                  <button
                    onClick={() => setActiveTab('new_address')}
                    className="text-xs font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    Add Address Now
                  </button>
                </div>
              ) : (
                savedAddresses.map((addr) => {
                  const isActive = activeAddress?.id === addr.id;
                  const Icon = addr.tag === 'Home' ? Home : addr.tag === 'Work' ? Briefcase : MoreHorizontal;

                  return (
                    <div
                      key={addr.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            addr.tag === 'Home' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-xs text-slate-900">{addr.tag}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{addr.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => deleteSavedAddress(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 font-medium">
                        {addr.flatNo}, {addr.street}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {addr.locality}, {addr.city} - {addr.pincode} (Landmark: {addr.landmark || 'Nearby'})
                      </p>
                      {addr.instructions && (
                        <p className="text-[10px] text-orange-800 bg-orange-100/60 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                          Note: {addr.instructions}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveAddress(addr);
                            setSelectedLocality(addr.locality);
                            setCurrentCity(addr.city);
                            setIsModalOpen(false);
                          }}
                          className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all ml-auto ${
                            isActive
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700'
                          }`}
                        >
                          {isActive ? 'Selected' : 'Deliver Here'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW ADDRESS FORM */}
          {activeTab === 'new_address' && (
            <form onSubmit={handleSaveNewAddress} className="space-y-3">
              {/* Tag selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewTag(tag)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        newTag === tag
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* House / Flat # & Street */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Flat / House / Floor # *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFlat}
                    onChange={(e) => setNewFlat(e.target.value)}
                    placeholder="e.g. Flat 302, Block A"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Apartment / Street *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="e.g. Rainbow Vistas, 100 Ft Rd"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Landmark & Locality */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="e.g. Near Water Tank"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    placeholder="e.g. Madhapur"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* City, Pincode & Phone */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Hyderabad"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="500081"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Delivery Instructions for Rider
                </label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. Leave with security / Ring bell twice / Pet dog in foyer"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('localities')}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: UNSERVICEABLE LOCATION SCREEN */}
          {activeTab === 'unserviceable' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-bounce">
                <AlertCircle className="w-9 h-9" />
              </div>

              <h4 className="text-base font-extrabold text-slate-900">
                We're Not in Your Neighborhood Yet!
              </h4>

              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                ManaMart hyperlocal delivery is not yet live in{' '}
                <span className="font-bold text-slate-900">"{unserviceableQuery}"</span>. Our neighborhood fleet is currently serving active zones in Hyderabad, Vijayawada, Visakhapatnam, Warangal, and Tirupati.
              </p>

              {notifySubmitted ? (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>We've recorded your neighborhood! You'll be notified when we launch.</span>
                </div>
              ) : (
                <button
                  onClick={() => setNotifySubmitted(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#003527] to-[#055c24] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When ManaMart Launches Here</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('localities')}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-700 text-xs font-bold hover:bg-orange-50/50 transition-all"
                >
                  Change Location
                </button>
                <button
                  onClick={() => {
                    selectCityAndLocality('Hyderabad', 'Madhapur');
                    setIsModalOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Switch to Madhapur, HYD
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
