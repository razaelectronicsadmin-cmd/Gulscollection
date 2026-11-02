'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, ArrowRight, 
  Truck, ShieldCheck, Gift, Headphones 
} from 'lucide-react';

interface Slide {
  id: number;
  tagline: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    tagline: 'SCENTS • STYLE • ESSENTIALS',
    title: "Gul's",
    subtitle: 'COLLECTION',
    buttonText: 'SHOP NOW',
    buttonLink: '/fragrance',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 2,
    tagline: 'HANDCRAFTED FULL-GRAIN LUXURY',
    title: 'Leather',
    subtitle: 'ATELIER',
    buttonText: 'EXPLORE LEATHER',
    buttonLink: '/fragrance?department=Leather',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 3,
    tagline: 'SOY CANDLES & HOME DIFFUSERS',
    title: 'The Essentials',
    subtitle: 'SANCTUARY',
    buttonText: 'EXPLORE ESSENTIALS',
    buttonLink: '/fragrance?department=Essentials',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1600&auto=format&fit=crop',
  },
];

const categoryCards = [
  {
    id: 'fragrance',
    title: 'Fragrance',
    subtitle: 'PREMIUM SCENTS FOR EVERY MOOD',
    buttonText: 'EXPLORE FRAGRANCES',
    link: '/fragrance?department=Fragrance',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=900&auto=format&fit=crop',
    alt: 'Luxury Fragrance Collection',
  },
  {
    id: 'leather',
    title: 'Leather',
    subtitle: 'CLASSIC. DURABLE. TIMELESS.',
    buttonText: 'EXPLORE LEATHER',
    link: '/fragrance?department=Leather',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=900&auto=format&fit=crop',
    alt: 'Artisan Leather Goods',
  },
  {
    id: 'essentials',
    title: 'Essentials',
    subtitle: 'EVERYDAY ITEMS FOR A BETTER YOU',
    buttonText: 'EXPLORE ESSENTIALS',
    link: '/fragrance?department=Essentials',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=900&auto=format&fit=crop',
    alt: 'Luxury Home & Lifestyle Essentials',
  },
];

const trustBadges = [
  { icon: Truck, title: 'Fast Delivery', subtitle: 'All Over Pakistan' },
  { icon: ShieldCheck, title: 'Secure Payment', subtitle: '100% Safe & Secure' },
  { icon: Gift, title: 'Premium Quality', subtitle: 'Original Products' },
  { icon: Headphones, title: 'Customer Support', subtitle: "We're Here to Help" },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const activeSlide = slides[currentSlide];

  return (
    <section className="w-full bg-[#fbfbfa] text-brand-black flex flex-col">
      
      {/* ─── VIEWPORT 1: FULL SCREEN HERO SLIDER (With Navbar) ────────────── */}
      {/* Deducts exact Navbar + Announcement height (44px+91px=135px on mobile, 48px+91px=139px on desktop) */}
      <div className="relative w-full h-[calc(100vh-135px)] md:h-[calc(100vh-139px)] min-h-[480px] bg-[#0c0f0e] overflow-hidden flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              priority
              className="object-cover object-center md:object-[70%_center] opacity-50 md:opacity-65"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f0e] via-[#0c0f0e]/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f0e] via-transparent to-[#0c0f0e]/40 z-10" />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-[#C9A66B]/30 hover:border-[#C9A66B] text-[#F3E9D7] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs active:scale-95"
        >
          <ChevronLeft size={22} className="text-[#C9A66B]" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-[#C9A66B]/30 hover:border-[#C9A66B] text-[#F3E9D7] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs active:scale-95"
        >
          <ChevronRight size={22} className="text-[#C9A66B]" />
        </button>

        {/* Slide Text Content */}
        <div className="max-w-[1400px] mx-auto w-full px-12 sm:px-16 md:px-24 relative z-20">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-xl text-left"
          >
            <div className="mb-4 md:mb-6">
              <span className="font-serif italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#C9A66B] tracking-wide block leading-none">
                {activeSlide.title}
              </span>
              <span className="font-sans text-sm sm:text-base md:text-lg tracking-[0.4em] uppercase text-[#F3E9D7]/90 font-medium block mt-3">
                {activeSlide.subtitle}
              </span>
            </div>

            <p className="font-sans text-xs sm:text-sm md:text-base tracking-[0.25em] text-[#C9A66B] font-semibold uppercase mb-8 md:mb-10">
              {activeSlide.tagline}
            </p>

            <div>
              <Link
                href={activeSlide.buttonLink}
                className="inline-flex items-center gap-3 px-8 py-4 border border-[#C9A66B] text-[#F3E9D7] hover:bg-[#C9A66B] hover:text-[#0c0f0e] transition-all duration-300 text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold rounded-xs shadow-lg group cursor-pointer"
              >
                <span>{activeSlide.buttonText}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators (Dots) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index 
                  ? 'w-8 bg-[#C9A66B]' 
                  : 'w-2 bg-[#F3E9D7]/40 hover:bg-[#F3E9D7]/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ─── VIEWPORT 2: THREE DEPARTMENT CARDS & TRUST BADGES ────────────── */}
      <div className="w-full min-h-screen flex flex-col justify-between bg-[#fbfbfa]">
        
        {/* Three Department Showcase Cards */}
        <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 md:px-14 py-12 md:py-16 my-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {categoryCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group bg-[#F4F1EA] rounded-sm overflow-hidden border border-brand-black/5 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e8e4dc]">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F4F1EA] via-transparent to-transparent opacity-85" />
                </div>

                {/* Card Text & Button */}
                <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
                  <h3 className="font-serif text-2xl sm:text-3xl text-brand-black font-normal tracking-wide mb-2">
                    {card.title}
                  </h3>
                  <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#8C7A5B] font-semibold mb-6">
                    {card.subtitle}
                  </p>

                  <Link
                    href={card.link}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#111] hover:bg-[#183629] text-white text-[11px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 rounded-xs group/btn cursor-pointer shadow-sm"
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Value Proposition & Trust Badges Bar */}
        <div className="w-full border-t border-b border-brand-black/10 bg-white py-8 md:py-10 px-6 md:px-14">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.title} 
                  className={`flex items-center gap-4 ${
                    idx < trustBadges.length - 1 ? 'lg:border-r lg:border-brand-black/10' : ''
                  } pr-2`}
                >
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#F4F1EA] flex items-center justify-center shrink-0 border border-[#C9A66B]/25">
                    <Icon size={22} className="text-[#C9A66B]" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs sm:text-sm text-brand-black tracking-wide">
                      {badge.title}
                    </h4>
                    <p className="font-sans text-[11px] sm:text-xs text-[#8C7A5B] mt-0.5">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}