'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import PremiumCard from '@/components/ui/PremiumCard';
import { useStore } from '@/context/StoreContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] selection:bg-[#C9A66B]/30 selection:text-[#183629]">
      <Navbar />

      <section className="pt-32 md:pt-40 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="text-[12px] md:text-[11px] font-sans uppercase tracking-[0.3em] text-[#C9A66B] mb-3 inline-block font-semibold">
              Your Selection
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[56px] text-[#183629] tracking-tight">
              Shopping Bag
            </h1>
          </div>

          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-8">
                <div className="border-t border-[#C9A66B]/30 divide-y divide-[#C9A66B]/20">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.3 }}
                        className="py-7 flex gap-5 sm:gap-7 items-center group"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 sm:w-24 aspect-[4/5] bg-white rounded-sm overflow-hidden shrink-0 border border-[#C9A66B]/20 shadow-sm">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain object-center group-hover:scale-105 transition-transform duration-500 p-2"
                            sizes="96px"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-serif text-lg sm:text-xl text-[#183629] font-bold group-hover:text-[#C9A66B] transition-colors uppercase tracking-wide">
                                {item.name}
                              </h3>
                              <p className="text-[12px] uppercase tracking-widest text-[#8C7A5B] font-sans mt-1">
                                Extrait de Parfum &bull; 50ml
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label="Remove item"
                              className="text-[#8C7A5B] hover:text-[#183629] transition-colors p-1 cursor-pointer"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
                            {/* Quantity Controls */}
                            <div className="inline-flex items-center border border-[#C9A66B]/40 rounded-sm px-3 py-1.5 bg-white w-max">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-[#8C7A5B] hover:text-[#183629] transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="mx-4 text-[13px] font-semibold font-sans w-5 text-center text-[#183629]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-[#8C7A5B] hover:text-[#183629] transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-serif font-medium text-lg text-[#C9A66B] tracking-wide">
                              PKR {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="pt-8">
                  <Link
                    href="/fragrance"
                    className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8C7A5B] hover:text-[#183629] transition-colors font-semibold"
                  >
                    <span>&larr; Discover more fragrances</span>
                  </Link>
                </div>
              </div>

              {/* Order Summary in PremiumCard */}
              <div className="lg:col-span-4 sticky top-28">
                <PremiumCard
                  elevation="elevated"
                  hoverLift={false}
                  className="bg-white border border-[#C9A66B]/20 p-8 sm:p-9 shadow-soft-md"
                >
                  <h2 className="font-serif text-2xl text-[#183629] mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-5 mb-8 text-[13px] font-sans">
                    <div className="flex justify-between text-[#8C7A5B]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#29251D]">
                        PKR {cartTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#8C7A5B]">
                      <span>Shipping & Packaging</span>
                      <span className="text-[#C9A66B] font-semibold uppercase tracking-wider text-[12px]">
                        Complimentary
                      </span>
                    </div>

                    <div className="pt-5 border-t border-[#C9A66B]/30 flex justify-between items-baseline">
                      <span className="font-serif text-lg text-[#183629]">Estimated Total</span>
                      <span className="font-serif text-2xl font-bold text-[#C9A66B] tracking-wide">
                        PKR {cartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-3 tracking-[0.2em] text-[12px] py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-md"
                  >
                   PROCEED TO CHECKOUT 
                    
                  </Button>

                  <div className="mt-6 pt-6 border-t border-[#C9A66B]/20 flex items-center justify-center gap-2 text-[12px] uppercase tracking-wider text-[#8C7A5B] font-sans text-center">
                    <ShieldCheck size={16} className="text-[#C9A66B]" />
                    <span>Complimentary signature presentation box</span>
                  </div>
                </PremiumCard>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="py-28 text-center max-w-md mx-auto bg-white border border-[#C9A66B]/20 rounded-sm shadow-soft-md px-6">
              <div className="w-16 h-16 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingBag size={28} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-3xl text-[#183629] mb-4">Your Bag is Empty</h2>
              <p className="text-[14px] text-[#8C7A5B] font-sans mb-10 leading-relaxed">
                Explore our artisanal repertoire and find a signature composition that speaks to your era.
              </p>
              <Button
                href="/fragrance"
                className="tracking-[0.2em] text-[12px] px-10 py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors shadow-sm"
              >
                EXPLORE COLLECTION
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}