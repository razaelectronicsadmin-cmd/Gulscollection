'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Minus, Plus, ChevronDown, ArrowLeft, ArrowRight, CheckCircle2, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface DeliveryInfo {
  standardDeliveryFee: number;
  freeDeliveryMin: number;
  isFreeDeliveryActive: boolean;
  freeDeliveryCities: string[];
}

export interface PromoInfo {
  title?: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  discountedPrice: number;
  badge: string;
}

export interface FormattedProduct {
  id: string | number;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  department?: string;
  stockQuantity?: number;
  category: string;
  categoryTitle: string;
  topNote?: string | null;
  heartNote?: string | null;
  baseNote?: string | null;
  ingredients?: string | null;
  isSpecialEdition?: boolean;
  specialEditionType?: string | null;
  promotion?: PromoInfo | null;
  deliveryInfo?: DeliveryInfo | null;
}

export default function ProductDetailView({ product }: { product: FormattedProduct | null }) {
  const router = useRouter();
  const { addToCart } = useStore();

  const galleryImages = (product?.images && product.images.length > 0)
    ? product.images
    : product?.image
    ? [product.image]
    : [];

  const [activeImage, setActiveImage] = useState(galleryImages[0] || product?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('notes');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Fallback state is handled by the parent page component (ProductDetailsPage), 
  // but keeping a safety check here just in case.
  if (!product) return null;

  const currentDisplayImage = activeImage || product.image;
  const effectivePrice = product.promotion?.discountedPrice && product.promotion.discountedPrice < product.price
    ? product.promotion.discountedPrice
    : product.price;

  const handleAddToCart = () => {
    addToCart(product.id.toString(), quantity, {
      name: product.name,
      price: effectivePrice,
      image: currentDisplayImage,
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
          <Link
            href={`/fragrance?department=${encodeURIComponent(product.department || 'Fragrance')}`}
            className="hover:text-[#183629] transition-colors"
          >
            {product.department || 'Fragrance'}
          </Link>
          <span>/</span>
          <span className="text-[#C9A66B] font-semibold">{product.name}</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left: Product Images & Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 flex flex-col"
        >
          <div className="relative aspect-[4/5] w-full bg-transparent rounded-sm overflow-hidden border border-[#C9A66B]/25">
            {/* Promotional Discount Badge */}
            {product.promotion && (
              <div className="absolute top-6 left-6 z-20 bg-[#C9A66B] text-[#183629] text-[11px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-sm shadow-md">
                {product.promotion.badge}
              </div>
            )}
            {product.isSpecialEdition && (
              <div className="absolute top-6 right-6 z-20 bg-[#183629] text-[#F3E9D7] text-[12px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-sm shadow-md border border-[#C9A66B]/30">
                {product.specialEditionType ? `${product.specialEditionType} Special Edition` : 'Special Edition'}
              </div>
            )}
            <Image
              src={currentDisplayImage}
              alt={product.name}
              fill
              priority
              className="object-contain object-center scale-95 transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Multiple Pictures Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative w-20 h-20 rounded-md overflow-hidden bg-transparent shrink-0 border transition-all cursor-pointer",
                    currentDisplayImage === img
                      ? "border-[#183629] ring-2 ring-[#183629]/30 shadow-xs"
                      : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                  )}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
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
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-serif text-[#183629] font-bold tracking-wide uppercase leading-tight">
              {product.name}
            </h1>
            {product.stockQuantity !== undefined && product.stockQuantity <= 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                Out of Stock
              </span>
            )}
          </div>

          {/* Dynamic Pricing with Promotions */}
          {product.promotion ? (
            <div className="flex flex-wrap items-baseline gap-3 mb-6">
              <span className="text-3xl font-serif text-[#C9A66B] font-bold">
                PKR {effectivePrice.toLocaleString()}
              </span>
              <span className="text-lg font-serif text-gray-400 line-through">
                PKR {product.price.toLocaleString()}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#C9A66B]/15 text-[#8C7A5B] border border-[#C9A66B]/30">
                {product.promotion.badge}
              </span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Save PKR {(product.price - effectivePrice).toLocaleString()}
              </span>
            </div>
          ) : (
            <p className="text-2xl font-serif text-[#C9A66B] mb-6 font-medium">
              PKR {product.price.toLocaleString()}
            </p>
          )}

          <p className="text-[15px] font-sans text-[#29251D]/80 leading-relaxed mb-6 pr-0 lg:pr-8">
            {product.description}
          </p>

          {/* Low Stock Warning */}
          {product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <p className="text-xs text-amber-700 font-medium mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200/60 rounded px-3 py-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Only {product.stockQuantity} item(s) left in stock — order soon.
            </p>
          )}

          {/* Quantity & Add to Cart/View Cart Area */}
          {product.stockQuantity !== undefined && product.stockQuantity <= 0 ? (
            <div className="mb-8">
              <div className="w-full h-[52px] flex items-center justify-center space-x-3 bg-gray-100 text-gray-500 font-semibold tracking-[0.15em] text-[12px] uppercase rounded-sm border border-gray-200 cursor-not-allowed">
                <span>Currently Out of Stock</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This item is temporarily unavailable. Check back soon or contact customer support for restock updates.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 overflow-hidden">
              <div className="flex items-center justify-between border border-[#C9A66B]/40 rounded-sm w-full sm:w-1/3 px-5 py-3 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#8C7A5B] hover:text-[#183629] transition-colors p-1 cursor-pointer disabled:opacity-40"
                  aria-label="Decrease quantity"
                  disabled={isAddedToCart || quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="text-[14px] font-medium text-[#183629]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity ?? 99, quantity + 1))}
                  className="text-[#8C7A5B] hover:text-[#183629] transition-colors p-1 cursor-pointer disabled:opacity-40"
                  aria-label="Increase quantity"
                  disabled={isAddedToCart || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
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
                        <span>ADD TO CART — PKR {(effectivePrice * quantity).toLocaleString()}</span>
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
          )}

          {/* Dynamic Delivery & Guarantees Highlight Box */}
          <div className="mb-10 p-4 rounded-sm bg-white border border-[#C9A66B]/25 shadow-xs space-y-3 font-sans">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#183629]/10 text-[#183629] flex items-center justify-center shrink-0 mt-0.5">
                <Truck size={17} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#183629] uppercase tracking-wider text-[11px]">
                  {product.deliveryInfo?.isFreeDeliveryActive && effectivePrice >= (product.deliveryInfo?.freeDeliveryMin ?? 5000) ? (
                    <span className="text-emerald-800 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                      FREE Express Delivery Eligible
                    </span>
                  ) : (
                    <span>Nationwide Standard & Express Delivery</span>
                  )}
                </div>
                <p className="text-[#8C7A5B] mt-0.5 leading-relaxed">
                  {product.deliveryInfo?.isFreeDeliveryActive ? (
                    effectivePrice >= product.deliveryInfo.freeDeliveryMin ? (
                      `This product qualifies for FREE delivery (free above PKR ${product.deliveryInfo.freeDeliveryMin.toLocaleString()}).`
                    ) : (
                      `Standard delivery: PKR ${product.deliveryInfo.standardDeliveryFee}. Add PKR ${(product.deliveryInfo.freeDeliveryMin - effectivePrice).toLocaleString()} more to your bag for FREE delivery.`
                    )
                  ) : (
                    `Standard delivery charges: PKR ${product.deliveryInfo?.standardDeliveryFee ?? 200}.`
                  )}
                  {product.deliveryInfo?.freeDeliveryCities && product.deliveryInfo.freeDeliveryCities.length > 0 && (
                    <span className="block mt-0.5 text-[#183629] font-medium">
                      Complimentary local shipping in {product.deliveryInfo.freeDeliveryCities.join(', ')}.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="border-t border-[#C9A66B]/15 pt-2.5 flex flex-wrap items-center justify-between text-[11px] text-[#8C7A5B] gap-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#C9A66B]" /> 100% Authentic Handcrafted
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#C9A66B]" /> Nationwide Dispatch within 24–48h
              </span>
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
                    <div className="pb-6 pt-2 space-y-2 text-[13px] font-sans text-[#29251D]/80 leading-relaxed">
                      <p>
                        <strong>Standard Shipping:</strong> Flat rate of PKR {product.deliveryInfo?.standardDeliveryFee ?? 200} across all cities of Pakistan.
                      </p>
                      {product.deliveryInfo?.isFreeDeliveryActive && (
                        <p>
                          <strong>Free Shipping:</strong> Automatically applied at checkout on all orders exceeding PKR {product.deliveryInfo.freeDeliveryMin.toLocaleString()}{product.deliveryInfo.freeDeliveryCities && product.deliveryInfo.freeDeliveryCities.length > 0 ? ` or orders delivering within ${product.deliveryInfo.freeDeliveryCities.join(', ')}.` : '.'}
                        </p>
                      )}
                      <p className="text-xs text-[#8C7A5B] pt-1">
                        Due to the artisanal luxury nature of our collections, unsealed fragrances cannot be returned, but damaged or defective shipments are promptly exchanged within 7 days.
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