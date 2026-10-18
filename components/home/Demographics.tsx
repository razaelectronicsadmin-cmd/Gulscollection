'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import PremiumCard from '@/components/ui/PremiumCard';
import { ArrowUpRight } from 'lucide-react';

interface Demographic {
  title: string;
  subtitle: string;
  categorySlug: string;
  image: string;
  description: string;
}

const DEMOGRAPHICS: Demographic[] = [
  {
    title: 'Men',
    subtitle: 'Masculine Presence',
    categorySlug: 'men',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
    description: 'Crisp woods, rich spices, and amber foundations crafted for command.',
  },
  {
    title: 'Women',
    subtitle: 'Feminine Allure',
    categorySlug: 'women',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop',
    description: 'Sensual florals, luscious fruits, and velvety gourmand trails.',
  },
  {
    title: 'Unisex',
    subtitle: 'Fluid Harmony',
    categorySlug: 'unisex',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    description: 'Transcendent compositions balanced for skin chemistry beyond boundaries.',
  },
];

export default function Demographics() {
  return (
    <section className="relative w-full bg-brand-white py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[12px] md:text-[11px] font-sans uppercase tracking-[0.3em] text-brand-muted mb-3 inline-block"
          >
            Curated For You
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-black tracking-tight"
          >
            Distinct Olfactory Identities
          </motion.h2>
        </div>

        {/* 3 Tall Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEMOGRAPHICS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className="h-full"
            >
              <Link href={`/fragrance?gender=${encodeURIComponent(item.title)}`} className="group block h-full">
                <PremiumCard
                  elevation="elevated"
                  hoverLift={true}
                  className="h-full flex flex-col justify-between overflow-hidden relative min-h-[460px] md:min-h-[500px]"
                >
                  {/* Background Image Container with Zoom Effect */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* Layered Gradient for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
                  </div>

                  {/* Top Demographic Header */}
                  <div className="relative z-10 p-8 flex items-center justify-between">
                    <span className="text-[12px] font-sans uppercase tracking-[0.25em] text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {item.subtitle}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-brand-green group-hover:text-white transition-all">
                      <ArrowUpRight size={15} />
                    </div>
                  </div>

                  {/* Bottom Text & CTA */}
                  <div className="relative z-10 p-8">
                    <h3 className="font-serif text-3xl sm:text-4xl text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/80 font-sans leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-medium text-white group-hover:text-brand-gold-light transition-colors">
                      <span>Explore Collection</span>
                      <span className="h-[1px] w-6 bg-white/50 group-hover:w-10 group-hover:bg-brand-gold-light transition-all" />
                    </div>
                  </div>
                </PremiumCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

