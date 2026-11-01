import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import Logo from '../../components/Logo';
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
  Heart,
  ChevronRight,
  TrendingUp,
  Star,
  Users,
  UtensilsCrossed,
  Pill,
  Cake,
  Flower2,
  Tv,
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

  const categories = [
    { name: 'Food & Restaurants', icon: UtensilsCrossed, color: 'bg-orange-500/10 text-orange-600', count: '48+ Places', tag: 'Hot & Fresh' },
    { name: 'Kirana & Groceries', icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-600', count: '120+ Items', tag: '15 Mins' },
    { name: 'Medicines & Health', icon: Pill, color: 'bg-blue-500/10 text-blue-600', count: '15+ Pharmacies', tag: 'Rx Verified' },
    { name: 'Bakeries & Sweets', icon: Cake, color: 'bg-pink-500/10 text-pink-600', count: '22+ Bakes', tag: 'Daily Fresh' },
    { name: 'Flowers & Pooja', icon: Flower2, color: 'bg-amber-500/10 text-amber-600', count: 'Fresh Blooms', tag: 'Morning Delivery' },
    { name: 'Electronics & Repairs', icon: Tv, color: 'bg-purple-500/10 text-purple-600', count: 'Trusted Tech', tag: 'Local Support' },
  ];

  const highlights = [
    {
      icon: Clock,
      title: '15–30 Mins Hyperlocal Speed',
      description: 'Your neighborhood stores deliver faster because your delivery rider is right around the corner.',
      badge: 'Super Fast',
    },
    {
      icon: Store,
      title: 'Empowering Local Dukans',
      description: 'Fair pricing and direct customer connections for small town and neighborhood businesses.',
      badge: 'Fair Trade',
    },
    {
      icon: Repeat,
      title: 'Automated Monthly Shopping',
      description: 'Never run out of rice, dal, milk, or medicine. Set recurring orders with single-click approvals.',
      badge: 'Smart Recurring',
    },
    {
      icon: Package,
      title: 'Intercity & Neighborhood Parcel',
      description: 'Send keys, documents, lunchboxes, or gifts anywhere across town with trusted local riders.',
      badge: 'Point-to-Point',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-slate-900 selection:bg-orange-500 selection:text-white">
      
      {/* Top Navigation Bar for Public Landing */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Locality */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <Logo size="md" showTagline={true} to="/" />

            {/* Location Pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 transition-all text-left"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{selectedLocality}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{currentCity}</span>
              </div>
            </button>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/merchant/apply"
              className="hidden md:inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sell on ManaMart</span>
            </Link>

            <Link
              to="/rider/apply"
              className="hidden lg:inline-flex items-center space-x-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <Bike className="w-3.5 h-3.5 text-orange-600" />
              <span>Ride with Us</span>
            </Link>

            {isLoggedIn ? (
              <Link
                to={role === 'merchant' ? '/merchant' : role === 'rider' ? '/rider' : role === 'admin' ? '/admin' : '/app'}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <span>Dashboard ({user?.name ? user.name.split(' ')[0] : 'User'})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-1 bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-500/10 via-amber-500/10 to-orange-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Tag Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/80 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              <span className="text-[#0C8340]">మన ఊరు.</span> <span className="text-[#FF5E1E]">మన మార్కెట్.</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500">Fast Hyperlocal Delivery</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Your Entire Neighborhood, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0C8340] via-teal-600 to-[#FF5E1E]">
              Delivered in 15–30 Mins.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 font-medium">
            Discover local restaurants, fresh groceries, neighborhood kirana shops, medicines, and parcel pickups — empowering small town businesses and everyday convenience.
          </p>

          {/* Smart Hero Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 p-2 flex items-center gap-2"
          >
            <div className="flex items-center pl-3 text-slate-400">
              <Search className="w-5 h-5 text-orange-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Biryani, Milk, Paracetamol, Bakery, or Stores in your locality..."
              className="flex-1 bg-transparent py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl sm:rounded-2xl shadow-md transition-all flex-shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/app"
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Browse Catalog</span>
            </Link>
            <Link
              to="/parcel"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-2xs transition-all"
            >
              <Package className="w-4 h-4 text-orange-500" />
              <span>Send a Parcel</span>
            </Link>
            <Link
              to="/recurring"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-2xs transition-all"
            >
              <Repeat className="w-4 h-4 text-emerald-600" />
              <span>Monthly Auto-Shopping</span>
            </Link>
          </div>

          {/* Neighborhood Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>FSSAI & Drug License Verified</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Independent Rider Partners</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Artificial Price Markups</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Explore Neighborhood Essentials
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              From fresh farm veggies to midnight cravings, all delivered from trusted neighborhood merchants.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700"
          >
            <span>See all stores</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/app?cat=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-2xl p-4 border border-slate-100 hover:border-orange-200 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400">
                  {cat.count}
                </span>
                <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                  {cat.tag}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why ManaMart is Different */}
      <section className="bg-white border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Hyperlocal Revolution
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Designed for Mana Ooru. Built for Speed.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Existing big platforms neglect Tier 2, Tier 3 towns and take 30% commission from local merchants. ManaMart changes the game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FCFBF8] rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0C8340]/10 to-[#FF5E1E]/10 text-slate-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#FF5E1E]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Double Call to Action: Merchant & Delivery Partner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Merchant Card */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
                <span>Local Merchant Network</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                Bring Your Shop Online in Less Than 5 Minutes.
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Connect directly with thousands of neighbors in your town. Manage your catalog, receive instant orders, and enjoy zero exorbitant platform fees.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-emerald-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified FSSAI & Business Credentials</span>
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
                className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all"
              >
                <span>Register Store Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Rider Card */}
          <div className="rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold">
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Partner Community</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                Deliver in Your Own Locality. Earn Every Day.
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                Choose your working hours, deliver within your known neighborhood streets, and get instant payouts directly to your UPI ID.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-orange-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-200" />
                  <span>Bicycle, EV, Scooter or Bike welcome</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-200" />
                  <span>Daily Earnings Payout + Peak Incentives</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <Link
                to="/rider/apply"
                className="inline-flex items-center space-x-2 bg-white hover:bg-orange-50 text-orange-900 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all"
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
            <Logo size="md" showTagline={true} variant="dark" to="/" />
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
              <li><Link to="/services" className="hover:text-white transition-colors">Local Electrician & Plumbing</Link></li>
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
