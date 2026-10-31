import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function RecurringListsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [executingId, setExecutingId] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  // New list form state
  const [title, setTitle] = useState('Monthly Family Pantry & Staples');
  const [frequency, setFrequency] = useState('monthly');
  const [scheduledDay, setScheduledDay] = useState(1);
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recurring-lists');
      if (res.data.success) {
        setLists(res.data.lists);
      }
    } catch (err) {
      console.error('Error fetching recurring lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseToggle = async (list) => {
    try {
      const endpoint = list.status === 'active' ? 'pause' : 'resume';
      const res = await api.post(`/recurring-lists/${list.id}/${endpoint}`);
      if (res.data.success) {
        setLists((prev) =>
          prev.map((l) => (l.id === list.id ? { ...l, status: endpoint === 'pause' ? 'paused' : 'active' } : l))
        );
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleExecuteCheck = async (listId) => {
    setExecutingId(listId);
    setExecutionResult(null);
    try {
      const res = await api.post(`/recurring-lists/${listId}/execute`);
      if (res.data.success) {
        setExecutionResult({
          success: true,
          message: res.data.message,
          order: res.data.order,
        });
        fetchLists();
      }
    } catch (err) {
      setExecutionResult({
        success: false,
        message: err.response?.data?.message || 'Monthly execution failed.',
      });
    } finally {
      setExecutingId(null);
    }
  };

  const handleDelete = async (listId) => {
    if (!window.confirm('Delete this automated recurring shopping list?')) return;
    try {
      await api.delete(`/recurring-lists/${listId}`);
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCreateNewList = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        merchantId: 'm-2', // Sri Lakshmi Kirana
        frequency,
        scheduledDay: Number(scheduledDay),
        scheduledTime,
        items: [
          { productId: 'p-5', name: 'Kurnool Sona Masoori Raw Rice (25 kg)', price: 1350, quantity: 1 },
          { productId: 'p-6', name: 'Freedom Refined Sunflower Oil (5L)', price: 590, quantity: 2 },
          { productId: 'p-7', name: 'Unpolished Toor Dal (1 kg)', price: 165, quantity: 2 },
        ],
      };

      const res = await api.post('/recurring-lists', payload);
      if (res.data.success) {
        setIsCreating(false);
        fetchLists();
      }
    } catch (err) {
      console.error('Create list error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{t('recurring.title')}</span>
            <Repeat className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            {t('recurring.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('recurring.createBtn')}</span>
        </button>
      </div>

      {/* Execution Alert Banner */}
      {executionResult && (
        <div
          className={`p-4 rounded-3xl border flex items-start justify-between gap-3 ${
            executionResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-start space-x-3">
            {executionResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold">{executionResult.message}</p>
              {executionResult.order && (
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Live Order <span className="font-mono font-bold">{executionResult.order.orderNumber}</span> created. Total: ₹{executionResult.order.totalAmount}.
                </p>
              )}
            </div>
          </div>
          {executionResult.order && (
            <button
              onClick={() => navigate(`/orders/${executionResult.order.id}`)}
              className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs whitespace-nowrap"
            >
              Track Order
            </button>
          )}
        </div>
      )}

      {/* Lists Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Repeat className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No recurring lists setup yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Setup automatic monthly rations from Sri Lakshmi Kirana or groceries to receive hassle-free recurring deliveries.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-xs font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-card space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-base text-slate-900">{list.title}</h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        list.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {list.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fulfilled by: <span className="font-semibold text-slate-700">{list.merchantName}</span>
                  </p>
                </div>

                {/* Schedule info pill */}
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/80">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Scheduled on {list.scheduledDay}st of every month ({list.scheduledTime})</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subscribed Items ({list.items.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {list.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                        <span className="text-[11px] text-slate-500">
                          Qty: <span className="font-bold">{item.quantity}</span> ({item.unit || 'unit'})
                        </span>
                      </div>
                      <span className="font-black text-slate-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Control Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[11px]">Estimated Monthly Bill:</span>
                  <span className="text-lg font-black text-slate-900">₹{list.estimatedTotal}</span>
                </div>

                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {/* Pause / Resume */}
                  <button
                    onClick={() => handlePauseToggle(list)}
                    className="flex items-center space-x-1 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {list.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  {/* Trigger Immediate Execution */}
                  <button
                    onClick={() => handleExecuteCheck(list.id)}
                    disabled={executingId === list.id || list.status !== 'active'}
                    className="flex items-center space-x-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {executingId === list.id ? (
                      <span>Checking Merchant Stock...</span>
                    ) : (
                      <>
                        <Repeat className="w-3.5 h-3.5" />
                        <span>{t('recurring.executeBtn')}</span>
                      </>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(list.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    title="Delete List"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Execution History */}
              {list.history && list.history.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Last Execution: </span>
                  {list.history[0].executionDate} • {list.history[0].status} (₹{list.history[0].amount})
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create New List Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Create New Recurring Shopping List
            </h3>

            <form onSubmit={handleCreateNewList} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">List Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Rice & Cooking Oil"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Every 2 Weeks</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Day of Month</label>
                  <select
                    value={scheduledDay}
                    onChange={(e) => setScheduledDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value={1}>1st of Month</option>
                    <option value={5}>5th of Month</option>
                    <option value={10}>10th of Month</option>
                    <option value={15}>15th of Month</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 space-y-1">
                <span className="font-bold block">Pre-loaded Recommended Staples:</span>
                <p className="text-[11px] text-emerald-700">
                  • Kurnool Sona Masoori Rice (25kg)<br />
                  • Freedom Refined Sunflower Oil (5L x 2)<br />
                  • Unpolished Farm Toor Dal (1kg x 2)
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md"
                >
                  Save & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
