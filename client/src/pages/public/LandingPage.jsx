import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import ManaAIScout from '../../components/ManaAIScout';
import TableReservationModal from '../../components/TableReservationModal';

export default function LandingPage() {
  const { isLoggedIn, role, user } = useAuth();
  const { currentCity, selectedLocality, setIsModalOpen } = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeReservationModal, setActiveReservationModal] = useState(false);
  const [selectedRestaurantForBooking, setSelectedRestaurantForBooking] = useState(null);
  const [appPhone, setAppPhone] = useState('');
  const [appLinkSent, setAppLinkSent] = useState(false);

  // Sample Featured Stores
  const featuredStores = [
    {
      id: 'm-2',
      name: 'Sri Venkateswara Supermarket',
      category: 'Staples, Daily Ghee, Mandi Spices',
      rating: 4.8,
      distance: '1.2 km',
      eta: '⚡ 20 MINS',
      badge: '₹50 OFF on ₹199',
      isRestaurant: false,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-1',
      name: 'Bhimavaram Ruchulu & Tiffins',
      category: 'Ghee Pesarattu, Avakaya, Special Biryani',
      rating: 4.9,
      distance: '0.9 km',
      eta: '⚡ 15 MINS',
      badge: 'Ooru Authentic',
      isRestaurant: true,
      hasTableBooking: true,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-11',
      name: 'MedPlus & Local Health Care',
      category: 'Prescription Drugs, Baby Care, Diagnostics',
      rating: 4.7,
      distance: '1.5 km',
      eta: 'Rx Verified',
      badge: 'Flat 15% OFF',
      isRestaurant: false,
      image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-9',
      name: 'Karachi Bakery & Niloufer Cafe',
      category: 'Osmania Biscuits, Kaju Katli, Fruit Loaf',
      rating: 4.8,
      distance: '2.1 km',
      eta: '⚡ 25 MINS',
      badge: 'Fresh Baked Today',
      isRestaurant: true,
      hasTableBooking: true,
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // 10 Neighborhood Categories with Bilingual Telugu labels
  const categories = [
    {
      id: 'groceries',
      title: 'Kirana & Groceries',
      telugu: 'కిరాణా దుకాణాలు',
      count: '68+ shops',
      icon: 'local_grocery_store',
      color: 'text-primary',
    },
    {
      id: 'food',
      title: 'Tiffins & Biryani',
      telugu: 'హోటళ్ళు & టిఫిన్లు',
      count: '42+ shops',
      icon: 'restaurant',
      color: 'text-secondary-container',
    },
    {
      id: 'groceries',
      title: 'Supermarkets',
      telugu: 'సూపర్ మార్కెట్',
      count: '15+ stores',
      icon: 'shopping_cart',
      color: 'text-primary',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy & Health',
      telugu: 'మందుల షాపులు',
      count: '24+ stores',
      icon: 'local_pharmacy',
      color: 'text-primary-container',
    },
    {
      id: 'food',
      title: 'Bakeries & Sweets',
      telugu: 'స్వీట్లు & బేకరీ',
      count: '18+ shops',
      icon: 'bakery_dining',
      color: 'text-secondary-container',
    },
    {
      id: 'flowers',
      title: 'Puja & Fresh Flowers',
      telugu: 'పూజా సామాగ్రి',
      count: '12+ shops',
      icon: 'spa',
      color: 'text-primary',
    },
    {
      id: 'fashion',
      title: 'Handlooms & Clothes',
      telugu: 'చేనేత వస్త్రాలు',
      count: '29+ shops',
      icon: 'checkroom',
      color: 'text-secondary-container',
    },
    {
      id: 'electronics',
      title: 'Mobile & Electronics',
      telugu: 'మొబైల్ రిపేర్',
      count: '16+ shops',
      icon: 'phonelink_setup',
      color: 'text-primary',
    },
    {
      id: 'stationery',
      title: 'Stationery & Xerox',
      telugu: 'జెరాక్స్ & బుక్స్',
      count: '14+ shops',
      icon: 'print',
      color: 'text-primary',
    },
    {
      id: 'services',
      title: 'Home Services',
      telugu: 'ఇంటి మరమ్మత్తులు',
      count: '35+ providers',
      icon: 'home_repair_service',
      color: 'text-secondary-container',
    },
  ];

  // Social Feed Posts from Followed Shops
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 'f1',
      merchantName: 'Sri Sai Fresh Fruits Mandi',
      initials: 'SF',
      locality: 'Kothapet Mandi • 18m ago',
      image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&auto=format&fit=crop&q=80',
      text: 'Fresh Banginapalli & Alphonso Mangoes direct harvest arrived today! 🥭 Sweet aroma, chemical-free. Limited 40 crates only at ₹320/dozen.',
      likes: 84,
      isLiked: false,
      isFollowed: false,
    },
    {
      id: 'f2',
      merchantName: 'Vani Matha Flowers & Pooja Stores',
      initials: 'VM',
      locality: 'Temple Street • 42m ago',
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&auto=format&fit=crop&q=80',
      text: 'Friday Special: Fresh Madurai Malli (Jasmine) & Marigold Malas freshly strung. Morning puja dispatch available immediately! 🌸',
      likes: 112,
      isLiked: false,
      isFollowed: true,
    },
    {
      id: 'f3',
      merchantName: 'Royal Bakers & Cafe',
      initials: 'RB',
      locality: 'Gandhi Road • 1h ago',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      text: 'Evening tea batch is out! Fresh Egg & Paneer Puffs hot from the oven. Pair with hot Irani Chai flask for just ₹60 combo.',
      likes: 96,
      isLiked: false,
      isFollowed: false,
    },
  ]);

  const toggleFollow = (id) => {
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowed: !p.isFollowed } : p))
    );
  };

  const toggleLike = (id) => {
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app');
    }
  };

  const openTableBooking = (restaurant) => {
    setSelectedRestaurantForBooking(restaurant);
    setActiveReservationModal(true);
  };

  const handleSendAppLink = (e) => {
    e.preventDefault();
    if (appPhone.length >= 10) {
      setAppLinkSent(true);
      setTimeout(() => setAppLinkSent(false), 4000);
      setAppPhone('');
    }
  };

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen selection:bg-secondary-container selection:text-on-primary">
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60">
        <div className="h-16 sm:h-20 w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[1280px] flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Location Pill */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="ManaMart - Mana Ooru. Mana Market."
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-left"
              type="button"
            >
              <span className="material-symbols-outlined text-secondary-container text-[18px]">
                location_on
              </span>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-[10px] text-on-surface-variant leading-none">
                  Deliver to
                </span>
                <span className="font-label-md text-xs sm:text-sm text-on-surface font-semibold max-w-[130px] sm:max-w-[170px] truncate">
                  {selectedLocality || 'Indiranagar'}, {currentCity || 'HYD'}
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                keyboard_arrow_down
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
            <form
              onSubmit={handleSearch}
              className="w-full flex items-center bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/30 px-3 py-1.5"
            >
              <span className="material-symbols-outlined text-outline text-[18px] mr-2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organic mandi veggies, biryani, medicines, daily kirana..."
                className="w-full bg-transparent font-body-md text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container transition-colors shrink-0 ml-1"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Nav Links & Actions */}
          <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold shrink-0">
            <Link
              to="/app"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Explore Stores
            </Link>
            <Link
              to="/reservations"
              className="text-secondary font-bold hover:text-secondary-container transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">restaurant</span>
              Dine-In Booking
            </Link>
            <Link
              to="/feed"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Live Feed
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Table Booking Quick Icon on Mobile */}
            <Link
              to="/reservations"
              className="lg:hidden p-2 rounded-full bg-surface-container text-secondary hover:bg-surface-container-high transition-colors"
              title="Table Booking"
            >
              <span className="material-symbols-outlined text-[20px]">restaurant</span>
            </Link>

            {/* Cart Link */}
            <Link
              to="/app"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span className="hidden sm:inline">Explore Mart</span>
            </Link>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <Link
                to={
                  role === 'merchant'
                    ? '/merchant'
                    : role === 'rider'
                    ? '/rider'
                    : role === 'admin'
                    ? '/admin'
                    : '/app'
                }
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg font-label-md text-xs sm:text-sm text-primary hover:bg-surface-container transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg bg-secondary-container text-on-primary font-label-md text-xs sm:text-sm hover:bg-secondary transition-all font-semibold shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface pt-6 sm:pt-10 pb-8 sm:pb-12">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
              
              {/* Left Column: Value Prop & CTAs */}
              <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
                {/* Micro Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high w-fit shadow-xs border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
                  <span className="font-label-sm text-xs text-secondary uppercase tracking-widest font-bold">
                    Mana Ooru • Mana Market
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-xs">
                    • Fast 20-30m drop
                  </span>
                </div>

                {/* Main Heading (Proportional 40px display font - not oversized) */}
                <div className="flex flex-col gap-1.5">
                  <h1 className="font-display-lg text-3xl sm:text-4xl lg:text-[40px] lg:leading-[48px] text-primary tracking-tight font-extrabold">
                    Your Neighborhood.<br />
                    <span className="text-secondary-container">Your Marketplace.</span>
                  </h1>
                  <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
                    Fresh groceries, authentic local food, medicines & daily essentials from trusted neighborhood shops in your town. Delivered in under 30 minutes. Mana Ooru. Mana Market.
                  </p>
                </div>

                {/* CTAs: Explore + Dine-in Booking */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/app"
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-secondary-container text-on-primary font-label-lg text-xs sm:text-sm font-bold hover:bg-secondary transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
                  >
                    <span>Explore Nearby Stores</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>

                  <Link
                    to="/reservations"
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary text-on-primary font-label-lg text-xs sm:text-sm font-bold hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                    <span>Book Restaurant Table</span>
                  </Link>

                  <Link
                    to="/merchant/apply"
                    className="px-4 py-2.5 rounded-xl border border-primary text-primary hover:bg-surface-container font-label-lg text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Partner As Merchant
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-container flex flex-col border border-outline-variant/20">
                    <span className="font-headline-sm text-sm sm:text-base text-primary font-bold">
                      10,000+
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Verified Kiranas
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container flex flex-col border border-outline-variant/20">
                    <span className="font-headline-sm text-sm sm:text-base text-secondary-container font-bold">
                      Instant UPI
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      & Cash On Delivery
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container flex flex-col border border-outline-variant/20">
                    <span className="font-headline-sm text-sm sm:text-base text-primary font-bold">
                      100% Local
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Direct Mandi Sourcing
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Bento Showcase */}
              <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                {/* Ambient Soft Glow */}
                <div className="absolute -top-8 -right-8 w-60 h-60 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-6 -left-6 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative flex flex-col gap-3">
                  {/* Store Hero Card 1 */}
                  <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-outline-variant/30 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <img
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0"
                      src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=80"
                      alt="Sri Lakshmi Kirana"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold truncate">
                          Sri Lakshmi Kirana
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-primary text-[10px] font-bold shrink-0">
                          ⚡ 12 mins
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant truncate mt-0.5">
                        Sona Masoori, Toor Dal, Fresh Spices
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                        <span className="material-symbols-outlined text-secondary text-[14px]">
                          verified
                        </span>
                        <span className="text-primary font-semibold">
                          {selectedLocality || 'Madhapur'}
                        </span>
                        <span className="text-on-surface-variant">• 4.9 ★ (1.4k)</span>
                      </div>
                    </div>
                  </div>

                  {/* Store Hero Card 2 */}
                  <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-outline-variant/30 flex items-center gap-3 -ml-1 lg:-ml-4 hover:shadow-md transition-shadow">
                    <img
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0"
                      src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80"
                      alt="Annapurna Sweets"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold truncate">
                          Annapurna Sweets & Bakery
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-bold shrink-0">
                          4.9 ★
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant truncate mt-0.5">
                        Hot Ghee Jalebi, Badam Milk, Karampodi
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                        <span className="text-secondary font-bold">₹50 OFF on ₹199</span>
                        <span className="text-on-surface-variant">• 0.8 km</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Tracking Pill Card */}
                  <div className="bg-primary text-on-primary rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest/15 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                          two_wheeler
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <span className="font-label-md text-xs text-tertiary-fixed font-bold">
                            Rider en-route
                          </span>
                        </div>
                        <span className="font-body-sm text-[11px] text-on-primary-container">
                          Arriving in 8 mins to your flat
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-price-md text-sm sm:text-base font-bold text-secondary-fixed">
                        ₹340
                      </span>
                      <span className="block font-label-sm text-[10px] text-outline-variant">
                        3 Items
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MANAAI HYPERLOCAL SCOUT INTEGRATION */}
        <section className="w-full py-6 sm:py-8 bg-surface-container-low/70 border-y border-outline-variant/30">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <ManaAIScout />
          </div>
        </section>

        {/* CATEGORIES MODULE (Veedhi Angadi) */}
        <section className="w-full py-8 sm:py-12 bg-surface">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
              <div>
                <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                  Veedhi Angadi
                </span>
                <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-[28px] text-primary font-bold tracking-tight mt-0.5">
                  Shop by Neighborhood Category
                </h2>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Handpicked local merchants fulfilling daily cravings, pooja needs, and urgent supplies.
                </p>
              </div>
              <Link
                to="/app"
                className="font-label-lg text-xs sm:text-sm text-secondary-container hover:text-secondary flex items-center gap-1 font-semibold self-start md:self-auto"
              >
                <span>View All 18 Categories</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>

            {/* 10 Clean Category Cards with Bilingual Telugu Subtext */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  to={`/app?category=${cat.id}`}
                  className="group p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high transition-all shadow-xs hover:shadow-md border border-outline-variant/20 flex flex-col justify-between h-36"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                  </div>
                  <div>
                    <span className="font-headline-sm text-xs sm:text-sm text-primary block leading-tight font-bold">
                      {cat.title}
                    </span>
                    <span className="font-body-sm text-[11px] text-secondary font-bold block mt-0.5">
                      {cat.telugu}
                    </span>
                    <span className="block font-label-sm text-[10px] text-on-surface-variant mt-0.5">
                      {cat.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED LOCAL STORES (Order Online & Dine-in Reservation) */}
        <section className="w-full py-8 sm:py-12 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                  Trusted Neighborhood Icons
                </span>
                <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-[28px] text-primary font-bold tracking-tight mt-0.5">
                  Featured Stores Near You
                </h2>
              </div>
              <Link
                to="/app"
                className="font-label-md text-xs sm:text-sm text-secondary-container hover:text-secondary font-bold flex items-center gap-1"
              >
                <span>See All Stores</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>

            {/* Stores 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featuredStores.map((store) => (
                <div
                  key={store.id}
                  className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs hover:shadow-lg border border-outline-variant/30 transition-all flex flex-col"
                >
                  {/* Store Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-surface-container">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-secondary-container text-on-primary font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {store.eta}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-md text-on-primary font-label-sm text-[10px] px-2 py-0.5 rounded">
                      {store.badge}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-headline-sm text-xs sm:text-sm text-primary truncate font-bold">
                          {store.name}
                        </h3>
                        <span className="flex items-center gap-0.5 font-label-sm text-[11px] text-secondary font-bold shrink-0">
                          <span
                            className="material-symbols-outlined text-[13px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          {store.rating}
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-1">
                        {store.category}
                      </p>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="space-y-2 pt-1 border-t border-outline-variant/20">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1 text-[11px]">
                          <span className="material-symbols-outlined text-[14px] text-outline">
                            near_me
                          </span>
                          {store.distance}
                        </span>
                        <Link
                          to={`/store/${store.id}`}
                          className="font-label-sm text-xs text-secondary-container font-bold hover:underline"
                        >
                          Visit Store →
                        </Link>
                      </div>

                      {/* Dual Action: If restaurant, offer Book Table button */}
                      {store.hasTableBooking ? (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <Link
                            to={`/store/${store.id}`}
                            className="py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs font-bold text-center transition-colors"
                          >
                            Order Food
                          </Link>
                          <button
                            onClick={() =>
                              openTableBooking({
                                id: store.id,
                                businessName: store.name,
                                rating: store.rating,
                                address: { locality: selectedLocality || 'Indiranagar' },
                              })
                            }
                            className="py-1.5 px-2 rounded-lg bg-secondary-container hover:bg-secondary text-on-primary font-label-sm text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">table_restaurant</span>
                            <span>Book Table</span>
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/store/${store.id}`}
                          className="w-full block py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-xs font-bold text-center transition-colors"
                        >
                          Shop Store Catalog
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HIGH-IMPACT EMPOWERMENT BANNER */}
        <section className="w-full py-6 sm:py-8 bg-surface">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-gradient-to-r from-primary to-primary-container p-5 sm:p-8 text-on-primary relative overflow-hidden shadow-md">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex flex-col gap-1 max-w-2xl text-center md:text-left">
                  <span className="font-label-sm text-[11px] text-secondary-fixed font-bold uppercase tracking-widest">
                    Our Pledge To Small Businesses
                  </span>
                  <h2 className="font-headline-xl text-xl sm:text-2xl text-on-primary font-bold">
                    Support Local. Shop ManaMart.
                  </h2>
                  <p className="font-body-md text-xs sm:text-sm text-tertiary-fixed-dim leading-relaxed">
                    Every order placed through ManaMart directly funds your local neighborhood retailers, family-run kirana aunties and uncles, and verified street artisans. 100% of store profits stay within your community.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                  <Link
                    to="/merchant/apply"
                    className="px-4 py-2 rounded-lg bg-secondary-container text-on-primary font-label-md text-xs sm:text-sm font-bold hover:bg-secondary transition-colors shadow-sm"
                  >
                    Join as a Merchant
                  </Link>
                  <Link
                    to="/rider/apply"
                    className="px-4 py-2 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-primary font-label-md text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Delivery Partner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW MANAMART WORKS (Simple 3 Steps) */}
        <section className="w-full py-8 sm:py-12 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <span className="font-label-sm text-xs text-secondary font-bold uppercase tracking-wider">
                Super Simple Flow
              </span>
              <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-[28px] text-primary tracking-tight font-bold mt-0.5">
                How ManaMart Delivers in Minutes
              </h2>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Bridging the warmth of local shop conversations with ultra-fast hyperlocal delivery logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Step 1 */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-display-lg text-sm font-bold">
                  1
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline-sm text-sm sm:text-base font-bold text-primary">
                    Discover Local Stores
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Enter your street address or pin code. Browse verified kiranas, medical shops, mandis, and tiffin centers operating right within your neighborhood perimeter.
                  </p>
                </div>
                <div className="pt-2 mt-auto flex items-center gap-1.5 text-primary font-label-sm text-[11px] font-semibold border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Real-time store inventory sync
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-display-lg text-sm font-bold">
                  2
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline-sm text-sm sm:text-base font-bold text-primary">
                    Shop, Order & Reserve
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Pick exact items, specify cut or ripeness directly with merchant notes, or book your favorite table in the AC Hall or Rooftop with live seat choice.
                  </p>
                </div>
                <div className="pt-2 mt-auto flex items-center gap-1.5 text-secondary-container font-label-sm text-[11px] font-semibold border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px]">restaurant</span>
                  Dual Food Delivery & Dine-In Booking
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-display-lg text-sm font-bold">
                  3
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline-sm text-sm sm:text-base font-bold text-primary">
                    Fast Hyperlocal Delivery
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Our dedicated neighborhood riders pick up from the counter and reach your door in under 30 minutes. Pay seamlessly via GooglePay, PhonePe, or Cash on Delivery.
                  </p>
                </div>
                <div className="pt-2 mt-auto flex items-center gap-1.5 text-primary font-label-sm text-[11px] font-semibold border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px]">electric_moped</span>
                  100% Zero plastic waste pledge
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL FEED PREVIEW (Follow Your Local Shops) */}
        <section className="w-full py-8 sm:py-12 bg-surface">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
              <div>
                <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                  Live Neighborhood Pulse
                </span>
                <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-[28px] text-primary tracking-tight font-bold mt-0.5">
                  Follow Your Favorite Shops
                </h2>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Catch morning fresh arrivals, exclusive evening discounts, and festive specials directly from store owners.
                </p>
              </div>
              <Link
                to="/feed"
                className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors self-start md:self-auto"
              >
                Open Full Social Feed →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {feedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-outline-variant/30 transition-shadow flex flex-col"
                >
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed text-xs">
                        {post.initials}
                      </div>
                      <div>
                        <span className="font-label-lg text-xs sm:text-sm text-primary block leading-tight font-bold">
                          {post.merchantName}
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          {post.locality}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollow(post.id)}
                      className={`px-2.5 py-1 rounded-full font-label-sm text-xs font-semibold transition-colors ${
                        post.isFollowed
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-primary hover:bg-surface-container-high'
                      }`}
                    >
                      {post.isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  <div className="relative h-44 w-full bg-surface-container">
                    <img
                      src={post.image}
                      alt={post.merchantName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <p className="font-body-md text-xs text-on-surface leading-relaxed">
                      {post.text}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                      <div className="flex items-center gap-3 text-on-surface-variant text-xs">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            post.isLiked ? 'text-secondary-container' : 'hover:text-secondary-container'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                          <span className="font-label-sm text-xs">{post.likes}</span>
                        </button>
                        <button
                          onClick={() => alert('Saved post to your favorites!')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">bookmark</span>
                          <span className="font-label-sm text-xs">Save</span>
                        </button>
                      </div>
                      <Link
                        to="/app"
                        className="px-3 py-1 rounded-lg bg-secondary-container text-on-primary font-label-md text-xs font-semibold hover:bg-secondary transition-colors"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROLE ONBOARDING QUICK BANNERS */}
        <section className="w-full py-8 sm:py-12 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Merchant Onboarding */}
              <div className="rounded-xl bg-surface-container-lowest p-5 sm:p-6 shadow-xs border border-outline-variant/30 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-xs text-secondary font-bold uppercase tracking-wider">
                      For Retailers & Kiranas
                    </span>
                    <h3 className="font-headline-lg text-base sm:text-lg text-primary font-bold">
                      Own a Shop? Sell on ManaMart
                    </h3>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                      Enjoy <strong className="text-primary">0% Commission for your first 30 days</strong>. Reach 5,000+ local families instantly without changing your daily counter routine.
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[26px]">store</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center gap-1 font-label-sm text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px] text-primary">done_all</span>
                    Instant 5-min Onboarding
                  </div>
                  <Link
                    to="/merchant/apply"
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-lg text-xs font-bold hover:bg-primary-container transition-colors"
                  >
                    Register Shop
                  </Link>
                </div>
              </div>

              {/* Delivery Partner Onboarding */}
              <div className="rounded-xl bg-surface-container-lowest p-5 sm:p-6 shadow-xs border border-outline-variant/30 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-xs text-secondary font-bold uppercase tracking-wider">
                      For Delivery Partners
                    </span>
                    <h3 className="font-headline-lg text-base sm:text-lg text-primary font-bold">
                      Have a Bike? Earn ₹25,000+/mo
                    </h3>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                      Flexible neighborhood shifts in your own area. Instant daily payouts, free vehicle insurance, and ₹2,000 joining bonus for first 50 trips.
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                    <span className="material-symbols-outlined text-[26px]">two_wheeler</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center gap-1 font-label-sm text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px] text-secondary">payments</span>
                    Daily UPI Payouts
                  </div>
                  <Link
                    to="/rider/apply"
                    className="px-3.5 py-1.5 rounded-lg bg-secondary-container text-on-primary font-label-lg text-xs font-bold hover:bg-secondary transition-colors"
                  >
                    Join as Hero
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE APP INSTALLATION BAR */}
        <section className="w-full py-6 sm:py-8 bg-surface">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-surface-container p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-display-lg text-base font-bold shrink-0">
                  M
                </div>
                <div>
                  <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold block">
                    Get the ManaMart Mobile App
                  </span>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Scan QR or receive download link on SMS for fastest 1-click re-orders.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSendAppLink} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="tel"
                  value={appPhone}
                  onChange={(e) => setAppPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="bg-surface-container-lowest px-3 py-1.5 rounded-lg text-on-surface placeholder:text-outline font-body-md text-xs focus:outline-none flex-1 md:w-56 border border-outline-variant/30"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-lg text-xs font-bold hover:bg-primary-container transition-colors shrink-0"
                >
                  {appLinkSent ? 'Link Sent ✓' : 'Send Link'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="w-full bg-surface-container-low mt-8 border-t border-outline-variant/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[1280px] py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8">
            {/* Logo & About */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="ManaMart - Mana Ooru. Mana Market."
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Hyperlocal neighborhood commerce powered by your trusted local kiranas, mandis, and artisans. Lightning fast deliveries right to your doorstep.
              </p>
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-semibold">
                  ⚡ 10-15 MINS
                </span>
                <span className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-semibold">
                  Ooru Special
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-2">
              <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold mb-1">
                Quick Links
              </span>
              <Link to="/app" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Explore Local Shops
              </Link>
              <Link to="/reservations" className="font-body-md text-xs text-secondary font-semibold hover:underline transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">restaurant</span>
                Restaurant Reservations
              </Link>
              <Link to="/parcel" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Send Parcel
              </Link>
              <Link to="/recurring" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Auto-Monthly Lists
              </Link>
            </div>

            {/* Partnerships */}
            <div className="flex flex-col gap-2">
              <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold mb-1">
                Partnerships
              </span>
              <Link to="/merchant/apply" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Become a Merchant
              </Link>
              <Link to="/rider/apply" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Join as Delivery Partner
              </Link>
              <a href="#" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="font-body-md text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Privacy Policy
              </a>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-2">
              <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold mb-1">
                Support
              </span>
              <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-1 border border-outline-variant/20">
                <span className="font-label-md text-xs text-primary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  24x7 Help Desk
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  Assistance in Telugu, Hindi & English
                </span>
                <span className="font-label-md text-xs text-secondary font-bold mt-1">
                  1800-MANA-MART
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Ribbon */}
          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-2 border-t border-outline-variant/30 text-xs text-on-surface-variant">
            <span className="font-headline-sm text-xs sm:text-sm text-primary font-bold">
              Mana Ooru. Mana Market.
            </span>
            <span className="font-body-sm text-[11px]">
              © 2025 ManaMart Technologies Private Limited. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* BookMyShow-style Interactive Restaurant Table Reservation Modal */}
      {selectedRestaurantForBooking && (
        <TableReservationModal
          isOpen={activeReservationModal}
          onClose={() => {
            setActiveReservationModal(false);
            setSelectedRestaurantForBooking(null);
          }}
          restaurant={selectedRestaurantForBooking}
        />
      )}
    </div>
  );
}
