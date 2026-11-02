import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopHero from '@/components/fragrance/ShopHero';
import FragranceCatalog, { CatalogProduct } from '@/components/fragrance/FragranceCatalog';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface FragrancePageProps {
  searchParams: Promise<{
    collection?: string;
    category?: string;
    department?: string;
    gender?: string;
    search?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function FragrancePage({ searchParams }: FragrancePageProps) {
  const resolvedParams = await searchParams;
  const collection = resolvedParams.collection || resolvedParams.category || '';
  const department = resolvedParams.department || '';
  const gender = resolvedParams.gender || '';
  const search = resolvedParams.q || resolvedParams.search || '';
  const sort = resolvedParams.sort || 'Featured';
  const page = Math.max(1, parseInt(resolvedParams.page || '1') || 1);
  const pageSize = 12;

  // 1. Fetch all active categories from database with department
  const rawCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      isActive: true,
      isSignatureEdition: true,
      department: true,
    },
  });

  // Effective department: default to Fragrance if none or blank
  const activeDepartment = department || 'Fragrance';

  // Determine pills for ShopHero based on active department
  let heroPills = rawCategories.filter((c) => {
    if (activeDepartment === 'All') return true;
    if (activeDepartment === 'Fragrance') {
      return c.department === 'Fragrance' && (c.isSignatureEdition || !c.slug.includes('men'));
    }
    return c.department === activeDepartment;
  });

  if (heroPills.length === 0) {
    heroPills = rawCategories.filter((c) => c.department === activeDepartment);
  }

  // 2. Build where filter for Products (Department, Category, Gender, Search)
  const where: Prisma.ProductWhereInput = {};

  if (activeDepartment && activeDepartment !== 'All') {
    where.department = activeDepartment;
  }

  if (collection && collection !== 'All') {
    const matchedCategory = rawCategories.find(
      (c) => c.slug.toLowerCase() === collection.toLowerCase()
    );
    if (matchedCategory) {
      where.categoryId = matchedCategory.id;
    }
  }

  if (gender && gender !== 'All') {
    where.gender = gender;
  }

  if (search.trim()) {
    where.OR = [
      { name: { contains: search.trim() } },
      { brand: { contains: search.trim() } },
      { description: { contains: search.trim() } },
      { topNote: { contains: search.trim() } },
      { heartNote: { contains: search.trim() } },
      { baseNote: { contains: search.trim() } },
    ];
  }

  // 3. Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { id: 'desc' };
  if (sort === 'Price: Low to High') {
    orderBy = { price: 'asc' };
  } else if (sort === 'Price: High to Low') {
    orderBy = { price: 'desc' };
  } else if (sort === 'Newest') {
    orderBy = { id: 'desc' };
  } else if (sort === 'Featured') {
    orderBy = { id: 'asc' };
  }

  // 4. Server-Side Data Fetching
  const now = new Date();
  const [totalCount, rawProducts, deliverySetting, activePromotions] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            department: true,
          },
        },
      },
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

  // Format products with dynamic promotional discounts and delivery tags
  const products: CatalogProduct[] = rawProducts.map((p) => {
    const originalPrice = Number(p.price);

    // Check if active promotion applies to this product or category
    const matchedPromo = activePromotions.find((promo) => {
      if (promo.targetType === 'PRODUCT') return promo.targetId === p.id;
      if (promo.targetType === 'CATEGORY') return promo.targetId === p.categoryId;
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

    // Dynamic Delivery Badge directly from Admin delivery settings
    let deliveryBadge: string | null = null;
    if (deliverySetting?.isFreeDeliveryActive) {
      if (originalPrice >= Number(deliverySetting.freeDeliveryMin)) {
        deliveryBadge = 'Free Delivery';
      } else {
        const minK = Math.round(Number(deliverySetting.freeDeliveryMin) / 1000);
        deliveryBadge = `Free Over ${minK}k`;
      }
    }

    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      description: p.description,
      price: originalPrice,
      discountedPrice,
      promoBadge,
      deliveryBadge,
      stockQuantity: p.stockQuantity,
      imageURL: p.imageURL,
      categoryId: p.categoryId,
      category: p.category,
      topNote: p.topNote,
      heartNote: p.heartNote,
      baseNote: p.baseNote,
      isSpecialEdition: p.isSpecialEdition,
      specialEditionType: p.specialEditionType,
      gender: p.gender,
      department: p.department,
    };
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Filter categories shown in catalog dropdown by active department
  const filteredCategoriesForCatalog = activeDepartment === 'All'
    ? rawCategories
    : rawCategories.filter((c) => c.department === activeDepartment);

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] selection:bg-[#C9A66B]/30 selection:text-[#183629]">
      <Navbar />

      {/* Sleek Native Shop Hero with Minimal Department Pills */}
      <ShopHero 
        signatureEditions={heroPills} 
        activeCategory={collection} 
        department={activeDepartment}
      />

      {/* Interactive Catalog Component */}
      <Suspense 
        fallback={
          <div className="min-h-[400px] flex items-center justify-center text-[#C9A66B] font-sans text-sm uppercase tracking-widest font-medium">
            Loading collections...
          </div>
        }
      >
        <FragranceCatalog
          products={products}
          categories={filteredCategoriesForCatalog}
          allCategories={rawCategories}
          totalProducts={totalCount}
          totalPages={totalPages}
          currentPage={page}
          selectedCollection={collection}
          selectedGender={gender}
          selectedDepartment={activeDepartment}
          searchQuery={search}
          sortBy={sort}
        />
      </Suspense>

      <Footer />
    </main>
  );
}