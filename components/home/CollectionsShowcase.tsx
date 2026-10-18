import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import prisma from '@/lib/prisma'; // Apne prisma client ka correct path yahan dein

export default async function CollectionsShowcase() {
  // Database se 4 Active Signature Categories aur unke products fetch karna
  const categories = await prisma.category.findMany({
    where: { 
      isActive: true,
      // isSignatureEdition: true 
    },
    include: {
      products: true,
    },
    take: 4, 
  });

  return (
    <section className="relative w-full py-24 bg-brand-offwhite overflow-hidden">
      
     {/* Background Pattern Overlay - Debugging Mode */}
      <div 
        className="absolute inset-0 z-0 opacity-75 pointer-events-none" /* Opacity 50% ki hai check karne ke liye */
        style={{ 
          backgroundImage: "url('/images/pattern-1.png')", /* Extension wapas .png ki hai */
          backgroundRepeat: 'repeat',
          backgroundSize: '300px'
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* --- Top Section: 4 Editions Cards --- */}
        <div className="text-center mb-12">
          <p className="font-sans text-[16px] tracking-[0.25em] text-[#C9A66B] uppercase font-bold mb-3">Our Collection</p>
          <h2 className="font-serif text-[32px] md:text-[40px] font-bold text-[#C9A66B] uppercase leading-tight">Edition One To Four <br /> Crafted With Distinction</h2>
          <p className="font-sans text-[14px] tracking-[0.1em] text-[#8C7A5B] uppercase">Curated Masterpieces</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl mx-auto mb-32">
          {categories.map((category) => (
            <Link 
              href={`#category-${category.id}`} 
              key={category.id} 
              className="relative aspect-square shadow-soft-md w-full border border-[#D8C6A5]/30 block hover:-translate-y-2 transition-transform duration-300"
            >
              <Image 
                src={category.image || '/images/masculine-energy.png'} 
                alt={category.name} 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-300" />
            </Link>
          ))}
        </div>

        {/* --- Signature Fragrances Main Header --- */}
        <div className="text-center w-full mb-16">
          <p className="font-sans text-[16px] tracking-[0.25em] text-[#C9A66B] uppercase font-bold mb-3">Collection</p>
          <h2 className="font-serif text-[36px] md:text-[45px] font-bold text-[#C9A66B] uppercase mb-2">Signature Fragrances</h2>
          <p className="font-serif italic text-[16px] text-[#29251D] font-medium">Decades by Gul&apos;s</p>
        </div>

        {/* --- Dynamic Products Sections by Category --- */}
        {categories.map((category) => (
          <div key={category.id} id={`category-${category.id}`} className="w-full max-w-6xl mx-auto mb-20 scroll-mt-24">
            <div className="border-b border-[#D8C6A5]/50 pb-2 mb-8 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
              <h3 className="font-serif text-[24px] font-bold text-[#C9A66B] uppercase">{category.name}</h3>
              <span className="font-sans text-[12px] tracking-[0.1em] text-[#8C7A5B] uppercase mb-1">
                {category.slug.replace(/-/g, ' ')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.products.length > 0 ? (
                category.products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    productId={product.id}
                    categoryName={category.name}
                    name={product.name}
                    target={product.gender}
                    description={product.description}
                    imageSrc={product.imageURL || '/images/genx-bottle.png'} 
                  />
                ))
              ) : (
                <p className="text-[#8C7A5B] font-sans text-sm italic col-span-full">No products found in this edition yet.</p>
              )}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}