'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search, X, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';
import PremiumSelect, { SelectOption } from '@/components/ui/PremiumSelect';

export interface CatalogProduct {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  discountedPrice?: number | null;
  promoBadge?: string | null;
  deliveryBadge?: string | null;
  stockQuantity: number;
  imageURL: string | null;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
    department?: string;
  };
  topNote: string | null;
  heartNote: string | null;
  baseNote: string | null;
  gender?: string | null;
  department?: string | null;
  isSpecialEdition: boolean;
  specialEditionType: string | null;
}

export interface ShowcaseCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  isActive: boolean;
  department?: string;
}

interface FragranceCatalogProps {
  products: CatalogProduct[];
  categories: ShowcaseCategory[];
  allCategories?: ShowcaseCategory[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  selectedCollection: string;
  selectedGender?: string;
  selectedDepartment?: string;
  searchQuery: string;
  sortBy: string;
}

const GENDER_OPTIONS: SelectOption[] = [
  { value: 'All', label: 'All Genders' },
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Unisex', label: 'Unisex' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'Featured', label: 'Featured' },
  { value: 'Newest', label: 'Newest' },
  { value: 'Price: Low to High', label: 'Price: Low to High' },
  { value: 'Price: High to Low', label: 'Price: High to Low' },
];

export default function FragranceCatalog({
  products,
  categories,
  totalProducts,
  totalPages,
  currentPage,
  selectedCollection,
  selectedGender = '',
  selectedDepartment = 'Fragrance',
  searchQuery: initialSearch,
  sortBy: initialSort,
}: FragranceCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);

  // Build category options for PremiumSelect based on the active department
  const categoryOptions: SelectOption[] = [
    { 
      value: 'All', 
      label: selectedDepartment === 'Leather' 
        ? 'All Leather Categories' 
        : selectedDepartment === 'Essentials' 
        ? 'All Essentials Categories' 
        : 'All Fragrance Categories' 
    },
    ...categories.map((c) => ({
      value: c.slug,
      label: c.name,
    })),
  ];

  // Update URL helper without hard page reloads
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'All') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // Debounced search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== initialSearch) {
        updateQueryParams({ q: search || null, page: '1' });
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [search, initialSearch, updateQueryParams]);

  const handleCategoryChange = (val: string) => {
    updateQueryParams({ collection: val === 'All' ? null : val, page: '1' });
  };

  const handleGenderChange = (val: string) => {
    updateQueryParams({ gender: val === 'All' ? null : val, page: '1' });
  };

  const handleSortChange = (val: string) => {
    updateQueryParams({ sort: val === 'Featured' ? null : val, page: '1' });
  };

  const handleDepartmentChange = (dept: string) => {
    updateQueryParams({ 
      department: dept, 
      collection: null, 
      category: null, 
      page: '1' 
    });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage.toString() });
    const grid = document.getElementById('catalog-products-top');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCollection);
  const activeCollectionName = selectedCategoryObj ? selectedCategoryObj.name : null;
  const hasActiveFilters = Boolean(
    (selectedCollection && selectedCollection !== 'All') ||
    (selectedGender && selectedGender !== 'All') ||
    search ||
    (initialSort && initialSort !== 'Featured')
  );

  const DEPARTMENT_TABS = [
    { id: 'Fragrance', label: 'Fragrances' },
    { id: 'Leather', label: 'Leather Goods' },
    { id: 'Essentials', label: 'Essentials' },
    { id: 'All', label: 'All Items' },
  ];

  return (
    <section id="catalog-products-top" className="py-12 px-4 sm:px-6 md:px-12 lg:px-16 max-w-7xl mx-auto w-full">
      {/* ─── Department Navigation Tabs ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
        {DEPARTMENT_TABS.map((tab) => {
          const isActive = (selectedDepartment || 'Fragrance') === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleDepartmentChange(tab.id)}
              className={`px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 rounded-xs cursor-pointer border ${
                isActive
                  ? 'bg-[#183629] text-[#F3E9D7] border-[#183629] shadow-soft-sm'
                  : 'bg-white text-[#8C7A5B] border-[#C9A66B]/25 hover:border-[#183629] hover:text-[#183629]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Premium Filter Bar ────────────────────────────────────────── */}
      <div className="bg-white p-5 md:p-6 rounded-sm shadow-soft-md border border-[#C9A66B]/20 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A5B] pointer-events-none" size={15} />
            <input
              type="text"
              placeholder="Search by name, category, brand, details…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#C9A66B]/30 rounded-sm py-2.5 pl-10 pr-9 text-[13px] text-[#29251D] placeholder-[#8C7A5B] focus:outline-none focus:border-[#C9A66B] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A5B] hover:text-[#183629] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div className="md:col-span-2">
            <PremiumSelect
              options={GENDER_OPTIONS}
              value={selectedGender || 'All'}
              onChange={handleGenderChange}
              placeholder="Gender"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <PremiumSelect
              options={categoryOptions}
              value={selectedCollection || 'All'}
              onChange={handleCategoryChange}
              placeholder="Collection"
            />
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <PremiumSelect
              options={SORT_OPTIONS}
              value={initialSort || 'Featured'}
              onChange={handleSortChange}
              placeholder="Sort By"
            />
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-[#C9A66B]/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#8C7A5B] font-semibold font-sans">
                Filters:
              </span>

              {activeCollectionName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#183629] text-[11px] text-[#F3E9D7] font-sans">
                  <span>{activeCollectionName}</span>
                  <button type="button" onClick={() => handleCategoryChange('All')} className="hover:text-[#C9A66B] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedGender && selectedGender !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#183629] text-[11px] text-[#F3E9D7] font-sans">
                  <span>{selectedGender}</span>
                  <button type="button" onClick={() => handleGenderChange('All')} className="hover:text-[#C9A66B] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#183629] text-[11px] text-[#F3E9D7] font-sans">
                  <span>&ldquo;{search}&rdquo;</span>
                  <button type="button" onClick={() => setSearch('')} className="hover:text-[#C9A66B] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] font-medium text-[#183629] hover:text-[#C9A66B] uppercase tracking-widest cursor-pointer inline-flex items-center gap-1 transition-colors"
            >
              <X size={13} /> Reset All
            </button>
          </div>
        )}
      </div>

      {/* ─── Result Counter & Headline ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#C9A66B]/30">
        <div>
          <h2 className="font-serif text-3xl md:text-[36px] text-[#C9A66B] font-bold uppercase tracking-wide">
            {activeCollectionName || (selectedGender && selectedGender !== 'All' ? `${selectedGender} Fragrances` : 'All Fragrances')}
          </h2>
          <p className="text-[#8C7A5B] text-xs font-sans tracking-[0.1em] uppercase mt-2">
            Showing {products.length} of {totalProducts} creations
            {isPending && <span className="ml-2 text-[#C9A66B] font-medium animate-pulse">Filtering…</span>}
          </p>
        </div>
      </div>

      {/* ─── The Product Grid (TS Error Fixed) ─────────────────────────── */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <div key={product.id} className="h-full">
              {/* ProductCard Props Mapped Directly To Fix TS2322 */}
              <ProductCard
                productId={product.id}
                categoryName={product.category.name}
                name={product.name}
                price={Number(product.price)}
                discountedPrice={product.discountedPrice}
                promoBadge={product.promoBadge}
                deliveryBadge={product.deliveryBadge}
                stockQuantity={product.stockQuantity}
                target={product.gender || 'Unisex'}
                description={product.description || 'A timeless fragrance crafted for elegance and presence.'}
                imageSrc={product.imageURL || '/images/hassan-gul-bottle.png'}
              />
            </div>
          ))}
        </div>
      ) : (
        /* ─── Beautiful Empty State ───────────────────────────────────── */
        <div className="text-center py-24 sm:py-32 px-6 bg-white rounded-md border border-[#C9A66B]/20 shadow-soft-md max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#183629] flex items-center justify-center mx-auto mb-6 text-[#C9A66B]">
            <Sparkles size={24} />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#29251D] mb-3">
            No Fragrances Found
          </h3>
          <p className="text-[14px] text-[#8C7A5B] leading-relaxed font-sans mb-8 max-w-md mx-auto">
            No fragrances found matching your current criteria. Try adjusting your filters or exploring another collection.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-8 py-3.5 bg-[#183629] text-[#F3E9D7] text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#11261d] hover:text-[#C9A66B] transition-colors cursor-pointer shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ─── Server-Side Pagination Bar ───────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-16 pt-8 border-t border-[#C9A66B]/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <span className="text-[11px] text-[#8C7A5B] tracking-widest uppercase">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isPending}
              className="p-2 border border-[#C9A66B]/30 text-[#183629] rounded-sm hover:border-[#C9A66B] hover:text-[#C9A66B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => handlePageChange(pg)}
                disabled={isPending}
                className={`w-9 h-9 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#183629] text-[#C9A66B] border border-[#183629]'
                    : 'border border-[#C9A66B]/30 text-[#29251D] hover:border-[#C9A66B] hover:text-[#C9A66B]'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isPending}
              className="p-2 border border-[#C9A66B]/30 text-[#183629] rounded-sm hover:border-[#C9A66B] hover:text-[#C9A66B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}