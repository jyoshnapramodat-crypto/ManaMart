import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import Logo from '../../components/Logo';
import ManaAIScout from '../../components/ManaAIScout';
import {
  Search,
  MapPin,
  Sparkles,
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Package,
  Repeat,
  Star,
  UtensilsCrossed,
  Pill,
  Cake,
  Flower2,
  Tv,
  ChevronRight,
  PhoneCall,
  Flame,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, role } = useAuth();
  const { currentCity, selectedLocality, setIsModalOpen } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app');
    }
  };

  const sampleStores = [
    {
      id: 'm-1',
      name: 'Swagath Grand Family Kitchen',
      teluguName: 'స్వాగత్ గ్రాండ్',
      category: 'Food & Dining',
      rating: 4.8,
      reviews: '1,420+ ratings',
      eta: '18–25 mins',
      specialty: 'Authentic Hyderabadi Chicken Dum Biryani & Gongura Mutton',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      badge: 'Bestseller',
      fssai: '13619011000452',
    },
    {
      id: 'm-7',
      name: 'Paradise Biryani & Nizami Kebabs',
      teluguName: 'ప్యారడైజ్ బిర్యానీ',
      category: 'Food & Dining',
      rating: 4.9,
      reviews: '3,840+ ratings',
      eta: '15–22 mins',
      specialty: 'Royal Nizami Chicken Biryani, Seekh Kebabs & Mirchi Ka Salan',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
      badge: 'Heritage 1953',
      fssai: '13621014000812',
    },
    {
      id: 'm-8',
      name: 'Ratnadeep Supermarket Express',
      teluguName: 'రత్నదీప్ సూపర్ మార్కెట్',
      category: 'Groceries & Kirana',
      rating: 4.8,
      reviews: '1,890+ ratings',
      eta: '12–18 mins',
      specialty: 'A2 Fresh Cow Milk, Organic Farm Veggies & Daily Ration Staples',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      badge: '15-Min Delivery',
      fssai: '13620014000341',
    },
    {
      id: 'm-9',
      name: 'Niloufer Cafe & Tea Stall',
      teluguName: 'నిలోఫర్ కేఫ్',
      category: 'Bakery & Beverages',
      rating: 4.9,
      reviews: '2,850+ ratings',
      eta: '14–20 mins',
      specialty: 'Boiling Hot Irani Dum Chai Flask, Fresh Osmania Biscuits & Maska Bun',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      badge: 'Must Try',
      fssai: '13619011000781',
    },
    {
      id: 'm-3',
      name: 'MedPlus 24x7 Express Pharmacy',
      teluguName: 'మెడ్‌ప్లస్ 24x7',
      category: 'Pharmacy & Healthcare',
      rating: 4.7,
      reviews: '630+ ratings',
      eta: '10–15 mins',
      specialty: '24-Hour Emergency Medicines, Diabetes Care, Baby Food & First Aid',
      image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80',
      badge: 'Open 24x7',
      fssai: 'TS-MD-2022-77189',
    },
    {
      id: 'm-10',
      name: 'Rayalaseema Ruchulu',
      teluguName: 'రాయలసీమ రుచులు',
      category: 'Authentic Regional Food',
      rating: 4.8,
      reviews: '1,640+ ratings',
      eta: '20–30 mins',
      specialty: 'Spicy Natu Kodi Pulao, Steamed Ragi Sangati & Country Chicken',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      badge: 'Authentic Telugu',
      fssai: '13620014000923',
    },
  ];

  const popularDishes = [
    { name: 'Special Chicken Dum Biryani', price: '₹320', store: 'Swagath Grand', time: '20m', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80' },
    { name: 'Paradise Nizami Mutton Biryani', price: '₹380', store: 'Paradise', time: '18m', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80' },
    { name: 'Fresh A2 Cow Milk (500ml)', price: '₹45', store: 'Ratnadeep', time: '12m', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80' },
    { name: 'Irani Dum Chai Flask (Serves 4)', price: '₹99', store: 'Niloufer Cafe', time: '15m', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80' },
    { name: 'Handmade Osmania Biscuits (400g)', price: '₹180', store: 'Niloufer Cafe', time: '15m', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80' },
    { name: 'Wood Churned Groundnut Oil (1L)', price: '₹240', store: 'Sri Balaji Organics', time: '16m', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 selection:bg-[#FF5A00] selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between gap-4">
          
          {/* Official Brand Logo */}
          <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
            <Logo size="md" to="/" />

            {/* Locality Selector Pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-orange-200 transition-all text-left"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500/10 text-[#FF5A00] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A00]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{selectedLocality}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{currentCity}</span>
              </div>
            </button>
          </div>

          {/* Action Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/merchant/apply"
              className="hidden md:inline-flex items-center space-x-1.5 text-xs font-bold text-[#006837] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <Store className="w-3.5 h-3.5 text-[#006837]" />
              <span>Sell on ManaMart</span>
            </Link>

            <Link
              to="/rider/apply"
              className="hidden lg:inline-flex items-center space-x-1.5 text-xs font-bold text-[#FF5A00] bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <Bike className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span>Partner as Rider</span>
            </Link>

            {isLoggedIn ? (
              <Link
                to={role === 'merchant' ? '/merchant' : role === 'rider' ? '/rider' : role === 'admin' ? '/admin' : '/app'}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#006837] to-[#0A7A3E] hover:from-emerald-700 hover:to-emerald-800 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <span>Dashboard ({user?.name ? user.name.split(' ')[0] : 'User'})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#FF5A00] to-[#E65100] hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-tr from-emerald-500/10 via-amber-500/10 to-orange-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          
          {/* Logo Showcase Banner Centerpiece */}
          <div className="flex justify-center mb-2">
            <div className="p-3 sm:p-5 bg-white rounded-3xl sm:rounded-4xl shadow-xl border border-slate-200/80 inline-block hover:scale-[1.01] transition-transform">
              <img
                src="/logo.png"
                alt="ManaMart Logo"
                className="h-20 sm:h-28 md:h-36 w-auto object-contain mx-auto"
              />
            </div>
          </div>

          {/* Subtitle / Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-orange-200/80 shadow-xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                <span className="text-[#006837]">మన ఊరు.</span> <span className="text-[#FF5A00]">మన మార్కెట్.</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-500">15–30 Mins Hyperlocal Delivery</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Your Entire Neighborhood, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006837] via-teal-700 to-[#FF5A00]">
                Delivered in 15–30 Mins.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 font-medium leading-relaxed">
              Order authentic restaurant biryani, fresh farm groceries, neighborhood kirana ration, urgent 24x7 medicines, and parcel courier across {selectedLocality}.
            </p>
          </div>

          {/* Spacious Smart Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 p-2 sm:p-2.5 flex items-center gap-2"
          >
            <div className="flex items-center pl-3 text-slate-400">
              <Search className="w-5 h-5 text-[#FF5A00]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Biryani, Curd, Dolo 650, Osmania Biscuits, or nearby stores..."
              className="flex-1 bg-transparent py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#FF5A00] to-[#E65100] hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl sm:rounded-2xl shadow-md transition-all flex-shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/app"
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Browse Full Marketplace</span>
            </Link>
            <Link
              to="/parcel"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-2xs transition-all"
            >
              <Package className="w-4 h-4 text-[#FF5A00]" />
              <span>Send Hyperlocal Parcel</span>
            </Link>
            <Link
              to="/recurring"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-2xs transition-all"
            >
              <Repeat className="w-4 h-4 text-[#006837]" />
              <span>Monthly Auto-Shopping</span>
            </Link>
          </div>

          {/* Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006837]" />
              <span>FSSAI & Drug License Verified</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006837]" />
              <span>Zero Artificial Price Markups</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006837]" />
              <span>Neighborhood Independent Riders</span>
            </div>
          </div>

        </div>
      </section>

      {/* Embedded Live ManaAI Agent & Google Map Visualizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006837] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Live Location AI Detection
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Discover Stores Right Around Your Corner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Allow location access or let ManaAI scout nearby restaurants, kiranas, and medical shops.
          </p>
        </div>

        {/* Live Map & AI Concierge Card */}
        <ManaAIScout />
      </section>

      {/* Featured Neighborhood Stores (Rich Lively Samples) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#FF5A00] mb-1">
              <Flame className="w-4 h-4" />
              <span>Verified Local Neighborhood Shops</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Popular in {selectedLocality}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Handpicked neighborhood stores with 4.8+ ratings and genuine local pricing.
            </p>
          </div>

          <Link
            to="/app"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-[#FF5A00] hover:text-orange-700"
          >
            <span>See All 12+ Stores</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sampleStores.map((store) => (
            <Link
              key={store.id}
              to={`/store/${store.id}`}
              className="group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 hover:border-orange-300 shadow-2xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                {/* Store Image Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-slate-900 shadow-md">
                    {store.badge}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white">
                    {store.eta}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#006837]">
                      {store.category}
                    </span>
                    <span className="flex items-center text-xs font-black text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      {store.rating} ({store.reviews.split(' ')[0]})
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#FF5A00] transition-colors mt-1 line-clamp-1">
                    {store.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {store.specialty}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">
                  FSSAI: {store.fssai}
                </span>
                <span className="font-bold text-[#FF5A00] group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                  <span>View Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Items Carousel */}
      <section className="bg-white border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#006837] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Trending Right Now
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                Top Neighborhood Cravings & Essentials
              </h2>
            </div>
            <Link to="/app" className="text-xs sm:text-sm font-bold text-[#FF5A00] hover:underline">
              Explore 60+ dishes & products →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularDishes.map((dish, idx) => (
              <div
                key={idx}
                className="bg-[#FCFBF7] rounded-2xl p-3 border border-slate-200/80 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-[9px] font-bold text-white">
                    {dish.time}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[#FF5A00]">
                    {dish.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{dish.store}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-xs text-slate-900">{dish.price}</span>
                    <Link
                      to="/app"
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs"
                    >
                      + Add
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Community Portals: Merchant & Rider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          
          {/* Merchant Card */}
          <div className="rounded-4xl bg-gradient-to-br from-[#006837] via-[#0A7A3E] to-slate-950 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
                <span>Hyperlocal Merchant Portal</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                Bring Your Local Shop Online in 5 Minutes.
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Connect directly with thousands of neighbors in your town. Manage your catalog, receive instant orders, and enjoy zero exorbitant platform commissions.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-emerald-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>FSSAI & Regulatory Verification Support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Real-time Order Dashboard & Daily Settlements</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <Link
                to="/merchant/apply"
                className="inline-flex items-center space-x-2 bg-white hover:bg-emerald-50 text-[#006837] font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-lg transition-all"
              >
                <span>Register Store Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Rider Card */}
          <div className="rounded-4xl bg-gradient-to-br from-[#FF5A00] via-[#E65100] to-slate-950 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 text-white border border-white/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Delivery Community</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                Deliver in Your Own Locality. Earn Every Day.
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                Choose your working hours, deliver within your known neighborhood streets, and get instant daily payouts directly to your UPI ID.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-orange-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Bicycle, EV, Scooter or Motorcycle welcome</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Daily Earnings Payout + Peak Incentives</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <Link
                to="/rider/apply"
                className="inline-flex items-center space-x-2 bg-white hover:bg-orange-50 text-orange-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-lg transition-all"
              >
                <span>Join as Rider Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="space-y-4 md:col-span-1">
            <div className="p-3 bg-white/10 rounded-2xl inline-block">
              <img src="/logo.png" alt="ManaMart Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ManaMart is a modern hyperlocal commerce platform connecting customers with neighborhood shops, restaurants, pharmacies, and riders.
            </p>
            <div className="text-xs text-emerald-400 font-bold">
              మన ఊరు. మన మార్కెట్.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Hyperlocal Services</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/app" className="hover:text-white transition-colors">Food Discovery & Orders</Link></li>
              <li><Link to="/app" className="hover:text-white transition-colors">Instant Groceries</Link></li>
              <li><Link to="/parcel" className="hover:text-white transition-colors">Parcel Pickup & Drop</Link></li>
              <li><Link to="/recurring" className="hover:text-white transition-colors">Monthly Auto-Shopping</Link></li>
              <li><Link to="/reservations" className="hover:text-white transition-colors">Restaurant Reservations</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Local Home Repairs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Partner With Us</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/merchant/apply" className="hover:text-white transition-colors">Merchant Store Onboarding</Link></li>
              <li><Link to="/rider/apply" className="hover:text-white transition-colors">Rider Delivery Partner</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Governance</Link></li>
              <li><a href="#safety" className="hover:text-white transition-colors">FSSAI Compliance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Safety & Trust</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Every merchant on ManaMart is verified with regulatory credentials. Real-time GPS tracking keeps all your deliveries safe.
            </p>
            <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-xs text-slate-300">
              <span className="font-bold text-white">Helpline:</span> 1800-MANAMART <br />
              <span className="font-bold text-white">Email:</span> support@localloop.in
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ManaMart Platform. Powered by LocalLoop Hyperlocal Engine.</p>
          <div className="flex space-x-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#safety" className="hover:text-slate-400 transition-colors">Safety Standards</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
