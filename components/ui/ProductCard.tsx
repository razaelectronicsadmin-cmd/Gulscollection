'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle2, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  categoryName: string;
  name: string;
  target: string;
  description: string;
  imageSrc: string;
  productId: number;
  price?: number; // Added for Cart functionality
  discountedPrice?: number | null;
  promoBadge?: string | null;
  deliveryBadge?: string | null;
  stockQuantity?: number;
}

export function ProductCard({ 
  categoryName, 
  name, 
  target, 
  description, 
  imageSrc, 
  productId,
  price = 0, // Default fallback
  discountedPrice,
  promoBadge,
  deliveryBadge,
  stockQuantity
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = stockQuantity !== undefined && stockQuantity <= 0;
  const effectivePrice = discountedPrice && discountedPrice < price ? discountedPrice : price;

  const handleCartAction = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent the click from bubbling up to the <Link> component
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      router.push(`/product/${productId}`);
      return;
    }

    if (!isAdded) {
      addToCart(productId.toString(), 1, {
        name: name,
        price: effectivePrice,
        image: imageSrc,
      });
      setIsAdded(true);
    } else {
      router.push('/cart');
    }
  };

  return (
    <Link href={`/product/${productId}`} className="group block w-full h-[470px] shadow-soft-md hover:shadow-soft-xl transition-all duration-300 relative rounded-sm overflow-hidden border border-[#C9A66B]/20">

      {/* Top Half: Cream/Gold Background */}
      <div className="relative h-[53%] w-full bg-gradient-to-b from-[#F3E9D7] to-[#E3CFA8] border-b border-[#C9A66B] overflow-hidden pt-4">
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 z-20 bg-[#183629]/95 text-[#F3E9D7] text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 rounded-sm shadow-md border border-[#C9A66B]/30">
            Out of Stock
          </div>
        ) : promoBadge ? (
          <div className="absolute top-3 left-3 z-20 bg-[#C9A66B] text-[#183629] text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 rounded-sm shadow-md">
            {promoBadge}
          </div>
        ) : null}

        {deliveryBadge && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs text-[#183629] text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border border-[#C9A66B]/30 flex items-center gap-1 shadow-xs">
            <Truck size={11} className="text-[#C9A66B]" />
            <span>{deliveryBadge}</span>
          </div>
        )}

        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain object-bottom drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Bottom Half: Dark Green Background */}
      <div className="relative h-[47%] w-full bg-[#183629] p-5 flex flex-col justify-between text-left">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C9A66B] mb-1 font-semibold">
            {categoryName}
          </p>
          <h3 className="font-serif text-[22px] font-bold text-[#F3E9D7] tracking-wide mb-1 leading-tight group-hover:text-[#C9A66B] transition-colors line-clamp-1 pr-10">
            {name}
          </h3>
          <p className="font-sans text-[11px] italic text-[#D8C6A5] mb-2 line-clamp-1">
            {target}
          </p>
          <p className="font-sans text-[12px] leading-relaxed text-[#F3E9D7]/80 line-clamp-2 pr-10">
            {description}
          </p>
        </div>

        {/* Pricing Display */}
        <div className="pt-2 flex items-baseline gap-2">
          {discountedPrice && discountedPrice < price ? (
            <>
              <span className="font-serif text-[17px] font-bold text-[#C9A66B]">
                PKR {discountedPrice.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#F3E9D7]/50 line-through">
                PKR {price.toLocaleString()}
              </span>
            </>
          ) : price > 0 ? (
            <span className="font-serif text-[17px] font-bold text-[#C9A66B]">
              PKR {price.toLocaleString()}
            </span>
          ) : null}
        </div>

        {/* Floating Cart Icon (Bottom Right) */}
        <div 
          role="button"
          tabIndex={0}
          onClick={handleCartAction}
          onKeyDown={(e) => e.key === 'Enter' && handleCartAction(e)}
          className={`absolute bottom-5 right-5 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors overflow-hidden z-10 ${
            isOutOfStock 
              ? 'bg-gray-400/80 text-gray-200 cursor-not-allowed opacity-60' 
              : 'bg-[#C9A66B] hover:bg-[#b08e54] text-[#183629] cursor-pointer active:scale-95'
          }`}
          aria-label={isOutOfStock ? "Out of Stock" : isAdded ? "View Cart" : "Add to Cart"}
          title={isOutOfStock ? "Out of Stock" : undefined}
        >
          <AnimatePresence mode="wait">
            {!isAdded ? (
              <motion.div
                key="add"
                initial={{ y: -25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 25, opacity: 0 }}
                transition={{ type: "tween", duration: 0.25 }}
                className="absolute flex items-center justify-center w-full h-full"
              >
                <ShoppingBag size={18} className="text-[#183629] ml-[-1px]" />
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ y: -25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 25, opacity: 0 }}
                transition={{ type: "tween", duration: 0.25 }}
                className="absolute flex items-center justify-center w-full h-full"
              >
                <CheckCircle2 size={20} className="text-[#183629]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </Link>
  );
}
