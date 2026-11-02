import prisma from '@/lib/prisma';
import { products as hardcodedProducts, collections as hardcodedCollections } from '@/lib/data';
import ProductDetailView, { FormattedProduct } from '@/components/product/ProductDetailView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { id } = await params;
  let formattedProduct: FormattedProduct | null = null;
  let categoryId: number | undefined = undefined;

  // Helper to parse images
  const parseImages = (imagesJson: string | null, fallback: string | null) => {
    if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
      } catch {}
    }
    return fallback ? [fallback] : [];
  };

  const now = new Date();
  const [deliverySetting, activePromotions] = await Promise.all([
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

  // 1. Try fetching by numeric ID from database
  const numericId = parseInt(id);
  if (!isNaN(numericId)) {
    const dbProduct = await prisma.product.findUnique({
      where: { id: numericId },
      include: { category: true },
    });

    if (dbProduct) {
      categoryId = dbProduct.categoryId;
      const parsedImgs = parseImages(dbProduct.images, dbProduct.imageURL);
      formattedProduct = {
        id: dbProduct.id,
        name: dbProduct.name,
        brand: dbProduct.brand,
        description: dbProduct.description,
        price: Number(dbProduct.price),
        image: parsedImgs[0] || dbProduct.imageURL || '/images/placeholder-image.jpg',
        images: parsedImgs,
        department: dbProduct.department || 'Fragrance',
        stockQuantity: dbProduct.stockQuantity,
        category: dbProduct.category.slug,
        categoryTitle: dbProduct.category.name,
        topNote: dbProduct.topNote,
        heartNote: dbProduct.heartNote,
        baseNote: dbProduct.baseNote,
        ingredients: dbProduct.ingredients,
        isSpecialEdition: dbProduct.isSpecialEdition,
        specialEditionType: dbProduct.specialEditionType,
      };
    }
  }

  // 2. Fallback to matching hardcoded item or slug
  if (!formattedProduct) {
    // Check if ID matches name or slug in DB
    const dbProductByName = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { equals: id } },
          { name: { contains: id.replace(/-/g, ' ') } },
        ],
      },
      include: { category: true },
    });

    if (dbProductByName) {
      categoryId = dbProductByName.categoryId;
      const parsedImgs = parseImages(dbProductByName.images, dbProductByName.imageURL);
      formattedProduct = {
        id: dbProductByName.id,
        name: dbProductByName.name,
        brand: dbProductByName.brand,
        description: dbProductByName.description,
        price: Number(dbProductByName.price),
        image: parsedImgs[0] || dbProductByName.imageURL || '/images/placeholder-image.jpg',
        images: parsedImgs,
        department: dbProductByName.department || 'Fragrance',
        stockQuantity: dbProductByName.stockQuantity,
        category: dbProductByName.category.slug,
        categoryTitle: dbProductByName.category.name,
        topNote: dbProductByName.topNote,
        heartNote: dbProductByName.heartNote,
        baseNote: dbProductByName.baseNote,
        ingredients: dbProductByName.ingredients,
        isSpecialEdition: dbProductByName.isSpecialEdition,
        specialEditionType: dbProductByName.specialEditionType,
      };
    } else {
      // Check hardcoded data
      const hardcoded = hardcodedProducts.find((p) => p.id === id);
      if (hardcoded) {
        const coll = hardcodedCollections.find((c) => c.id === hardcoded.category);
        formattedProduct = {
          id: hardcoded.id,
          name: hardcoded.name,
          brand: hardcoded.brand,
          description: hardcoded.description,
          price: hardcoded.price,
          image: hardcoded.image,
          images: [hardcoded.image],
          department: 'Fragrance',
          stockQuantity: 25,
          category: hardcoded.category,
          categoryTitle: coll ? coll.title : hardcoded.category,
          topNote: hardcoded.topNote,
          heartNote: hardcoded.heartNote,
          baseNote: hardcoded.baseNote,
          ingredients: hardcoded.ingredients,
          isSpecialEdition: hardcoded.isSpecialEdition,
          specialEditionType: hardcoded.specialEditionType || null,
        };
      }
    }
  }

  // Calculate dynamic promotions and delivery settings for product
  if (formattedProduct) {
    const originalPrice = formattedProduct.price;
    const pId = typeof formattedProduct.id === 'number' ? formattedProduct.id : undefined;

    const matchedPromo = activePromotions.find((promo) => {
      if (pId !== undefined && promo.targetType === 'PRODUCT') return promo.targetId === pId;
      if (categoryId !== undefined && promo.targetType === 'CATEGORY') return promo.targetId === categoryId;
      if (promo.targetType === 'STOREWIDE') return true;
      return false;
    });

    if (matchedPromo) {
      const discountVal = Number(matchedPromo.discountValue);
      let discountedPrice = originalPrice;
      let badge = '';
      if (matchedPromo.discountType === 'PERCENTAGE') {
        discountedPrice = Math.round(originalPrice * (1 - discountVal / 100));
        badge = `${discountVal}% OFF`;
      } else if (matchedPromo.discountType === 'FIXED') {
        discountedPrice = Math.max(0, originalPrice - discountVal);
        badge = `PKR ${discountVal} OFF`;
      } else if (matchedPromo.discountType === 'FREE_SHIPPING') {
        badge = 'FREE SHIPPING';
      }
      formattedProduct.promotion = {
        title: matchedPromo.name,
        discountType: matchedPromo.discountType,
        discountValue: discountVal,
        discountedPrice,
        badge,
      };
    }

    if (deliverySetting) {
      let cities: string[] = [];
      if (deliverySetting.cityRules) {
        try {
          const rules = JSON.parse(deliverySetting.cityRules);
          if (Array.isArray(rules)) {
            cities = rules
              .filter((r: { city?: string; isFree?: boolean; fee?: number }) => r.isFree || Number(r.fee) === 0)
              .map((r: { city: string }) => r.city);
          }
        } catch {
          cities = ['Karachi'];
        }
      }
      formattedProduct.deliveryInfo = {
        standardDeliveryFee: Number(deliverySetting.standardFee),
        freeDeliveryMin: Number(deliverySetting.freeDeliveryMin),
        isFreeDeliveryActive: deliverySetting.isFreeDeliveryActive,
        freeDeliveryCities: cities,
      };
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#29251D] selection:bg-[#C9A66B]/30 selection:text-[#183629]">
      <Navbar />
      
      <div className="flex-grow pt-[90px]">
        {formattedProduct ? (
          <ProductDetailView key={formattedProduct.id} product={formattedProduct} />
        ) : (
          /* --- Luxury Empty State (Not Found) --- */
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center mb-6 shadow-md font-serif text-3xl">
              !
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#183629] mb-4">
              Fragrance Not Found
            </h1>
            <p className="font-sans text-[14px] text-[#8C7A5B] max-w-md mx-auto mb-8 leading-relaxed">
              We couldn&apos;t find the specific fragrance you&apos;re looking for. It may have been archived or the link might be incorrect.
            </p>
            <Link 
              href="/fragrance"
              className="inline-block tracking-[0.2em] text-[11px] px-8 py-4 bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors uppercase font-semibold shadow-sm"
            >
              Return to Collection
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}