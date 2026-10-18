'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  categoryName: string;
  name: string;
  target: string;
  description: string;
  imageSrc: string;
  productId: number;
  price?: number; // Added for Cart functionality
}

export function ProductCard({ 
  categoryName, 
  name, 
  target, 
  description, 
  imageSrc, 
  productId,
  price = 0 // Default fallback
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleCartAction = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent the click from bubbling up to the <Link> component
    e.preventDefault();
    e.stopPropagation();

    if (!isAdded) {
      addToCart(productId.toString(), 1, {
        name: name,
        price: price,
        image: imageSrc,
      });
      setIsAdded(true);
    } else {
      router.push('/cart');
    }
  };

  return (
    <Link href={`/product/${productId}`} className="group block w-full h-[460px] shadow-soft-md hover:shadow-soft-xl transition-all duration-300 relative">

      {/* Top Half: Cream/Gold Background */}
      <div className="relative h-[55%] w-full bg-gradient-to-b from-[#F3E9D7] to-[#E3CFA8] border-b border-[#C9A66B] overflow-hidden pt-4">
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
      <div className="relative h-[45%] w-full bg-[#183629] p-6 flex flex-col justify-start text-left">
        <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-[#C9A66B] mb-2 font-semibold">
          {categoryName}
        </p>
        <h3 className="font-serif text-[24px] font-bold text-[#F3E9D7] tracking-wide mb-1 leading-tight group-hover:text-[#C9A66B] transition-colors pr-10">
          {name}
        </h3>
        <p className="font-sans text-[12px] italic text-[#D8C6A5] mb-3">
          {target}
        </p>
        <p className="font-sans text-[13px] leading-relaxed text-[#F3E9D7]/80 line-clamp-3 pr-10">
          {description}
        </p>

        {/* Floating Cart Icon (Bottom Right) */}
        <div 
          role="button"
          tabIndex={0}
          onClick={handleCartAction}
          onKeyDown={(e) => e.key === 'Enter' && handleCartAction(e)}
          className="absolute bottom-6 right-6 w-11 h-11 rounded-full bg-[#C9A66B] flex items-center justify-center shadow-lg hover:bg-[#b08e54] transition-colors cursor-pointer overflow-hidden z-10"
          aria-label={isAdded ? "View Cart" : "Add to Cart"}
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