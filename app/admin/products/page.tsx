'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/lib/validators';
import {
  Plus, Pencil, Trash2, X, Package, Loader2, ChevronDown,
  Search, ChevronLeft, ChevronRight, Images,
} from 'lucide-react';
import Image from 'next/image';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

interface CategoryOption {
  id: number;
  name: string;
  department?: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: string;
  stockQuantity: number;
  categoryId: number;
  imageURL: string | null;
  images: string | null;
  department: string;
  topNote: string | null;
  heartNote: string | null;
  baseNote: string | null;
  ingredients: string | null;
  isSpecialEdition: boolean;
  specialEditionType: string | null;
  gender: string;
  category: { id: number; name: string; department?: string };
}

// ─── Form field helpers ─────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all';

// ─── Product Form Modal ─────────────────────────────────────────────────────
interface ProductFormModalProps {
  product?: Product;
  categories: CategoryOption[];
  onClose: () => void;
  onSuccess: () => void;
}

function ProductFormModal({ product, categories, onClose, onSuccess }: ProductFormModalProps) {
  const [serverError, setServerError] = useState('');

  // Parse existing multi-image array or fallback to single imageURL
  const [images, setImages] = useState<string[]>(() => {
    if (product?.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return product?.imageURL ? [product.imageURL] : [];
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      brand: product?.brand ?? '',
      description: product?.description ?? '',
      price: product?.price?.toString() ?? '',
      stockQuantity: product?.stockQuantity?.toString() ?? '0',
      categoryId: product?.categoryId?.toString() ?? '',
      department: (product?.department as 'Fragrance' | 'Leather' | 'Essentials') ?? 'Fragrance',
      imageURL: product?.imageURL ?? '',
      topNote: product?.topNote ?? '',
      heartNote: product?.heartNote ?? '',
      baseNote: product?.baseNote ?? '',
      ingredients: product?.ingredients ?? '',
      isSpecialEdition: product?.isSpecialEdition ?? false,
      specialEditionType: product?.specialEditionType ?? '',
      gender: (product?.gender as 'Men' | 'Women' | 'Unisex') ?? 'Unisex',
    },
  });

  const isSpecialEdition = watch('isSpecialEdition');
  const selectedDepartment = watch('department');

  // Filter categories to only those belonging to the chosen department
  const filteredCategories = categories.filter((c) => {
    if (!c.department) return true;
    return c.department === selectedDepartment;
  });

  const onSubmit = async (data: ProductFormValues) => {
    setServerError('');
    const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
    const method = product ? 'PATCH' : 'POST';

    const payload = {
      ...data,
      images,
      imageURL: images[0] || data.imageURL || '',
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const json = await res.json();
      if (typeof json.error === 'object') {
        setServerError(Object.values(json.error).flat().join(' '));
      } else {
        setServerError(json.error ?? 'Something went wrong');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs overflow-y-auto py-6 sm:py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-600 rounded-lg">
              {serverError}
            </div>
          )}

          {/* Section: Basic Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Name" error={errors.name?.message} className="sm:col-span-2">
                <input {...register('name')} placeholder="e.g. Imperial Bifold Wallet" className={inputCls} />
              </Field>
              <Field label="Brand" error={errors.brand?.message}>
                <input {...register('brand')} placeholder="e.g. Gul's Collection" className={inputCls} />
              </Field>

              {/* Department Selector */}
              <Field label="Product Line / Department" error={errors.department?.message}>
                <div className="relative">
                  <select {...register('department')} className={`${inputCls} appearance-none pr-10 bg-white`}>
                    <option value="Fragrance">Fragrance</option>
                    <option value="Leather">Leather</option>
                    <option value="Essentials">Essentials</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              {/* Dynamic Category Selector */}
              <Field label="Category" error={errors.categoryId?.message}>
                <div className="relative">
                  <select {...register('categoryId')} className={`${inputCls} appearance-none pr-10 bg-white`}>
                    <option value="">Select a category</option>
                    {(filteredCategories.length > 0 ? filteredCategories : categories).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Target Demographic / Gender" error={errors.gender?.message}>
                <div className="relative">
                  <select {...register('gender')} className={`${inputCls} appearance-none pr-10 bg-white`}>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Price (PKR)" error={errors.price?.message}>
                <input {...register('price')} type="number" step="0.01" min="0" placeholder="2500" className={inputCls} />
              </Field>
              <Field label="Stock Quantity" error={errors.stockQuantity?.message}>
                <input {...register('stockQuantity')} type="number" min="0" placeholder="50" className={inputCls} />
              </Field>
              <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Detailed description of craftsmanship, texture, notes or materials…"
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </div>

          {/* Section: Multiple Images Upload */}
          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Product Pictures (Multiple Supported)
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Upload multiple angles and product perspectives. You can set any image as the primary catalog cover photo.
            </p>
            <MultiImageUpload
              values={images}
              onChange={(newImages) => {
                setImages(newImages);
                setValue('imageURL', newImages[0] || '');
              }}
            />
          </div>

          {/* Section: Formula, Scent Notes or Materials */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {selectedDepartment === 'Fragrance' 
                ? 'Olfactory Pyramid & Ingredients' 
                : 'Specifications, Materials & Scent (Optional)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Top Note / Key Feature" error={errors.topNote?.message}>
                <input {...register('topNote')} placeholder={selectedDepartment === 'Fragrance' ? 'e.g. Bergamot' : 'e.g. Full-Grain Cowhide'} className={inputCls} />
              </Field>
              <Field label="Heart Note / Hardware" error={errors.heartNote?.message}>
                <input {...register('heartNote')} placeholder={selectedDepartment === 'Fragrance' ? 'e.g. Rose, Cinnamon' : 'e.g. Solid Brass Zippers'} className={inputCls} />
              </Field>
              <Field label="Base Note / Dimensions" error={errors.baseNote?.message}>
                <input {...register('baseNote')} placeholder={selectedDepartment === 'Fragrance' ? 'e.g. Amber, Oud' : 'e.g. 11.5cm x 9.5cm'} className={inputCls} />
              </Field>
              <Field label="Ingredients & Materials" error={errors.ingredients?.message} className="sm:col-span-3">
                <textarea
                  {...register('ingredients')}
                  rows={2}
                  placeholder="Material composition, care instructions, or fragrance ingredients…"
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </div>

          {/* Section: Special Edition */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Special Edition</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isSpecialEdition"
                {...register('isSpecialEdition')}
                className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] border-gray-300"
              />
              <label htmlFor="isSpecialEdition" className="text-sm text-gray-700 cursor-pointer font-medium">
                Mark as Special Edition
              </label>
            </div>
            {isSpecialEdition && (
              <Field label="Special Edition Type" error={errors.specialEditionType?.message} className="mt-3">
                <input
                  {...register('specialEditionType')}
                  placeholder="e.g. Limited Run, Anniversary"
                  className={inputCls}
                />
              </Field>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Saving…</>
              ) : (
                product ? 'Save Changes' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Products Page ──────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Server-Side Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatus, setStockStatus] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'Fragrance' | 'Leather' | 'Essentials'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  const [, startTransition] = useTransition();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load category options once for dropdown
  useEffect(() => {
    fetch('/api/admin/categories?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Failed to load category dropdown options:', err));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
        department: departmentFilter,
        categoryId: selectedCategory,
        stockStatus: stockStatus,
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 10 });
    } catch {
      setError('Could not load products. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, departmentFilter, selectedCategory, stockStatus]);

  useEffect(() => {
    startTransition(() => {
      fetchData();
    });
  }, [fetchData]);

  const openCreate = () => { setEditingProduct(undefined); setShowModal(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const handleSuccess = () => { closeModal(); fetchData(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteTarget(null);
      fetchData();
    } else {
      const json = await res.json();
      setDeleteError(json.error ?? 'Delete failed');
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package size={22} />
              Products
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your fragrance catalogue at enterprise scale.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-xs"
          >
            <Plus size={16} /> New Product
          </button>
        </div>

        {deleteError && (
          <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg">
            {deleteError}
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search product by name, brand or note…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37] w-full sm:w-auto"
            >
              <option value="all">All Departments</option>
              <option value="Fragrance">Fragrance</option>
              <option value="Leather">Leather</option>
              <option value="Essentials">Essentials</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37] w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((c) => departmentFilter === 'all' || !c.department || c.department === departmentFilter)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37] w-full sm:w-auto"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="low_stock">Low Stock (≤ 10)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Showing {products.length} of {pagination.total} products
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center py-12 text-sm text-red-500">{error}</p>
          ) : products.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm font-medium">No products found.</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search criteria or add a product.</p>
              <button onClick={openCreate} className="mt-4 text-sm text-black underline font-medium">
                Add your first product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Product</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Department</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Category</th>
                    <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Price</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Stock</th>
                    <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => {
                    const parsedImages: string[] = (() => {
                      if (p.images) {
                        try {
                          const parsed = JSON.parse(p.images);
                          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                        } catch {}
                      }
                      return p.imageURL ? [p.imageURL] : [];
                    })();

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.imageURL ? (
                              <div className="w-10 h-10 relative rounded-md overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                                <Image src={p.imageURL} alt={p.name} fill className="object-cover" unoptimized />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 text-gray-400">
                                <Package size={16} />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {p.name}
                                {p.isSpecialEdition && (
                                  <span className="text-[12px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                    Special
                                  </span>
                                )}
                                {parsedImages.length > 1 && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200" title={`${parsedImages.length} images`}>
                                    <Images size={11} />
                                    {parsedImages.length}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{p.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              p.department === 'Leather'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : p.department === 'Essentials'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {p.department || 'Fragrance'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{p.category?.name || 'Uncategorized'}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          PKR {parseFloat(p.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              p.stockQuantity === 0
                                ? 'bg-red-50 text-red-700 border border-red-200/60'
                                : p.stockQuantity <= 10
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-green-50 text-green-700 border border-green-200/60'
                            }`}
                          >
                            {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} in stock`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => { setDeleteError(''); setDeleteTarget(p); }}
                              className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-xs text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the product. This action cannot be undone."
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
