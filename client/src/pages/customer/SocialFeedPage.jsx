import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Share2,
  Tag,
  Sparkles,
  ShoppingBag,
  Clock,
  PlusCircle,
  Check,
} from 'lucide-react';

export default function SocialFeedPage() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/follows/feed');
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/follows/posts/${postId}/like`);
      if (res.data.success) {
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likesCount: res.data.likesCount } : p))
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeTag === 'all') return true;
    return p.tag === activeTag;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Neighborhood Updates & Feed</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </h1>
          <p className="text-xs text-slate-500">
            Daily specials, fresh stock arrivals & flash discounts from verified shops you follow
          </p>
        </div>

        {role === 'merchant' && (
          <button
            onClick={() => navigate('/merchant')}
            className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-3 py-2 rounded-2xl shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'All Updates' },
          { id: 'daily_special', label: '🍛 Daily Specials' },
          { id: 'new_arrival', label: '🌾 New Arrivals' },
          { id: 'stock_update', label: '🍪 Stock Updates' },
          { id: 'offer', label: '🏷️ Deals & Offers' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTag(t.id)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTag === t.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div className="space-y-1">
                  <div className="w-32 h-3.5 bg-slate-200 rounded"></div>
                  <div className="w-20 h-2.5 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="h-64 bg-slate-200 rounded-2xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);

            return (
              <article
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div
                    onClick={() => navigate(`/merchant/${post.merchantId}`)}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-purple-600 shadow-xs">
                      <img
                        src={post.merchantLogo || post.imageUrl}
                        alt={post.merchantName}
                        className="w-full h-full object-cover rounded-full bg-white"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                        {post.merchantName}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded">
                          {post.tag.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/merchant/${post.merchantId}`)}
                    className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Now</span>
                  </button>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div
                    onDoubleClick={() => handleLike(post.id)}
                    className="relative w-full h-72 sm:h-80 bg-slate-100 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {post.discountCode && (
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-slate-100 flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-xs font-mono font-extrabold text-orange-600 uppercase">
                          Use Code: {post.discountCode}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Actions & Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-1.5 text-xs font-bold transition-transform active:scale-125"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isLiked
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-slate-600 hover:text-rose-500'
                          }`}
                        />
                        <span className={isLiked ? 'text-rose-600' : 'text-slate-600'}>
                          {post.likesCount}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: post.title, text: post.content, url: window.location.href });
                          } else {
                            alert('Post link copied to clipboard!');
                          }
                        }}
                        className="text-slate-600 hover:text-purple-600 p-1"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Double-tap image to like ❤️
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
