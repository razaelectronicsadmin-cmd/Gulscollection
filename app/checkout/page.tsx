'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2, ShieldCheck, Truck, ArrowLeft,
  Tag, X, Loader2, Sparkles
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import type { OrderFormData } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import PremiumCard from '@/components/ui/PremiumCard';
import ReCaptcha from '@/components/common/ReCaptcha';

interface DeliverySettingsData {
  standardFee: number;
  freeDeliveryMin: number;
  isFreeDeliveryActive: boolean;
  cityRules: { city: string; fee: number; isFree: boolean; note?: string }[];
}

interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  discountAmount: number;
  description: string | null;
  isFreeShipping: boolean;
}

export default function CheckoutPage() {
  const { cart, cartTotal, placeOrder } = useStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Delivery settings
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettingsData>({
    standardFee: 250,
    freeDeliveryMin: 5000,
    isFreeDeliveryActive: true,
    cityRules: [],
  });

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // Fetch Delivery Rules on Mount
  useEffect(() => {
    fetch('/api/delivery-settings')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDeliverySettings({
            standardFee: data.standardFee ?? 250,
            freeDeliveryMin: data.freeDeliveryMin ?? 5000,
            isFreeDeliveryActive: data.isFreeDeliveryActive ?? true,
            cityRules: Array.isArray(data.cityRules) ? data.cityRules : [],
          });
        }
      })
      .catch((err) => console.error('Failed to load delivery settings:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Real-Time Delivery Fee Calculation ───────────────────────────────────
  const calculateDeliveryFee = (): { fee: number; reason: string } => {
    // 1. Free Shipping Coupon applied
    if (appliedCoupon?.isFreeShipping) {
      return { fee: 0, reason: 'Free Shipping (Coupon Applied)' };
    }

    // 2. Free Delivery Threshold reached
    if (deliverySettings.isFreeDeliveryActive && cartTotal >= deliverySettings.freeDeliveryMin) {
      return {
        fee: 0,
        reason: `Complimentary (Orders > PKR ${deliverySettings.freeDeliveryMin.toLocaleString()})`,
      };
    }

    // 3. City-Specific Override
    if (formData.city && deliverySettings.cityRules.length > 0) {
      const matched = deliverySettings.cityRules.find(
        (r) => r.city.trim().toLowerCase() === formData.city.trim().toLowerCase()
      );
      if (matched) {
        if (matched.isFree) {
          return { fee: 0, reason: `Complimentary (${matched.city} Rate)` };
        }
        return { fee: matched.fee, reason: `${matched.city} Special Rate` };
      }
    }

    // 4. Standard Rate
    return { fee: deliverySettings.standardFee, reason: 'Standard Delivery' };
  };

  const currentDelivery = calculateDeliveryFee();
  const discountTotal = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, cartTotal - discountTotal) + currentDelivery.fee;

  // ─── Coupon Validation Handler ────────────────────────────────────────────
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          subtotal: cartTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon code');

      setAppliedCoupon({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        description: data.description,
        isFreeShipping: data.isFreeShipping,
      });
      setCouponCodeInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // ─── Submit Order ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) {
      setOrderError('Please complete the security Captcha verification before placing your order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email,
          customerPhone: formData.phone || '+92 300 0000000',
          shippingAddress: `${formData.address}, ${formData.city} ${formData.zipCode}`.trim(),
          city: formData.city,
          couponCode: appliedCoupon?.code || undefined,
          captchaToken,
          b_check: honeypot,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setPlacedOrderNumber(data.orderNumber);
      setPlacedOrderDetails(data);
      placeOrder(formData);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setOrderError(err.message || 'Error processing checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success Confirmation Screen ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] flex flex-col items-center justify-center p-6 selection:bg-[#C9A66B]/30 selection:text-[#183629]">
        <div className="mb-12">
          <Link href="/" className="font-serif text-3xl tracking-tight text-[#183629] hover:text-[#C9A66B] transition-colors">
            Gul&apos;s
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white border border-[#C9A66B]/20 p-8 sm:p-14 text-center rounded-sm shadow-soft-md"
        >
          <div className="w-16 h-16 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>
          <span className="text-[14px] uppercase tracking-[0.35em] text-[#C9A66B] font-bold block mb-2 font-sans">
            Order Confirmed #{placedOrderNumber}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183629] mb-4">
            Thank You for Your Order
          </h1>
          <p className="font-sans text-[14px] text-[#8C7A5B] leading-relaxed mb-8">
            An artisan confirmation receipt has been dispatched to{' '}
            <strong className="text-[#183629]">{formData.email}</strong>. Our Karachi studio is preparing your bespoke package.
          </p>

          {placedOrderDetails && (
            <div className="bg-[#FAF8F5] border border-[#C9A66B]/20 rounded p-4 mb-8 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-semibold text-gray-900">PKR {placedOrderDetails.subtotal?.toLocaleString()}</span>
              </div>
              {placedOrderDetails.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Coupon Discount ({placedOrderDetails.couponCode}):</span>
                  <span className="font-semibold">- PKR {placedOrderDetails.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee:</span>
                <span className="font-semibold text-gray-900">
                  {placedOrderDetails.deliveryFee === 0 ? 'FREE' : `PKR ${placedOrderDetails.deliveryFee?.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#C9A66B]/20 text-sm font-bold text-[#183629]">
                <span>Total Paid:</span>
                <span className="text-[#C9A66B]">PKR {placedOrderDetails.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Link href="/">
            <Button className="w-full tracking-[0.2em] text-[11px] py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-md justify-center font-bold">
              RETURN TO BOUTIQUE
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  // ─── Empty Cart Redirect View ─────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl text-[#183629] mb-4">Your Shopping Bag is Empty</h1>
        <p className="font-sans text-[14px] text-[#8C7A5B] max-w-md mb-8">
          Explore our signature perfumes, handcrafted leather goods, and home essentials.
        </p>
        <Link href="/fragrance">
          <Button className="tracking-[0.2em] text-[11px] px-8 py-4 bg-[#183629] text-[#F3E9D7]">
            EXPLORE COLLECTIONS
          </Button>
        </Link>
      </main>
    );
  }

  const inputClass =
    'w-full bg-transparent border-b border-[#C9A66B]/40 focus:border-[#183629] focus:outline-none py-2.5 text-[14px] font-sans text-[#29251D] placeholder-[#8C7A5B]/40 transition-colors';

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] selection:bg-[#C9A66B]/30 selection:text-[#183629]">
      {/* Header */}
      <header className="border-b border-[#C9A66B]/20 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/cart"
            className="flex items-center space-x-2 text-[#8C7A5B] hover:text-[#183629] transition-colors text-[11px] uppercase tracking-[0.2em] font-semibold"
          >
            <ArrowLeft size={14} />
            <span>Return to Bag</span>
          </Link>
          <Link href="/" className="font-serif text-2xl tracking-wide text-[#183629]">
            Gul&apos;s
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-12">
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-sm">
                {orderError}
              </div>
            )}

            {/* Step 1: Contact Information */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#C9A66B]/20">
                <span className="w-6 h-6 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center text-[11px] font-serif font-bold">
                  1
                </span>
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-[#183629] font-sans">
                  Contact Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    Mobile Number (WhatsApp) *
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="0300 1234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#C9A66B]/20">
                <span className="w-6 h-6 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center text-[11px] font-serif font-bold">
                  2
                </span>
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-[#183629] font-sans">
                  Shipping Address
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    First Name *
                  </label>
                  <input
                    required
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    Last Name *
                  </label>
                  <input
                    required
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                  Complete Street Address *
                </label>
                <input
                  required
                  type="text"
                  name="address"
                  placeholder="House/Apartment #, Street, Area"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    City (e.g. Karachi) *
                  </label>
                  <input
                    required
                    type="text"
                    name="city"
                    placeholder="Karachi, Lahore, etc."
                    value={formData.city}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Postal / ZIP"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#C9A66B]/20">
                <span className="w-6 h-6 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center text-[11px] font-serif font-bold">
                  3
                </span>
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-[#183629] font-sans">
                  Payment Method
                </h2>
              </div>
              <div className="bg-white border border-[#C9A66B]/30 p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <span className="font-semibold text-[#183629] uppercase tracking-wider text-[12px] block">
                    Cash on Delivery (COD) & Express Courier
                  </span>
                  <p className="text-[12px] text-[#8C7A5B] mt-0.5">
                    Pay securely upon receipt at your doorstep across Pakistan.
                  </p>
                </div>
                <span className="text-[12px] uppercase tracking-wider text-[#C9A66B] font-bold flex items-center gap-1.5 shrink-0">
                  <ShieldCheck size={14} /> 100% Verified
                </span>
              </div>
            </div>

            {/* Anti-Bot Honeypot Field */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <input
                type="text"
                name="b_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Security Captcha Verification */}
            <div className="bg-white border border-[#C9A66B]/25 p-4 rounded-sm shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#C9A66B]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#183629]">
                  Security Verification
                </span>
              </div>
              <ReCaptcha
                onVerify={(token) => {
                  setCaptchaToken(token);
                  setOrderError('');
                }}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            {/* Error Notification */}
            {orderError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm font-medium leading-relaxed">
                {orderError}
              </div>
            )}

            {/* Submission CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full tracking-[0.2em] text-[12px] py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-md justify-center font-bold"
              >
                {isSubmitting ? 'SECURING YOUR ORDER…' : `PLACE ORDER — PKR ${grandTotal.toLocaleString()}`}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 sticky top-28">
          <PremiumCard
            elevation="elevated"
            hoverLift={false}
            className="bg-white border border-[#C9A66B]/20 p-6 sm:p-8 shadow-soft-md"
          >
            <h2 className="font-serif text-2xl text-[#183629] mb-6">Order Summary</h2>

            {/* Item List */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1 divide-y divide-[#C9A66B]/20">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-4 items-center">
                  <div className="relative w-14 aspect-[4/5] bg-white rounded-sm overflow-hidden shrink-0 border border-[#C9A66B]/20">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="56px" />
                  </div>
                  <div className="flex-1 flex justify-between items-center text-[13px] font-sans">
                    <div>
                      <h4 className="font-serif text-[15px] font-bold text-[#183629]">{item.name}</h4>
                      <p className="text-[11px] text-[#8C7A5B] mt-0.5 uppercase tracking-wider">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#C9A66B]">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Promo / Coupon Code Input Box ───────────────────────────── */}
            <div className="pt-4 pb-6 border-t border-[#C9A66B]/20">
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A5B]" />
                      <input
                        type="text"
                        placeholder="Discount code (e.g. WELCOME10)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded font-mono uppercase outline-none focus:border-[#C9A66B] bg-[#FAF8F5]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isValidatingCoupon || !couponCodeInput.trim()}
                      className="px-4 py-2 bg-[#183629] text-[#F3E9D7] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#11261d] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isValidatingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800">
                          {appliedCoupon.discountType === 'PERCENTAGE'
                            ? `${appliedCoupon.discountValue}% OFF`
                            : appliedCoupon.discountType === 'FIXED'
                            ? `PKR ${appliedCoupon.discountValue} OFF`
                            : 'Free Shipping'}
                        </span>
                      </div>
                      {appliedCoupon.description && (
                        <p className="text-[11px] text-emerald-700 mt-0.5">{appliedCoupon.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-emerald-600 hover:text-red-600 cursor-pointer"
                    title="Remove coupon"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[#C9A66B]/30 text-[13px] font-sans">
              <div className="flex justify-between text-[#8C7A5B]">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#29251D]">PKR {cartTotal.toLocaleString()}</span>
              </div>

              {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- PKR {appliedCoupon.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#8C7A5B]">
                <div>
                  <span className="block">Delivery & Insurance</span>
                  <span className="text-[10px] text-[#8C7A5B]/70 block">{currentDelivery.reason}</span>
                </div>
                <span className="font-semibold text-[#183629]">
                  {currentDelivery.fee === 0 ? (
                    <span className="text-emerald-800 font-bold uppercase tracking-wider">FREE</span>
                  ) : (
                    `PKR ${currentDelivery.fee.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-[#C9A66B]/30 flex justify-between items-baseline">
                <span className="font-serif text-lg text-[#183629]">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-[#C9A66B] tracking-wide">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#F7F7F5] rounded-sm text-[11px] text-[#8C7A5B] font-sans leading-relaxed italic border border-[#C9A66B]/20 text-center">
              &ldquo;Hand-packaged with our bespoke emerald presentation seals and signature ribbon.&rdquo;
            </div>
          </PremiumCard>
        </div>
      </div>
    </main>
  );
}
