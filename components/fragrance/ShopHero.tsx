'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface SignatureEditionPill {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

interface ShopHeroProps {
  signatureEditions: SignatureEditionPill[];
  activeCategory?: string;
}

export default function ShopHero({ signatureEditions, activeCategory }: ShopHeroProps) {
  const router = useRouter();

  const handlePillClick = (slug: string) => {
    if (activeCategory === slug) {
      router.push('/fragrance', { scroll: false });
    } else {
      router.push(`/fragrance?category=${encodeURIComponent(slug)}`, { scroll: false });
    }
  };

  return (
    <section className="relative w-full bg-brand-white pt-32 pb-12 px-6 md:px-14 border-b border-brand-black/5 overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-green/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Breadcrumb / Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-black/10 bg-brand-offwhite text-[12px] font-sans tracking-[0.25em] uppercase text-brand-charcoal mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
          The Fragrance House
        </motion.div>

        {/* Centered Editorial Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-brand-black tracking-tight mb-4"
        >
          The Fragrance Collection
        </motion.h1>

        {/* Sophisticated Body Text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs sm:text-sm text-brand-muted font-sans max-w-xl mx-auto leading-relaxed mb-10 tracking-wide"
        >
          Explore our artisanal repertoire of hand-formulated perfumes, masterfully blended with high-concentration oils for transcendent sillage and all-day projection.
        </motion.p>

        {/* Dynamic Minimal Signature Cards / Pills */}
        {signatureEditions && signatureEditions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {signatureEditions.map((edition) => {
              const isSelected = activeCategory?.toLowerCase() === edition.slug.toLowerCase();
              const defaultImg = '/images/default-perfume.jpg';
              const thumbnail = edition.image || defaultImg;

              return (
                <button
                  key={edition.id}
                  type="button"
                  onClick={() => handlePillClick(edition.slug)}
                  className={`group inline-flex items-center gap-3 px-3.5 py-2 rounded-full border transition-all duration-300 cursor-pointer shadow-soft-sm hover:shadow-soft-md ${
                    isSelected
                      ? 'bg-brand-black text-brand-white border-brand-black shadow-soft-md'
                      : 'bg-brand-white text-brand-charcoal border-brand-black/10 hover:border-brand-green hover:text-brand-green hover:bg-brand-offwhite'
                  }`}
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-brand-black/10 bg-brand-offwhite">
                    <Image
                      src={thumbnail}
                      alt={edition.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="28px"
                    />
                  </div>
                  <span className="text-[11px] font-sans tracking-wider uppercase font-medium pr-1">
                    {edition.name}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

