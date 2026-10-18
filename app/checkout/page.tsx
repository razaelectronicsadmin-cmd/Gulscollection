'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Truck, ArrowLeft, Lock } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import type { OrderFormData } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import PremiumCard from '@/components/ui/PremiumCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const { cart, cartTotal, placeOrder } = useStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email,
          customerPhone: formData.phone || '+92 300 0000000',
          shippingAddress: `${formData.address}, ${formData.city} ${formData.zipCode}`.trim(),
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setPlacedOrderNumber(data.orderNumber);
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
       
        {/* Minimal Distraction-Free Header */}
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
          <span className="text-[16px] uppercase tracking-[0.35em] text-[#C9A66B] font-bold block mb-2 font-sans">
            Order #{placedOrderNumber}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183629] mb-4">
            Thank You for Your Order
          </h1>
          <p className="text-[#8C7A5B] mb-10 text-[14px] font-sans leading-relaxed">
            Your signature order <strong className="text-[#183629]">#{placedOrderNumber}</strong> has been confirmed. Confirmation details and dispatch updates will be sent directly to{' '}
            <strong className="text-[#183629] font-semibold">{formData.email}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href="/fragrance"
              className="w-full sm:w-auto tracking-[0.2em] text-[11px] px-8 py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-sm"
            >
              CONTINUE SHOPPING
            </Button>
            <Button
              href="/"
              className="w-full sm:w-auto tracking-[0.2em] text-[11px] px-8 py-4 bg-transparent border border-[#183629] text-[#183629] hover:bg-[#183629] hover:text-[#F3E9D7] transition-colors shadow-sm"
            >
              RETURN HOME
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ─── Empty Cart Fallback ──────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] flex flex-col items-center justify-center p-6 text-center font-sans">
        <Link href="/" className="font-serif text-3xl tracking-tight text-[#183629] mb-10 block">
          Gul&apos;s
        </Link>
        <h1 className="text-3xl font-serif mb-4 text-[#183629]">Your bag is empty</h1>
        <p className="text-[14px] text-[#8C7A5B] mb-10 max-w-sm leading-relaxed mx-auto">
          Select your signature perfume before proceeding to checkout.
        </p>
        <Button 
          href="/fragrance" 
          className="tracking-[0.2em] text-[11px] px-10 py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-sm"
        >
          EXPLORE FRAGRANCES
        </Button>
      </main>
    );
  }

  // Input field classes for refined transparent/border styling
  const inputClass =
    'w-full bg-transparent border-b border-[#C9A66B]/40 py-3 text-[14px] text-[#29251D] placeholder-[#8C7A5B]/60 focus:outline-none focus:border-[#C9A66B] focus:ring-0 transition-colors font-sans rounded-none';

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] selection:bg-[#C9A66B]/30 selection:text-[#183629] pb-24">
      {/* ─── Distraction-Free Header (Logo only, centered) ────────────────── */}
      <header className="w-full border-b border-[#C9A66B]/20 py-6 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-semibold text-[#8C7A5B] hover:text-[#183629] transition-colors font-sans"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Return to Bag</span>
          </Link>

          <Link href="/" className="font-serif text-3xl tracking-tight text-[#183629] hover:text-[#C9A66B] transition-colors">
            Gul&apos;s
          </Link>

          <div className="flex items-center gap-1.5 text-[12px] uppercase tracking-widest text-[#8C7A5B] font-sans font-medium">
            <Lock size={12} className="text-[#C9A66B]" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* ─── Main 2-Column Checkout Layout ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Guest Checkout Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-12">
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-[13px] text-red-600 font-sans">
                {orderError}
              </div>
            )}

            {/* Step 1: Customer Info */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#C9A66B]/20">
                <span className="w-6 h-6 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center text-[11px] font-serif font-bold">
                  1
                </span>
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-[#183629] font-sans">
                  Guest Contact Details
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
                    placeholder="For order tracking updates"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.2em] text-[#183629] font-sans font-semibold mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="e.g. +92 300 1234567"
                    value={formData.phone || ''}
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
                  Shipping Destination
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
                    placeholder="First name"
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
                    placeholder="Last name"
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
                    City *
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

            {/* Step 3: Payment */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#C9A66B]/20">
                <span className="w-6 h-6 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center text-[11px] font-serif font-bold">
                  3
                </span>
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-[#183629] font-sans">
                  Payment
                </h2>
              </div>
              <div className="bg-white border border-[#C9A66B]/30 p-5 rounded-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <span className="font-semibold text-[#183629] uppercase tracking-wider text-[11px]">
                  Cash on Delivery / Direct Card Processing
                </span>
                <span className="text-[12px] uppercase tracking-wider text-[#C9A66B] font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Verified Safe
                </span>
              </div>
              
            </div>

            {/* Submission CTA */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full tracking-[0.2em] text-[12px] py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-md justify-center font-bold"
              >
                {isSubmitting ? 'SECURING YOUR ORDER…' : 'PLACE ORDER'}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-[#C9A66B]/20 text-[9px] uppercase tracking-widest text-[#8C7A5B] font-sans font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#183629]" />
                <span>Encrypted Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={16} className="text-[#183629]" />
                <span>Complimentary Delivery</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 sticky top-12">
          <PremiumCard
            elevation="elevated"
            hoverLift={false}
            className="bg-white border border-[#C9A66B]/20 p-8 sm:p-10 shadow-soft-md"
          >
            <h2 className="font-serif text-2xl text-[#183629] mb-8">
              Order Summary
            </h2>

            {/* Item List */}
            <div className="space-y-5 mb-8 max-h-[350px] overflow-y-auto pr-1 hide-scrollbar divide-y divide-[#C9A66B]/20">
              {cart.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
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

            {/* Calculations */}
            <div className="space-y-4 pt-6 border-t border-[#C9A66B]/30 text-[13px] font-sans">
              <div className="flex justify-between text-[#8C7A5B]">
                <span>Subtotal</span>
                <span className="font-medium text-[#29251D]">
                  PKR {cartTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#8C7A5B]">
                <span>Delivery & Insurance</span>
                <span className="text-[#C9A66B] font-semibold uppercase tracking-wider text-[12px]">
                  Complimentary
                </span>
              </div>
              <div className="pt-5 border-t border-[#C9A66B]/30 flex justify-between items-baseline">
                <span className="font-serif text-lg text-[#183629]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#C9A66B] tracking-wide">
                  PKR {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-8 p-5 bg-[#F7F7F5] rounded-sm text-[12px] text-[#8C7A5B] font-sans leading-relaxed italic border border-[#C9A66B]/20 shadow-inner text-center">
              &ldquo;Every signature order is hand-packaged with our bespoke emerald presentation seals.&rdquo;
            </div>
          </PremiumCard>
        </div>
      </div>
    </main>
  );
}