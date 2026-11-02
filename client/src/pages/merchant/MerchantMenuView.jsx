import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MerchantPortalLayout from '../../components/merchant/MerchantPortalLayout';
import DocumentUploadInput from '../../components/DocumentUploadInput';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
} from 'lucide-react';

export default function MerchantMenuView() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [imageDoc, setImageDoc] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants/products');
      if (res.data?.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        category,
        price: parseFloat(price),
        description,
        isVeg,
        inStock,
        imageUrl: imageDoc?.fileUrl || undefined,
      };

      if (editingId) {
        const res = await api.put(`/merchants/products/${editingId}`, payload);
        if (res.data?.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? res.data.product : p))
          );
        }
      } else {
        const res = await api.post('/merchants/products', payload);
        if (res.data?.success) {
          setProducts((prev) => [res.data.product, ...prev]);
        }
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item from your live menu?')) return;
    try {
      const res = await api.delete(`/merchants/products/${id}`);
      if (res.data?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Delete error');
    }
  };

  const handleToggleStock = async (product) => {
    const nextState = !product.inStock;
    try {
      const res = await api.put(`/merchants/products/${product.id}`, { inStock: nextState });
      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: nextState } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Main Course');
    setPrice('');
    setDescription('');
    setIsVeg(true);
    setInStock(true);
    setImageDoc(null);
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    return (
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <MerchantPortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Menu & Product Catalog
            </h1>
            <p className="text-xs text-slate-500">
              Add products, upload dish photos, adjust pricing, and toggle daily inventory availability
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#064E3B] hover:bg-[#033B2D] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or category..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs focus:border-[#064E3B] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            No items in your catalog yet. Click "Add Menu Item" above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  {item.imageUrl && (
                    <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                      <h4 className="font-black text-sm text-slate-900 leading-snug">{item.name}</h4>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-sm border p-0.5 shrink-0 flex items-center justify-center ${
                      item.isVeg ? 'border-emerald-600' : 'border-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    </span>
                  </div>

                  {item.description && <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-sm text-slate-900">₹{item.price}</span>
                    <button
                      onClick={() => handleToggleStock(item)}
                      className={`block text-[10px] font-bold cursor-pointer ${item.inStock ? 'text-emerald-700' : 'text-red-600'}`}
                    >
                      {item.inStock ? '● In Stock' : '○ Out of Stock'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setName(item.name);
                        setCategory(item.category);
                        setPrice(item.price);
                        setDescription(item.description || '');
                        setIsVeg(item.isVeg ?? true);
                        setInStock(item.inStock ?? true);
                        if (item.imageUrl) setImageDoc({ fileUrl: item.imageUrl, fileName: 'item-photo' });
                        setShowModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-[#064E3B] hover:bg-emerald-50 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-slate-900">
                  {editingId ? 'Edit Product' : 'Add New Item'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Special Hyderabadi Mutton Biryani"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:border-[#064E3B] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Biryani, Starters"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="299"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Served with mirchi ka salan and dahi raita..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:border-[#064E3B] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800">Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800">In Stock</span>
                  </label>
                </div>

                <DocumentUploadInput
                  label="Product Photo"
                  description="Upload a high quality picture of the dish or grocery item"
                  docType="product_image"
                  value={imageDoc}
                  onChange={setImageDoc}
                />

                <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold cursor-pointer"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MerchantPortalLayout>
  );
}

