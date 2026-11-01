import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import ManaAIScout from '../../components/ManaAIScout';

export default function LandingPage() {
  const { isLoggedIn, role, user } = useAuth();
  const { currentCity, selectedLocality, setIsModalOpen } = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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
      id: 'm-2',
      name: 'Sri Lakshmi Kirana & General Store',
      partnerId: 'HYD-8942',
      rating: 4.8,
      tag: 'Flat ₹50 OFF',
      tagColor: 'bg-secondary-container text-on-secondary',
      eta: '15 mins',
      distance: '1.2 km away',
      deliveryInfo: 'Free Delivery > ₹199',
      category: 'Basmati rice, dals, pure desi ghee, spices & household',
      badge: 'Verified Kirana',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-12',
      name: 'Balaji Fresh Farm Produce',
      partnerId: 'Direct Farm Partner',
      rating: 4.9,
      tag: 'Organic Certified',
      tagColor: 'bg-primary-container text-on-primary-container',
      eta: '20 mins',
      distance: '0.8 km away',
      deliveryInfo: 'Morning Pick',
      category: 'Hyd Hydroponic greens, local fruits, roots & coconut water',
      badge: 'Fresh Harvest',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-11',
      name: 'Apollo Pharmacy Super Store',
      partnerId: 'Licensed Dispenser',
      rating: 4.7,
      tag: 'Medicines 15% OFF',
      tagColor: 'bg-secondary-container text-on-secondary',
      eta: '12 mins',
      distance: '0.5 km away',
      deliveryInfo: '24/7 Available',
      category: 'Prescription drugs, baby food, ayurveda & health monitors',
      badge: 'Certified Drug Store',
      image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-9',
      name: 'Venkateshwara Sweets & Niloufer Cafe',
      partnerId: 'Heritage Since 1994',
      rating: 4.9,
      tag: 'Fresh Hot Jalebis',
      tagColor: 'bg-secondary-container text-on-secondary',
      eta: '25 mins',
      distance: '2.1 km away',
      deliveryInfo: 'Bestseller Treat',
      category: 'Pure ghee sweets, Osmania biscuits, samosas & Irani chai',
      badge: 'Authentic Heritage',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const categories = [
    { title: 'Groceries & Kirana', count: '180+ Stores', icon: 'shopping_basket', bg: 'bg-primary/10', text: 'text-primary', cat: 'groceries' },
    { title: 'Restaurants & Food', count: '95+ Eateries', icon: 'restaurant', bg: 'bg-secondary/10', text: 'text-secondary', cat: 'food' },
    { title: 'Supermarkets', count: '24 Marts', icon: 'store', bg: 'bg-primary-container/10', text: 'text-primary-container', cat: 'groceries' },
    { title: '24x7 Pharmacy', count: 'Emergency Ready', icon: 'medical_services', bg: 'bg-error/10', text: 'text-error', cat: 'pharmacy' },
    { title: 'Bakery & Sweets', count: 'Authentic Taste', icon: 'cake', bg: 'bg-secondary-container/10', text: 'text-secondary-container', cat: 'food' },
    { title: 'Puja & Fresh Flowers', count: 'Morning Fresh', icon: 'yard', bg: 'bg-primary/10', text: 'text-primary', cat: 'general' },
    { title: 'Local Dairy', count: 'Milk, Curd & Ghee', icon: 'water_bottle', bg: 'bg-tertiary-container/10', text: 'text-tertiary-container', cat: 'dairy' },
    { title: 'Local Fashion', count: 'Cotton & Sarees', icon: 'apparel', bg: 'bg-secondary/10', text: 'text-secondary', cat: 'general' },
    { title: 'Electronics & Repairs', count: 'Home Technicians', icon: 'build', bg: 'bg-primary/10', text: 'text-primary', cat: 'services' },
    { title: 'Stationery & Xerox', count: 'Print & Office', icon: 'print', bg: 'bg-outline/10', text: 'text-on-surface', cat: 'general' },
    { title: 'Home Essentials', count: 'Cookware & Tools', icon: 'home_repair_service', bg: 'bg-primary-container/10', text: 'text-primary-container', cat: 'general' },
    { title: 'Community Offers', count: 'Up to 40% OFF', icon: 'loyalty', bg: 'bg-secondary-container/10', text: 'text-secondary-container', cat: 'deals' },
  ];

  const filteredStores = sampleStores.filter((store) => {
    if (selectedFilter === 'fastest') return parseInt(store.eta) <= 15;
    if (selectedFilter === 'offers') return store.tag.includes('OFF');
    return true;
  });

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Announcement Bar (Live Neighborhood Alerts) */}
      <div className="bg-primary text-on-primary py-2 px-space-md text-center text-label-sm font-label-sm flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-base text-secondary-fixed">bolt</span>
        <span>
          <strong>FRESH ARRIVALS:</strong> Daily farm vegetables and Hyderabad traditional sweets are now in stock in your area. Use coupon <strong>MANA50</strong> for ₹50 off!
        </span>
      </div>

      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest shadow-sm border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop py-space-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          {/* Brand Logo & Location */}
          <div className="flex items-center justify-between gap-space-md shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="ManaMart"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </Link>

            {/* Location Dropdown Pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors duration-150 border border-outline-variant/40 text-left"
            >
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-label-sm font-label-sm text-outline">Deliver to</span>
                <span className="text-label-md font-label-md font-bold text-primary flex items-center gap-0.5">
                  {selectedLocality || 'Madhapur'}, {currentCity || 'Hyderabad'}
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </span>
              </div>
            </button>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-xl mx-0 md:mx-space-md w-full">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh vegetables, sweets, medicines, or local kirana..."
                className="w-full pl-10 pr-24 py-2 bg-surface rounded-xl border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-outline text-ellipsis"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1 bg-primary text-on-primary rounded-lg text-label-sm font-label-sm hover:bg-primary-container transition-colors font-bold"
              >
                Search
              </button>
            </form>
          </div>

          {/* Trailing Action Buttons & Nav Links */}
          <div className="flex items-center justify-between md:justify-end gap-space-md shrink-0">
            {/* Quick Portal Links */}
            <Link
              to="/merchant/apply"
              className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span className="hidden sm:inline">Partner With Us</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/app"
              className="flex items-center gap-space-xs bg-secondary-container hover:bg-secondary text-on-secondary px-space-md py-2 rounded-lg font-label-md text-label-md shadow-level-1 transition-all duration-150 active:scale-95"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shopping_bag
              </span>
              <span>Explore Mart</span>
            </Link>

            {/* Account / Login */}
            <div className="flex items-center gap-2 border-l border-outline-variant/50 pl-space-md">
              {isLoggedIn ? (
                <Link
                  to={role === 'merchant' ? '/merchant' : role === 'rider' ? '/rider' : role === 'admin' ? '/admin' : '/app'}
                  className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-level-1 hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span>Dashboard ({user?.name ? user.name.split(' ')[0] : 'User'})</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-primary text-primary hover:bg-surface-container-low font-label-md text-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-level-1 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Navbar: Navigation Categories */}
        <div className="border-t border-outline-variant/30 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop flex items-center justify-between overflow-x-auto no-scrollbar py-2">
            <nav className="flex items-center space-x-space-lg text-label-md font-label-md whitespace-nowrap">
              <Link to="/app" className="text-primary font-bold border-b-2 border-primary pb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">home</span>
                Kirana & Staples
              </Link>
              <Link to="/app?category=produce" className="text-on-surface-variant hover:text-primary pb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-primary">eco</span>
                Fresh Produce
              </Link>
              <Link to="/app?category=food" className="text-on-surface-variant hover:text-primary pb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-secondary">bakery_dining</span>
                Dairy & Sweets
              </Link>
              <Link to="/app?category=pharmacy" className="text-on-surface-variant hover:text-primary pb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-error">local_hospital</span>
                Pharma
              </Link>
              <Link to="/app?category=deals" className="text-on-surface-variant hover:text-primary pb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-secondary-container">local_offer</span>
                Local Deals
              </Link>
            </nav>
            <div className="hidden sm:flex items-center gap-4 text-label-sm font-label-sm text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">speed</span> 15-30 Min Delivery
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">verified</span> 100% Genuine Stores
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface-bright py-space-xl md:py-16">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col space-y-space-md">
            {/* Live Guarantee Tag */}
            <div className="inline-flex items-center gap-2 self-start bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-level-1 border border-outline-variant/40">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping"></span>
              <span className="text-label-md font-label-md text-primary font-bold">500+ Verified Kiranas & Stores in your pincode</span>
              <span className="text-label-sm font-label-sm text-secondary font-semibold border-l border-outline-variant/40 pl-2">₹0 Delivery on first 3 orders</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
              Your Neighborhood. <br className="hidden sm:inline" />
              <span className="text-primary underline decoration-secondary-container decoration-4">Your Marketplace.</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl">
              Discover your favorite local stores, order authentic neighborhood essentials, and get everything delivered right to your doorstep in 15–30 minutes.
            </p>

            {/* Dual Primary CTAs */}
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <Link
                to="/app"
                className="bg-secondary-container hover:bg-secondary text-on-secondary px-space-xl py-3.5 rounded-lg text-title-md font-title-md font-bold shadow-level-2 transition-all duration-200 active:scale-95 flex items-center gap-2 group"
              >
                <span>Explore Nearby Stores</span>
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-on-primary px-space-lg py-3 rounded-lg text-title-md font-title-md font-semibold transition-all duration-200 active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">play_circle</span>
                <span>How it Works</span>
              </a>
            </div>

            {/* Live Trust Pillars */}
            <div className="grid grid-cols-3 gap-space-sm pt-space-md border-t border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  electric_moped
                </span>
                <div>
                  <p className="text-headline-sm font-headline-sm font-bold text-on-surface leading-tight">18 Mins</p>
                  <p className="text-label-sm font-label-sm text-outline">Average Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-secondary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  storefront
                </span>
                <div>
                  <p className="text-headline-sm font-headline-sm font-bold text-on-surface leading-tight">100%</p>
                  <p className="text-label-sm font-label-sm text-outline">Local Merchants</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  currency_rupee
                </span>
                <div>
                  <p className="text-headline-sm font-headline-sm font-bold text-on-surface leading-tight">Fair MRP</p>
                  <p className="text-label-sm font-label-sm text-outline">No Surge Spikes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Bento Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-space-md">
            {/* Bento Card 1: Kirana & Staples */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-level-1 border border-outline-variant/40 flex flex-col justify-between hover:shadow-level-2 transition-shadow">
              <div className="h-32 rounded-lg overflow-hidden mb-space-sm relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80"
                  alt="Local Kirana Store"
                />
                <span className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded">Kirana Staples</span>
              </div>
              <div>
                <h4 className="text-title-md font-title-md text-on-surface font-bold">Local Kiranas</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Rice, dals, oils & dry spices at authentic local wholesale prices.</p>
              </div>
            </div>

            {/* Bento Card 2: Fresh Farm Greens */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-level-1 border border-outline-variant/40 flex flex-col justify-between hover:shadow-level-2 transition-shadow">
              <div className="h-32 rounded-lg overflow-hidden mb-space-sm relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
                  alt="Organic Vegetables"
                />
                <span className="absolute top-2 left-2 bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded">Organic Morning</span>
              </div>
              <div>
                <h4 className="text-title-md font-title-md text-on-surface font-bold">Farm Vegetables</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Harvested fresh daily from nearby Telangana peri-urban farms.</p>
              </div>
            </div>

            {/* Bento Card 3: Hyderabad Traditional Bakery & Sweets */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-level-1 border border-outline-variant/40 flex flex-col justify-between hover:shadow-level-2 transition-shadow">
              <div className="h-32 rounded-lg overflow-hidden mb-space-sm relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80"
                  alt="Traditional Sweets & Bakeries"
                />
                <span className="absolute top-2 left-2 bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded">Fresh Daily</span>
              </div>
              <div>
                <h4 className="text-title-md font-title-md text-on-surface font-bold">Sweets & Bakeries</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Warm jalebis, Osmania biscuits, and ghee laddu from iconic makers.</p>
              </div>
            </div>

            {/* Bento Card 4: Quick 15-Min Delivery Partner */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-level-1 border border-outline-variant/40 flex flex-col justify-between hover:shadow-level-2 transition-shadow">
              <div className="h-32 rounded-lg overflow-hidden mb-space-sm relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80"
                  alt="Hyperlocal Delivery Rider"
                />
                <span className="absolute top-2 left-2 bg-tertiary-container text-on-tertiary text-[10px] font-bold px-2 py-0.5 rounded">EV Express</span>
              </div>
              <div>
                <h4 className="text-title-md font-title-md text-on-surface font-bold">15-30m Doorstep</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Trained local delivery partners who know every lane in your area.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ManaAI Hyperlocal Scout & Live Map Section */}
      <section className="py-space-xl bg-surface-container-low/60 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop">
          <ManaAIScout />
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-space-xl bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg">
            <div>
              <span className="text-label-md font-label-md text-secondary font-bold tracking-wider">HYPERLOCAL CATALOG</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                Shop Everything in Your Neighborhood
              </h2>
            </div>
            <Link
              to="/app"
              className="text-label-md font-label-md text-primary hover:text-primary-container font-bold flex items-center gap-1 mt-2 md:mt-0"
            >
              <span>View all 24 categories</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space-sm md:gap-space-md">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/app?category=${cat.cat}`}
                className="group p-space-md bg-surface-container-low hover:bg-surface-bright rounded-xl border border-outline-variant/30 transition-all duration-200 flex flex-col items-center text-center hover:shadow-level-1 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-full ${cat.bg} flex items-center justify-center ${cat.text} group-hover:scale-110 transition-transform mb-space-xs`}>
                  <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                </div>
                <h3 className="text-label-md font-label-md text-on-surface font-bold group-hover:text-primary">
                  {cat.title}
                </h3>
                <span className="text-body-sm font-body-sm text-outline">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Local Stores */}
      <section className="py-space-xl bg-surface">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-secondary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-label-md font-label-md text-secondary font-bold">COMMUNITY FAVORITES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                Top Rated Stores Around {selectedLocality || 'Madhapur'}
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Order directly from merchants you know and trust for generations.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 md:pt-0">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-full text-label-sm font-label-sm font-semibold flex items-center gap-1 transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary border border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-xs">check</span> All Stores
              </button>
              <button
                onClick={() => setSelectedFilter('fastest')}
                className={`px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-all ${
                  selectedFilter === 'fastest'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary border border-outline-variant'
                }`}
              >
                Fastest Delivery
              </button>
              <button
                onClick={() => setSelectedFilter('offers')}
                className={`px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-all ${
                  selectedFilter === 'offers'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary border border-outline-variant'
                }`}
              >
                Offers & Discounts
              </button>
            </div>
          </div>

          {/* Merchant Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-level-1 overflow-hidden hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Store Image Banner */}
                  <div className="h-44 relative overflow-hidden bg-surface-container-low">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-3 left-3 ${store.tagColor} text-label-sm font-label-sm font-bold px-2 py-0.5 rounded shadow`}>
                      {store.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm text-primary text-label-sm font-label-sm font-bold px-2 py-1 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> {store.eta}
                    </span>
                  </div>

                  {/* Content Details */}
                  <div className="p-space-md">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-label-sm font-label-sm text-primary font-bold flex items-center gap-0.5">
                        <span
                          className="material-symbols-outlined text-sm text-primary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                        {store.partnerId}
                      </span>
                      <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-label-sm font-bold">
                        {store.rating}{' '}
                        <span
                          className="material-symbols-outlined text-xs"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      </span>
                    </div>

                    <h3 className="text-title-md font-title-md font-bold text-on-surface group-hover:text-primary transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-1 mb-2">
                      {store.category}
                    </p>

                    <div className="flex items-center text-label-sm font-label-sm text-outline gap-3 border-t border-outline-variant/30 pt-2">
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm text-secondary">pin_drop</span> {store.distance}
                      </span>
                      <span>•</span>
                      <span className="text-primary font-medium">{store.deliveryInfo}</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md pt-0">
                  <Link
                    to={`/store/${store.id}`}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-lg text-label-md font-label-md font-bold transition-all duration-150 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>View Store</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Hero Banner & How ManaMart Works */}
      <section id="how-it-works" className="py-space-xl bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop">
          {/* Big Community Pride Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-tertiary text-on-primary p-space-lg md:p-space-xl shadow-level-2 mb-space-xl">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1 bg-surface-container-lowest/15 backdrop-blur-md px-3 py-1 rounded-full text-label-sm font-label-sm mb-space-sm">
                <span className="material-symbols-outlined text-secondary-fixed text-sm">handshake</span>
                Empowering Neighborhood Commerce
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-space-xs text-white">
                Support Local. Shop ManaMart.
              </h2>
              <p className="text-base sm:text-lg text-primary-fixed mb-space-lg">
                Keeping your neighborhood economy thriving. Every order goes directly to verified local merchants and local delivery riders right inside your community.
              </p>
              <div className="flex flex-wrap items-center gap-space-md">
                <Link
                  to="/merchant/apply"
                  className="bg-secondary-container hover:bg-secondary text-on-secondary px-space-lg py-3 rounded-lg text-label-md font-label-md font-bold shadow-level-1 transition-all"
                >
                  Become a ManaMart Merchant
                </Link>
                <span className="text-label-md font-label-md text-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary-fixed">format_image_left</span>
                  0% Commission on first 30 days
                </span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[240px]">storefront</span>
            </div>
          </div>

          {/* How ManaMart Works: 3 Steps */}
          <div className="text-center max-w-xl mx-auto mb-space-lg">
            <span className="text-label-md font-label-md text-secondary font-bold tracking-wider">SIMPLE & TRANSPARENT</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
              How ManaMart Works
            </h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Three seamless steps connecting you to your authentic local community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {/* Step 1 */}
            <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/30 flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-headline-sm mb-space-md shadow-level-1">
                <span className="material-symbols-outlined text-3xl">map</span>
              </div>
              <span className="text-label-sm font-label-sm text-secondary font-bold mb-1">STEP 01</span>
              <h4 className="text-title-md font-title-md text-on-surface font-bold mb-2">Discover Neighborhood Stores</h4>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Enter your colony or pincode to immediately see local kiranas, bakeries, medical stores, and bazaars within 3 km.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/30 flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-headline-sm mb-space-md shadow-level-1">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <span className="text-label-sm font-label-sm text-secondary font-bold mb-1">STEP 02</span>
              <h4 className="text-title-md font-title-md text-on-surface font-bold mb-2">Real-Time Order & Merchant Chat</h4>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Pick items, request custom cuts or specific brand substitutions directly through instant chat with the shopkeeper.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/30 flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-headline-sm mb-space-md shadow-level-1">
                <span className="material-symbols-outlined text-3xl">electric_scooter</span>
              </div>
              <span className="text-label-sm font-label-sm text-secondary font-bold mb-1">STEP 03</span>
              <h4 className="text-title-md font-title-md text-on-surface font-bold mb-2">Fast 20-Min Doorstep Delivery</h4>
              <p className="text-body-md font-body-md text-on-surface-variant">
                A neighbor fleet partner picks it fresh from the store counter and delivers directly to your door in eco-friendly packaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Offers & Followed Shop Updates Ticker */}
      <section className="py-space-md bg-surface-container border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-secondary text-on-secondary rounded text-label-sm font-label-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">campaign</span> TODAY'S BUZZ
            </span>
            <span className="text-label-md font-label-md text-on-surface">Live from your followed merchants:</span>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant/40 shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-label-sm font-label-sm text-on-surface">
                <strong>Sri Lakshmi:</strong> Fresh Sona Masoori Rice 25kg at ₹1,290
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant/40 shrink-0">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-label-sm font-label-sm text-on-surface">
                <strong>Venkateshwara:</strong> Hot Badam Milk batches ready at 5:00 PM
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant/40 shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="text-label-sm font-label-sm text-on-surface">
                <strong>Balaji Farm:</strong> Palak & Methi bunches 3 for ₹40
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/50 pt-space-xl pb-space-lg">
        <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl mb-space-xl">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 flex flex-col space-y-space-sm">
            <Link to="/" className="inline-block mb-1">
              <img
                src="/logo.png"
                alt="ManaMart"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-title-md font-title-md text-primary font-bold">Mana Ooru. Mana Market.</p>
            <p className="text-body-sm font-body-sm text-on-surface-variant max-w-sm">
              ManaMart Hyperlocal Technologies empowers traditional Indian neighborhood retailers with instant commerce infrastructure, transparent pricing, and trusted doorstep fulfillment.
            </p>
            <div className="flex items-center space-x-3 pt-space-xs text-primary">
              <span className="p-2 bg-surface-container-low rounded-lg" title="Locality">
                <span className="material-symbols-outlined text-lg">location_city</span>
              </span>
              <span className="p-2 bg-surface-container-low rounded-lg" title="Safety">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </span>
              <span className="p-2 bg-surface-container-low rounded-lg" title="Support">
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </span>
            </div>
          </div>

          {/* Footer Nav Links Column 1 */}
          <div>
            <h4 className="text-title-md font-title-md font-bold text-on-surface mb-space-sm">Explore ManaMart</h4>
            <ul className="space-y-2 text-body-sm font-body-sm text-on-surface-variant">
              <li><Link to="/app" className="hover:text-primary transition-colors">Marketplace Catalog</Link></li>
              <li><Link to="/reservations" className="hover:text-primary transition-colors font-semibold text-secondary">Restaurant Table Booking</Link></li>
              <li><Link to="/merchant/apply" className="hover:text-primary transition-colors">Partner With Us</Link></li>
              <li><Link to="/rider/apply" className="hover:text-primary transition-colors">Delivery Fleet</Link></li>
              <li><Link to="/parcel" className="hover:text-primary transition-colors">Neighborhood Courier</Link></li>
              <li><Link to="/recurring" className="hover:text-primary transition-colors">Monthly Auto-Shopping</Link></li>
            </ul>
          </div>

          {/* Footer Nav Links Column 2 */}
          <div>
            <h4 className="text-title-md font-title-md font-bold text-on-surface mb-space-sm">Categories</h4>
            <ul className="space-y-2 text-body-sm font-body-sm text-on-surface-variant">
              <li><Link to="/app?category=groceries" className="hover:text-primary transition-colors">Kirana & Staples</Link></li>
              <li><Link to="/app?category=produce" className="hover:text-primary transition-colors">Fresh Produce</Link></li>
              <li><Link to="/app?category=food" className="hover:text-primary transition-colors">Dairy & Sweets</Link></li>
              <li><Link to="/app?category=pharmacy" className="hover:text-primary transition-colors">Pharma 24x7</Link></li>
              <li><Link to="/app?category=deals" className="hover:text-primary transition-colors">Local Deals</Link></li>
            </ul>
          </div>

          {/* Footer Policy & Grievance Column */}
          <div>
            <h4 className="text-title-md font-title-md font-bold text-on-surface mb-space-sm">Legal & Trust</h4>
            <ul className="space-y-2 text-body-sm font-body-sm text-on-surface-variant">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Merchant Grievance</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Consumer Rights Notice</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FSSAI Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Ribbon */}
        <div className="border-t border-outline-variant/30 pt-space-md">
          <div className="max-w-7xl mx-auto px-space-md md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-space-sm text-label-sm font-label-sm text-on-surface-variant">
            <p>© 2025 ManaMart Hyperlocal Technologies Pvt Ltd. Mana Ooru. Mana Market.</p>
            <div className="flex items-center space-x-space-md">
              <span>Registered in Telangana, India</span>
              <span>•</span>
              <span>Made with pride for Local Indian Commerce</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
