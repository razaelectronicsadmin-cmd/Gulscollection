import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import PremiumCard from '@/components/ui/PremiumCard';
import { ArrowUpRight } from 'lucide-react';

export default async function AllCollections() {
  // Fetch ALL active categories from the database
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      isSignatureEdition: true,
    },
  });

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full bg-brand-light py-28 md:py-36 px-6 border-t border-brand-black/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-[12px] md:text-[11px] font-sans uppercase tracking-[0.3em] text-brand-muted mb-3 inline-block">
            Our Fragrance Houses
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-black tracking-tight">
            Explore All Collections
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-brand-muted tracking-wide max-w-md mx-auto">
            Browse our full repertoire of curated fragrance collections, created for distinction.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat) => {
            const fallbackImage = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop';
            const catImage = cat.image || fallbackImage;

            return (
              <div key={cat.id} className="h-full">
                <Link href={`/fragrance?collection=${encodeURIComponent(cat.slug)}`} className="group block h-full">
                  <PremiumCard
                    elevation="elevated"
                    hoverLift={true}
                    className="h-full flex flex-col justify-between overflow-hidden relative min-h-[340px] md:min-h-[380px]"
                  >
                    {/* Background Image with Zoom Effect */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={catImage}
                        alt={cat.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                    </div>

                    {/* Top Pill & Arrow */}
                    <div className="relative z-10 p-6 flex items-center justify-between">
                      {cat.isSignatureEdition ? (
                        <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-white bg-brand-green/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                          Signature Edition
                        </span>
                      ) : (
                        <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-white/80 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                          Collection
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-brand-green group-hover:text-white transition-all">
                        <ArrowUpRight size={14} />
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative z-10 p-6">
                      <h3 className="font-serif text-2xl text-white mb-2">
                        {cat.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] font-medium text-white/90 group-hover:text-brand-gold-light transition-colors">
                        <span>View Fragrances</span>
                        <span className="h-[1px] w-6 bg-white/50 group-hover:w-10 group-hover:bg-brand-gold-light transition-all" />
                      </div>
                    </div>
                  </PremiumCard>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

