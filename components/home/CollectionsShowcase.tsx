import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import prisma from '@/lib/prisma'; // Apne prisma client ka correct path yahan dein

export default async function CollectionsShowcase() {
  const now = new Date();

  // Database se Active Categories, DeliverySettings, aur Promotions fetch karna
  const [categories, deliverySetting, activePromotions] = await Promise.all([
    prisma.category.findMany({
      where: { 
        isActive: true,
      },
      include: {
        products: true,
      },
      take: 4, 
    }),
    prisma.deliverySetting.findUnique({ where: { id: 1 } }),
    prisma.promotionalDiscount.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
        ],
      },
    }),
  ]);

  // PDF se extract ki gayi Editions ki premium information
  const editionsData = [
    { title: "Edition One", subtitle: "Masculine Energy", target: "For The Modern Gentleman" },
    { title: "Edition Two", subtitle: "Pour Elle", target: "For Her" },
    { title: "Edition Three", subtitle: "N°01_For All", target: "Unisex" },
    { title: "Edition Four", subtitle: "Arabesques", target: "The Oud Collection" }
  ];

  return (
    <section className="relative w-full py-24 bg-brand-offwhite overflow-hidden">
      
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-75 pointer-events-none"
        style={{ 
          backgroundImage: "url('/images/pattern-1.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '300px'
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* --- Top Section: Header --- */}
        <div className="text-center mb-16">
          <p className="font-sans text-[14px] tracking-[0.25em] text-[#C9A66B] uppercase font-bold mb-4">Our Collection</p>
          <h2 className="font-serif text-[32px] md:text-[40px] font-bold text-[#29251D] uppercase leading-tight mb-3">
            Edition One To Four <br /> <span className="text-[#C9A66B]">Crafted With Distinction</span>
          </h2>
          <p className="font-sans text-[13px] tracking-[0.15em] text-[#8C7A5B] uppercase">Curated Masterpieces</p>
        </div>

        {/* --- Premium Luxury Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-[1200px] mx-auto mb-32">
          {categories.map((category, index) => {
            const info = editionsData[index];
            return (
              <Link 
                href={`/fragrance?department=Fragrance&category=${category.slug}`}
                key={category.id} 
                className="group relative flex flex-col items-center justify-center p-8 min-h-[280px] overflow-hidden bg-gradient-to-b from-[#161410] to-[#0A0907] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Outer Gold Accent Border */}
                <div className="absolute inset-0 border border-[#C9A66B]/20 group-hover:border-[#C9A66B]/60 transition-colors duration-500" />
                
                {/* Inner Plaque Border (Perfume Label Effect) */}
                <div className="absolute inset-3 border border-[#D8C6A5]/10 group-hover:border-[#C9A66B]/30 transition-colors duration-500 pointer-events-none" />

                {/* Subtle Radial Glow on Hover */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,166,107,0.15)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-center text-center w-full">
                  <span className="flex items-center gap-3 font-sans text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase font-bold mb-5">
                    <span className="w-4 h-[1px] bg-[#C9A66B]/50"></span>
                    {info?.title || `Edition 0${index + 1}`}
                    <span className="w-4 h-[1px] bg-[#C9A66B]/50"></span>
                  </span>
                  
                  <h3 className="font-serif text-[22px] font-bold text-[#FDFBF7] uppercase mb-3 leading-snug group-hover:scale-105 transition-transform duration-500">
                    {info?.subtitle || category.name}
                  </h3>
                  
                  <p className="font-serif italic text-[13px] tracking-[0.05em] text-[#A6977D] mb-8">
                    {info?.target || 'Premium Collection'}
                  </p>
                  
                  {/* Minimalist Explore Button */}
                  <div className="mt-auto">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#D8C6A5] border-b border-transparent group-hover:border-[#C9A66B] group-hover:text-[#C9A66B] transition-all duration-300 pb-1">
                      EXPLORE EDITION
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* --- Signature Fragrances Main Header --- */}
        <div className="text-center w-full mb-16">
          <p className="font-sans text-[14px] tracking-[0.25em] text-[#C9A66B] uppercase font-bold mb-4">Collection</p>
          <h2 className="font-serif text-[36px] md:text-[45px] font-bold text-[#29251D] uppercase mb-3">Signature Fragrances</h2>
          <p className="font-serif italic text-[16px] text-[#8C7A5B] font-medium">Decades by Gul&apos;s</p>
        </div>

        {/* --- Dynamic Products Sections by Category --- */}
        {categories.map((category) => (
          <div key={category.id} id={`category-${category.id}`} className="w-full max-w-[1200px] mx-auto mb-24 scroll-mt-24">
            <div className="border-b border-[#D8C6A5]/50 pb-3 mb-10 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <h3 className="font-serif text-[28px] font-bold text-[#29251D] uppercase">{category.name}</h3>
              <span className="font-sans text-[12px] tracking-[0.2em] text-[#C9A66B] uppercase font-bold">
                / {category.slug.replace(/-/g, ' ')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.products.length > 0 ? (
                category.products.map((product) => {
                  const originalPrice = Number(product.price);

                  // Promo calculation
                  const matchedPromo = activePromotions.find((promo) => {
                    if (promo.targetType === 'PRODUCT') return promo.targetId === product.id;
                    if (promo.targetType === 'CATEGORY') return promo.targetId === product.categoryId;
                    if (promo.targetType === 'STOREWIDE') return true;
                    return false;
                  });

                  let discountedPrice: number | null = null;
                  let promoBadge: string | null = null;

                  if (matchedPromo) {
                    const discountVal = Number(matchedPromo.discountValue);
                    if (matchedPromo.discountType === 'PERCENTAGE') {
                      discountedPrice = Math.round(originalPrice * (1 - discountVal / 100));
                      promoBadge = `${discountVal}% OFF`;
                    } else if (matchedPromo.discountType === 'FIXED') {
                      discountedPrice = Math.max(0, originalPrice - discountVal);
                      promoBadge = `PKR ${discountVal} OFF`;
                    }
                  }

                  // Delivery badge calculation
                  let deliveryBadge: string | null = null;
                  if (deliverySetting?.isFreeDeliveryActive) {
                    if (originalPrice >= Number(deliverySetting.freeDeliveryMin)) {
                      deliveryBadge = 'Free Delivery';
                    } else {
                      const minK = Math.round(Number(deliverySetting.freeDeliveryMin) / 1000);
                      deliveryBadge = `Free Over ${minK}k`;
                    }
                  }

                  return (
                    <ProductCard 
                      key={product.id} 
                      productId={product.id}
                      categoryName={category.name}
                      name={product.name}
                      target={product.gender}
                      description={product.description}
                      imageSrc={product.imageURL || '/images/genx-bottle.png'} 
                      price={originalPrice}
                      discountedPrice={discountedPrice}
                      promoBadge={promoBadge}
                      deliveryBadge={deliveryBadge}
                      stockQuantity={product.stockQuantity}
                    />
                  );
                })
              ) : (
                <div className="col-span-full py-10 flex justify-center border border-[#D8C6A5]/30 bg-white/50">
                  <p className="text-[#8C7A5B] font-serif italic text-[15px]">Masterpieces for this edition are currently being crafted.</p>
                </div>
              )}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}