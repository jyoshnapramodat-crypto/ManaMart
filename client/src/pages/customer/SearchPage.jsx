import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import VernacularVoiceModal from '../../components/VernacularVoiceModal';
import {
  Search,
  Mic,
  X,
  History,
  TrendingUp,
  SlidersHorizontal,
  Store,
  ShoppingBag,
  Star,
  MapPin,
  Clock,
  Plus,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  Volume2,
} from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { selectedLocality, currentCity } = useLocation();
  const { addItem, cartItems } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'rating' | 'distance' | 'price_low'
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);

  // Data
  const [allStores, setAllStores] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('manamart_recent_searches');
      return saved ? JSON.parse(saved) : ['Dum Biryani', 'Sona Masoori Rice', 'Niloufer Chai', 'Apollo Dolo 650'];
    } catch (e) {
      return ['Dum Biryani', 'Sona Masoori Rice', 'Niloufer Chai'];
    }
  });

  const popularSearches = [
    'Hyderabadi Dum Biryani',
    'Vijaya Dairy Milk',
    'Aavin Pure Ghee',
    'Fresh Tomatoes & Onions',
    'Karachi Bakery Biscuits',
    '24x7 Medicines',
  ];

  const trendingCategories = [
    { id: 'c-1', name: 'Dum Biryani & Kebabs', icon: '🍲' },
    { id: 'c-2', name: 'Fresh Kirana & Rice', icon: '🌾' },
    { id: 'c-3', name: 'Dairy & Farm Milk', icon: '🥛' },
    { id: 'c-4', name: 'Irani Chai & Snacks', icon: '☕' },
    { id: 'c-5', name: 'Pharmacy & Wellness', icon: '💊' },
    { id: 'c-6', name: 'Fresh Rythu Sabzi', icon: '🥦' },
  ];

  // Fetch initial marketplace inventory
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/discovery/merchants?city=${currentCity}&locality=${selectedLocality}`),
      api.get('/discovery/categories'),
    ])
      .then(([merchRes]) => {
        if (merchRes.data.success && merchRes.data.merchants) {
          setAllStores(merchRes.data.merchants);
          // Aggregate products from merchants
          const prods = [];
          merchRes.data.merchants.forEach((m) => {
            if (m.featuredProducts) {
              m.featuredProducts.forEach((p) => {
                prods.push({
                  ...p,
                  store: {
                    id: m.id,
                    businessName: m.businessName,
                    deliveryFee: m.deliveryFee || 35,
                    deliveryEta: m.deliveryEta || '25-35 mins',
                    rating: m.rating || 4.5,
                  },
                });
              });
            }
          });
          setAllProducts(prods);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentCity, selectedLocality]);

  // Sync recent searches
  const saveRecentSearch = (term) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('manamart_recent_searches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('manamart_recent_searches');
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query);
    setSearchParams({ q: query });
  };

  const handleSelectQuery = (term) => {
    setQuery(term);
    saveRecentSearch(term);
    setSearchParams({ q: term });
  };

  // Voice Search Simulation
  const handleVoiceTrigger = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      const samples = ['Hyderabadi Chicken Dum Biryani', 'Fresh Sona Masoori Rice', 'Niloufer Osmania Biscuits'];
      const chosen = samples[Math.floor(Math.random() * samples.length)];
      setQuery(chosen);
      saveRecentSearch(chosen);
      setSearchParams({ q: chosen });
      setIsVoiceListening(false);
    }, 2000);
  };

  // Filter & Search Logic
  const qClean = query.trim().toLowerCase();

  const matchingStores = allStores.filter((s) => {
    if (!qClean) return false;
    const matchName = s.businessName?.toLowerCase().includes(qClean);
    const matchCategory = s.category?.toLowerCase().includes(qClean);
    const matchCuisine = s.cuisine?.toLowerCase().includes(qClean);
    const matchesQuery = matchName || matchCategory || matchCuisine;

    if (!matchesQuery) return false;
    if (filterOpenNow && s.isOpen === false) return false;
    if (filterFreeDelivery && (s.deliveryFee || 35) > 0) return false;
    return true;
  });

  const matchingProducts = allProducts.filter((p) => {
    if (!qClean) return false;
    const matchName = p.name?.toLowerCase().includes(qClean);
    const matchDesc = p.description?.toLowerCase().includes(qClean);
    const matchStore = p.store?.businessName?.toLowerCase().includes(qClean);
    const matchesQuery = matchName || matchDesc || matchStore;

    if (!matchesQuery) return false;
    if (filterVegOnly && !p.isVeg) return false;
    return true;
  });

  // Sorting
  matchingProducts.sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
    return 0;
  });

  const hasResults = matchingStores.length > 0 || matchingProducts.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Search Bar with Voice UI */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-orange-600 absolute left-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for biryani, kirana, groceries in ${selectedLocality}...`}
            className="w-full pl-12 pr-36 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            autoFocus
          />

          <div className="absolute right-3 flex items-center space-x-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchParams({});
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Voice Search Vernacular AI (Module 2) */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-orange-50 text-[#fe6b00] hover:bg-orange-100 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              title="Voice Search in Telugu / English"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Direct Search Submit Button */}
            <button
              type="submit"
              className="px-3.5 py-2 bg-gradient-to-r from-[#fe6b00] to-[#fd5a05] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1 active:scale-95"
            >
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Voice Listening Active Sheet */}
        {isVoiceListening && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between shadow-md animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center animate-ping">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">Listening to your voice...</span>
                <span className="text-xs text-orange-100">Try saying "Hyderabadi Dum Biryani" or "Sona Masoori Rice"</span>
              </div>
            </div>
            <button
              onClick={() => setIsVoiceListening(false)}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Filter & Sorting Bar */}
        <div className="flex items-center justify-between overflow-x-auto py-1 gap-2 no-scrollbar">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterVegOnly(!filterVegOnly)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center space-x-1 ${
                filterVegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 mr-1" />
              <span>Pure Veg</span>
            </button>

            <button
              onClick={() => setFilterOpenNow(!filterOpenNow)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center space-x-1 ${
                filterOpenNow
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Now</span>
            </button>

            <button
              onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center space-x-1 ${
                filterFreeDelivery
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Free Delivery</span>
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500 shadow-xs"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="price_low">Sort: Price Low to High</option>
          </select>
        </div>
      </div>

      {/* WHEN NO SEARCH QUERY HAS BEEN ENTERED: SHOW RECENT, POPULAR & TRENDING */}
      {!qClean && (
        <div className="space-y-6">
          {/* Recent Searches (Module 2) */}
          {recentSearches.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Searches</span>
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectQuery(term)}
                    className="text-xs font-medium bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent px-3 py-1.5 rounded-xl text-slate-700 transition-all flex items-center space-x-1.5"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
              <span>Popular in {selectedLocality}</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectQuery(term)}
                  className="text-xs font-bold bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-xl text-slate-800 shadow-2xs transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Categories */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore Top Categories</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {trendingCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectQuery(cat.name)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all text-left flex items-center space-x-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-orange-600 block">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400">Available nearby</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WHEN SEARCH QUERY IS PRESENT: GROUPED RESULTS */}
      {qClean && (
        <div className="space-y-6">
          {/* Empty / No-Results State (Module 2) */}
          {!hasResults && (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 my-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                No Exact Matches for "{query}"
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We couldn't find items matching that query in {selectedLocality}. Try checking your spelling or explore these trending alternatives:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {popularSearches.slice(0, 4).map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuery(alt)}
                    className="text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition-all"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GROUP 1: STORES & EATERIES (Module 2) */}
          {matchingStores.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span>Matching Stores & Eateries ({matchingStores.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingStores.map((store) => (
                  <Link
                    key={store.id}
                    to={`/store/${store.id}`}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all flex items-center space-x-3 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {store.image ? (
                        <img src={store.image} alt={store.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-base">
                          {store.businessName?.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 truncate group-hover:text-orange-600">
                          {store.businessName}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md flex items-center">
                          <Star className="w-2.5 h-2.5 fill-current text-emerald-600 mr-0.5" />
                          {store.rating || 4.5}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 truncate block">
                        {store.category} • {store.locality || selectedLocality}
                      </span>

                      <div className="flex items-center space-x-3 text-[10px] text-slate-500 mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-0.5 text-orange-600" />
                          {store.deliveryEta || '25-35 mins'}
                        </span>
                        <span>•</span>
                        <span>₹{store.deliveryFee === 0 ? 'FREE Delivery' : `₹${store.deliveryFee} Fee`}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* GROUP 2: PRODUCTS & GROCERIES (Module 2 & 3) */}
          {matchingProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Matching Items & Groceries ({matchingProducts.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingProducts.map((prod) => {
                  const inCart = cartItems.some((ci) => ci.id === prod.id);

                  return (
                    <div
                      key={prod.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-sm transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Veg indicator */}
                        <span
                          className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center flex-shrink-0 ${
                            prod.isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        </span>

                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate block">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            By {prod.store?.businessName}
                          </span>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="font-black text-xs text-orange-600">₹{prod.price}</span>
                            <span className="text-[10px] text-slate-400">/{prod.unit || 'unit'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => addItem(prod, prod.store)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                          inCart
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-700 border border-orange-200'
                        }`}
                      >
                        {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{inCart ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Vernacular Voice AI Ordering Modal (Telugu + English) */}
      <VernacularVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}

