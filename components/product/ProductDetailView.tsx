'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Minus, Plus, ChevronDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface FormattedProduct {
  id: string | number;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryTitle: string;
  topNote?: string | null;
  heartNote?: string | null;
  baseNote?: string | null;
  ingredients?: string | null;
  isSpecialEdition?: boolean;
  specialEditionType?: string | null;
}

export default function ProductDetailView({ product }: { product: FormattedProduct | null }) {
  const router = useRouter();
  const { addToCart } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('notes');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Fallback state is handled by the parent page component (ProductDetailsPage), 
  // but keeping a safety check here just in case.
  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product.id.toString(), quantity, {
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setIsAddedToCart(true);
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="w-full bg-[#F7F7F5] pb-20 pt-8 px-6 md:px-14 max-w-7xl mx-auto">
      {/* Back Button & Breadcrumbs */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-[#8C7A5B] hover:text-[#183629] transition-colors text-[12px] uppercase tracking-[0.2em] font-bold cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Collection</span>
        </button>

        <nav className="hidden md:flex items-center space-x-3 text-[12px] uppercase tracking-[0.2em] font-medium text-[#8C7A5B]">
          <Link href="/" className="hover:text-[#183629] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/fragrance" className="hover:text-[#183629] transition-colors">Fragrance</Link>
          <span>/</span>
          <span className="text-[#C9A66B] font-semibold">{product.name}</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left: Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2"
        >
          <div className="relative aspect-[4/5] w-full bg-white shadow-soft-elevated rounded-sm overflow-hidden border border-[#C9A66B]/20">
            {product.isSpecialEdition && (
              <div className="absolute top-6 right-6 z-20 bg-[#183629] text-[#F3E9D7] text-[12px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-sm shadow-md border border-[#C9A66B]/30">
                {product.specialEditionType ? `${product.specialEditionType} Special Edition` : 'Special Edition'}
              </div>
            )}
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-contain object-center scale-95"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </motion.div>

        {/* Right: Product Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full lg:w-1/2 flex flex-col pt-2 lg:pt-8"
        >
          {/* Header Info */}
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#8C7A5B] mb-3">
            {product.categoryTitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#183629] font-bold tracking-wide uppercase mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="text-2xl font-serif text-[#C9A66B] mb-8 font-medium">
            PKR {product.price.toLocaleString()}
          </p>

          <p className="text-[15px] font-sans text-[#29251D]/80 leading-relaxed mb-10 pr-0 lg:pr-8">
            {product.description}
          </p>

          {/* Quantity & Add to Cart/View Cart Area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12 overflow-hidden">
            <div className="flex items-center justify-between border border-[#C9A66B]/40 rounded-sm w-full sm:w-1/3 px-5 py-3 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-[#8C7A5B] hover:text-[#183629] transition-colors p-1 cursor-pointer"
                aria-label="Decrease quantity"
                disabled={isAddedToCart}
              >
                <Minus size={16} />
              </button>
              <span className="text-[14px] font-medium text-[#183629]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-[#8C7A5B] hover:text-[#183629] transition-colors p-1 cursor-pointer"
                aria-label="Increase quantity"
                disabled={isAddedToCart}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 relative w-full h-[52px]"> {/* Fixed height container for smooth sliding */}
              <AnimatePresence initial={false} mode="wait">
                {!isAddedToCart ? (
                  <motion.div
                    key="add-btn"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Button
                      onClick={handleAddToCart}
                      className="w-full h-full flex items-center justify-center space-x-3 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors tracking-[0.15em] text-[12px] rounded-sm shadow-md"
                    >
                      <ShoppingBag size={16} />
                      <span>ADD TO CART — PKR {(product.price * quantity).toLocaleString()}</span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-btn"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Button
                      onClick={handleViewCart}
                      className="w-full h-full flex items-center justify-center space-x-3 bg-[#C9A66B] text-[#183629] hover:bg-[#b08e54] transition-colors tracking-[0.15em] text-[12px] rounded-sm shadow-md"
                    >
                      <CheckCircle2 size={16} />
                      <span>VIEW CART</span>
                      <ArrowRight size={14} />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Accordions */}
          <div className="border-t border-[#C9A66B]/30">
            
            {/* Fragrance Notes */}
            {(product.topNote || product.heartNote || product.baseNote) && (
              <div className="border-b border-[#C9A66B]/30">
                <button
                  onClick={() => toggleAccordion('notes')}
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                >
                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#183629] group-hover:text-[#C9A66B] transition-colors">
                    Fragrance Notes
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'text-[#8C7A5B] transition-transform duration-300',
                      activeAccordion === 'notes' ? 'rotate-180 text-[#C9A66B]' : ''
                    )}
                  />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'notes' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pt-2 space-y-5">
                        {product.topNote && (
                          <div>
                            <p className="text-[12px] uppercase tracking-[0.2em] text-[#C9A66B] font-bold mb-1.5">Top Notes</p>
                            <p className="text-[13px] font-sans text-[#29251D]">{product.topNote}</p>
                          </div>
                        )}
                        {product.heartNote && (
                          <div>
                            <p className="text-[12px] uppercase tracking-[0.2em] text-[#C9A66B] font-bold mb-1.5">Heart Notes</p>
                            <p className="text-[13px] font-sans text-[#29251D]">{product.heartNote}</p>
                          </div>
                        )}
                        {product.baseNote && (
                          <div>
                            <p className="text-[12px] uppercase tracking-[0.2em] text-[#C9A66B] font-bold mb-1.5">Base Notes</p>
                            <p className="text-[13px] font-sans text-[#29251D]">{product.baseNote}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && (
              <div className="border-b border-[#C9A66B]/30">
                <button
                  onClick={() => toggleAccordion('ingredients')}
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                >
                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#183629] group-hover:text-[#C9A66B] transition-colors">
                    Ingredients
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'text-[#8C7A5B] transition-transform duration-300',
                      activeAccordion === 'ingredients' ? 'rotate-180 text-[#C9A66B]' : ''
                    )}
                  />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'ingredients' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pt-2">
                        <p className="text-[13px] font-sans text-[#29251D]/80 leading-relaxed">
                          {product.ingredients}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Shipping */}
            <div className="border-b border-[#C9A66B]/30">
              <button
                onClick={() => toggleAccordion('delivery')}
                className="w-full py-5 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#183629] group-hover:text-[#C9A66B] transition-colors">
                  Shipping & Returns
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-[#8C7A5B] transition-transform duration-300',
                    activeAccordion === 'delivery' ? 'rotate-180 text-[#C9A66B]' : ''
                  )}
                />
              </button>
              <AnimatePresence>
                {activeAccordion === 'delivery' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pt-2">
                      <p className="text-[13px] font-sans text-[#29251D]/80 leading-relaxed">
                        Same-day and next-day delivery available exclusively across Karachi[cite: 27]. Due to the personal nature of fragrances, we currently do not accept returns once the packaging has been opened.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}