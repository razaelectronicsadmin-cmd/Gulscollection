'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, Tag, Sparkles, Plus, Trash2, CheckCircle2,
  AlertCircle, Loader2, Save, X, Calendar, Percent
} from 'lucide-react';

interface CityRule {
  city: string;
  fee: number;
  isFree: boolean;
  note?: string;
}

interface DeliverySettingState {
  standardFee: number;
  freeDeliveryMin: number;
  isFreeDeliveryActive: boolean;
  cityRules: CityRule[];
}

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number | string;
  minOrderAmount: number | string | null;
  maxDiscount: number | string | null;
  usageLimit: number | null;
  timesUsed: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface PromotionalDiscount {
  id: number;
  name: string;
  targetType: 'STOREWIDE' | 'CATEGORY' | 'PRODUCT';
  targetId: number | null;
  targetName: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number | string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<'delivery' | 'coupons' | 'promotions'>('delivery');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Delivery state
  const [delivery, setDelivery] = useState<DeliverySettingState>({
    standardFee: 250,
    freeDeliveryMin: 5000,
    isFreeDeliveryActive: true,
    cityRules: [],
  });
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityFee, setNewCityFee] = useState('0');
  const [newCityIsFree, setNewCityIsFree] = useState(true);
  const [newCityNote, setNewCityNote] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING',
    discountValue: '10',
    minOrderAmount: '2000',
    maxDiscount: '',
    usageLimit: '',
    endDate: '',
    isActive: true,
  });
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Promotional Discounts state
  const [promotions, setPromotions] = useState<PromotionalDiscount[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    name: '',
    targetType: 'CATEGORY' as 'STOREWIDE' | 'CATEGORY' | 'PRODUCT',
    targetId: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '15',
    endDate: '',
    isActive: true,
  });
  const [isSavingPromo, setIsSavingPromo] = useState(false);

  // Notification helper
  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Load Initial Data
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [delRes, coupRes, promoRes, catRes, prodRes] = await Promise.all([
          fetch('/api/admin/promotions/delivery'),
          fetch('/api/admin/promotions/coupons'),
          fetch('/api/admin/promotions/discounts'),
          fetch('/api/admin/categories?all=true'),
          fetch('/api/admin/products?limit=100'),
        ]);

        if (delRes.ok) {
          const delData = await delRes.json();
          setDelivery({
            standardFee: delData.standardFee,
            freeDeliveryMin: delData.freeDeliveryMin,
            isFreeDeliveryActive: delData.isFreeDeliveryActive,
            cityRules: delData.cityRules || [],
          });
        }

        if (coupRes.ok) {
          const coupData = await coupRes.json();
          setCoupons(Array.isArray(coupData) ? coupData : []);
        }

        if (promoRes.ok) {
          const promoData = await promoRes.json();
          setPromotions(Array.isArray(promoData) ? promoData : []);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) setCategories(catData);
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.products && Array.isArray(prodData.products)) {
            setProducts(prodData.products.map((p: any) => ({ id: p.id, name: p.name })));
          }
        }
      } catch (err) {
        console.error(err);
        notify('Failed to load promotions and delivery data.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // ─── 1. Delivery Settings Actions ──────────────────────────────────────────
  const handleSaveDelivery = async () => {
    setIsSavingDelivery(true);
    try {
      const res = await fetch('/api/admin/promotions/delivery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(delivery),
      });

      if (!res.ok) throw new Error('Save failed');
      notify('Delivery rates and rules saved successfully.');
    } catch {
      notify('Failed to save delivery settings.', 'error');
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const handleAddCityRule = () => {
    if (!newCityName.trim()) {
      notify('Please enter a city name.', 'error');
      return;
    }

    const rule: CityRule = {
      city: newCityName.trim(),
      fee: newCityIsFree ? 0 : parseFloat(newCityFee) || 0,
      isFree: newCityIsFree,
      note: newCityNote.trim() || undefined,
    };

    setDelivery((prev) => ({
      ...prev,
      cityRules: [...prev.cityRules.filter((r) => r.city.toLowerCase() !== rule.city.toLowerCase()), rule],
    }));

    setNewCityName('');
    setNewCityFee('0');
    setNewCityIsFree(true);
    setNewCityNote('');
  };

  const handleRemoveCityRule = (cityToRemove: string) => {
    setDelivery((prev) => ({
      ...prev,
      cityRules: prev.cityRules.filter((r) => r.city.toLowerCase() !== cityToRemove.toLowerCase()),
    }));
  };

  // ─── 2. Coupon Actions ────────────────────────────────────────────────────
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      notify('Please enter a coupon code.', 'error');
      return;
    }

    setIsSavingCoupon(true);
    try {
      const res = await fetch('/api/admin/promotions/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      setCoupons((prev) => [data, ...prev]);
      setShowCouponModal(false);
      setCouponForm({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '10',
        minOrderAmount: '2000',
        maxDiscount: '',
        usageLimit: '',
        endDate: '',
        isActive: true,
      });
      notify(`Coupon "${data.code}" created successfully.`);
    } catch (err: any) {
      notify(err.message || 'Error saving coupon.', 'error');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleToggleCouponActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/promotions/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (!res.ok) throw new Error('Toggle failed');
      const updated = await res.json();
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
      notify(`Coupon "${coupon.code}" status updated.`);
    } catch {
      notify('Failed to update coupon status.', 'error');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/promotions/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      notify('Coupon deleted successfully.');
    } catch {
      notify('Failed to delete coupon.', 'error');
    }
  };

  // ─── 3. Promotional Discount Actions ──────────────────────────────────────
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.name.trim()) {
      notify('Please enter a promotion name.', 'error');
      return;
    }

    let targetName: string | null = null;
    if (promoForm.targetType === 'CATEGORY') {
      const cat = categories.find((c) => c.id === parseInt(promoForm.targetId));
      targetName = cat ? cat.name : null;
    } else if (promoForm.targetType === 'PRODUCT') {
      const prod = products.find((p) => p.id === parseInt(promoForm.targetId));
      targetName = prod ? prod.name : null;
    } else {
      targetName = 'Entire Store';
    }

    setIsSavingPromo(true);
    try {
      const res = await fetch('/api/admin/promotions/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...promoForm,
          targetName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create promotion');

      setPromotions((prev) => [data, ...prev]);
      setShowPromoModal(false);
      setPromoForm({
        name: '',
        targetType: 'CATEGORY',
        targetId: '',
        discountType: 'PERCENTAGE',
        discountValue: '15',
        endDate: '',
        isActive: true,
      });
      notify(`Promotion "${data.name}" created successfully.`);
    } catch (err: any) {
      notify(err.message || 'Error saving promotion.', 'error');
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (promo: PromotionalDiscount) => {
    try {
      const res = await fetch(`/api/admin/promotions/discounts/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });

      if (!res.ok) throw new Error('Toggle failed');
      const updated = await res.json();
      setPromotions((prev) => prev.map((p) => (p.id === promo.id ? updated : p)));
      notify(`Promotion "${promo.name}" status updated.`);
    } catch {
      notify('Failed to update promotion status.', 'error');
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const res = await fetch(`/api/admin/promotions/discounts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      notify('Promotion deleted successfully.');
    } catch {
      notify('Failed to delete promotion.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Percent size={22} className="text-[#d4af37]" />
            Promotions & Delivery
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure flexible delivery rules, coupon codes, and automated category discounts.
          </p>
        </div>

        {activeTab === 'coupons' && (
          <button
            onClick={() => setShowCouponModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-xs"
          >
            <Plus size={16} /> New Coupon Code
          </button>
        )}

        {activeTab === 'promotions' && (
          <button
            onClick={() => setShowPromoModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-xs"
          >
            <Plus size={16} /> New Automatic Discount
          </button>
        )}
      </div>

      {/* Floating Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2 text-sm font-medium border ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Modern Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'delivery'
              ? 'border-[#183629] text-[#183629]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck size={17} />
          Delivery Rules & City Rates
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'coupons'
              ? 'border-[#183629] text-[#183629]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag size={17} />
          Discount Coupon Codes ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'promotions'
              ? 'border-[#183629] text-[#183629]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles size={17} />
          Automatic Promotions ({promotions.length})
        </button>
      </div>

      {/* ─── TAB 1: DELIVERY RULES & RATES ─────────────────────────────────── */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-6">
            <h2 className="text-base font-semibold text-gray-900">General Shipping Rules</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Fee */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Standard Delivery Fee (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={delivery.standardFee}
                  onChange={(e) =>
                    setDelivery((prev) => ({ ...prev, standardFee: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Default flat rate applied across Pakistan.</p>
              </div>

              {/* Free Delivery Minimum */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Free Delivery Threshold (PKR)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={delivery.isFreeDeliveryActive}
                      onChange={(e) =>
                        setDelivery((prev) => ({ ...prev, isFreeDeliveryActive: e.target.checked }))
                      }
                      className="rounded text-[#183629] focus:ring-[#183629]"
                    />
                    Enabled
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  step="100"
                  disabled={!delivery.isFreeDeliveryActive}
                  value={delivery.freeDeliveryMin}
                  onChange={(e) =>
                    setDelivery((prev) => ({ ...prev, freeDeliveryMin: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Orders equal or greater than this amount qualify for automatic free delivery.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={handleSaveDelivery}
                disabled={isSavingDelivery}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
              >
                {isSavingDelivery ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Shipping Settings
              </button>
            </div>
          </div>

          {/* City-Wise Custom Rules Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">City-Specific Delivery Rules</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Set custom rates or free delivery for specific cities (e.g. Free delivery within Karachi).
              </p>

              {/* Add New City Rule Inline Form */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200/60 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Karachi"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select
                    value={newCityIsFree ? 'free' : 'custom'}
                    onChange={(e) => setNewCityIsFree(e.target.value === 'free')}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="free">Free Delivery (PKR 0)</option>
                    <option value="custom">Custom Delivery Fee</option>
                  </select>
                </div>

                {!newCityIsFree ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fee (PKR)</label>
                    <input
                      type="number"
                      placeholder="150"
                      value={newCityFee}
                      onChange={(e) => setNewCityFee(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Local Boutique"
                      value={newCityNote}
                      onChange={(e) => setNewCityNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddCityRule}
                  className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
                >
                  Add City Rule
                </button>
              </div>
            </div>

            {/* City Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-semibold text-gray-500">City</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-500">Rule Type</th>
                    <th className="text-right px-6 py-3 font-semibold text-gray-500">Rate</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-500">Note</th>
                    <th className="text-right px-6 py-3 font-semibold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {delivery.cityRules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400 text-xs">
                        No city-specific rules configured. All cities use standard rates.
                      </td>
                    </tr>
                  ) : (
                    delivery.cityRules.map((rule) => (
                      <tr key={rule.city} className="hover:bg-gray-50/60">
                        <td className="px-6 py-3.5 font-medium text-gray-900">{rule.city}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              rule.isFree
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {rule.isFree ? 'Free Delivery' : 'Custom Rate'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-900">
                          {rule.isFree ? 'PKR 0' : `PKR ${rule.fee}`}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-500">{rule.note || '—'}</td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleRemoveCityRule(rule.city)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Remove City Rule"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MARKETING COUPONS ───────────────────────────────────────── */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Code</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Discount</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Min Spend</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Redemptions</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Status</th>
                  <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      No coupon codes created yet. Click &quot;New Coupon Code&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                          {c.code}
                        </span>
                        {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#183629]">
                        {c.discountType === 'PERCENTAGE'
                          ? `${Number(c.discountValue)}% OFF`
                          : c.discountType === 'FIXED'
                          ? `PKR ${Number(c.discountValue).toLocaleString()} OFF`
                          : 'Free Delivery'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {c.minOrderAmount ? `PKR ${Number(c.minOrderAmount).toLocaleString()}` : 'No minimum'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-gray-700">
                        {c.timesUsed} {c.usageLimit ? `/ ${c.usageLimit}` : 'times'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleCouponActive(c)}
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer border ${
                            c.isActive
                              ? 'bg-green-100 text-green-900 border-green-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Paused'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: AUTOMATIC PROMOTIONS ─────────────────────────────────────── */}
      {activeTab === 'promotions' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Campaign Name</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Scope</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Discount</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Status</th>
                  <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                      No automated category or product discounts created.
                    </td>
                  </tr>
                ) : (
                  promotions.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                          {p.targetType}: {p.targetName || 'All'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#183629]">
                        {p.discountType === 'PERCENTAGE'
                          ? `${Number(p.discountValue)}% OFF`
                          : `PKR ${Number(p.discountValue)} OFF`}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleTogglePromoActive(p)}
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer border ${
                            p.isActive
                              ? 'bg-green-100 text-green-900 border-green-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Paused'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePromo(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Promotion"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE COUPON ─────────────────────────────────────────── */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create Marketing Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026, WELCOME10"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Internal or Customer)</label>
                <input
                  type="text"
                  placeholder="e.g. 10% off for first-time buyers"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (PKR)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={couponForm.discountType === 'FREE_SHIPPING'}
                    placeholder="10"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Spend (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional (e.g. 2000)"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Cap (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional (e.g. 1500)"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold"
                >
                  {isSavingCoupon ? 'Saving…' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE AUTOMATIC PROMOTION ───────────────────────────── */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create Automatic Promotion</h3>
              <button onClick={() => setShowPromoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Promotion Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Leather Sale 15% Off"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Scope</label>
                  <select
                    value={promoForm.targetType}
                    onChange={(e) => setPromoForm({ ...promoForm, targetType: e.target.value as any, targetId: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="CATEGORY">Category</option>
                    <option value="PRODUCT">Specific Product</option>
                    <option value="STOREWIDE">Storewide (All Items)</option>
                  </select>
                </div>

                {promoForm.targetType === 'CATEGORY' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Select Category</label>
                    <select
                      value={promoForm.targetId}
                      required
                      onChange={(e) => setPromoForm({ ...promoForm, targetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {promoForm.targetType === 'PRODUCT' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Select Product</label>
                    <select
                      value={promoForm.targetId}
                      required
                      onChange={(e) => setPromoForm({ ...promoForm, targetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="15"
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPromo}
                  className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold"
                >
                  {isSavingPromo ? 'Saving…' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

