'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormValues } from '@/lib/validators';
import {
  Plus, Pencil, Trash2, X, Tag, Loader2, Search,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import Image from 'next/image';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUpload from '@/components/admin/ImageUpload';

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  department: string;
  _count: { products: number };
}

type ModalMode = 'create' | 'edit';

interface FormModalProps {
  mode: ModalMode;
  category?: Category;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryFormModal({ mode, category, onClose, onSuccess }: FormModalProps) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      image: category?.image ?? '',
      department: (category?.department as 'Fragrance' | 'Leather' | 'Essentials') ?? 'Fragrance',
      isActive: category?.isActive ?? true,
    },
  });

  const nameValue = useWatch({ control, name: 'name' }) ?? '';
  useEffect(() => {
    if (mode === 'create') {
      const generated = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [nameValue, mode, setValue]);

  const onSubmit = async (data: CategoryFormValues) => {
    setServerError('');
    const url =
      mode === 'edit' ? `/api/admin/categories/${category!.id}` : '/api/admin/categories';
    const method = mode === 'edit' ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const json = await res.json();
      if (typeof json.error === 'object') {
        const msgs = Object.values(json.error).flat().join(' ');
        setServerError(msgs);
      } else {
        setServerError(json.error ?? 'Something went wrong');
      }
    }
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    const errorMessages = Object.entries(fieldErrors)
      .map(([key, err]) => `${key}: ${err?.message || 'invalid'}`)
      .join(', ');
    setServerError(`Please fix form errors: ${errorMessages}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs overflow-y-auto py-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'New Category' : 'Edit Category'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 text-sm text-red-600 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              {...register('name')}
              placeholder="e.g. Masculine Energy"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Line / Department</label>
            <select
              {...register('department')}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all bg-white"
            >
              <option value="Fragrance">Fragrance</option>
              <option value="Leather">Leather</option>
              <option value="Essentials">Essentials</option>
            </select>
            {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              {...register('slug')}
              placeholder="e.g. masculine-energy"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all font-mono"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <ImageUpload value={field.value ?? ''} onChange={field.onChange} />
                  <input
                    type="text"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Or enter image URL or local path (/uploads/...)"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#d4af37] outline-none"
                  />
                  {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Active Status Switch */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Active (Visible on Homepage & Store)</span>
            </label>
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
                mode === 'create' ? 'Create Category' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Server-Side Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'Fragrance' | 'Leather' | 'Essentials'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  const [, startTransition] = useTransition();

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
        status: statusFilter,
        department: departmentFilter,
      });

      const res = await fetch(`/api/admin/categories?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCategories(data.categories || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 10 });
    } catch {
      setError('Could not load categories. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, departmentFilter]);

  useEffect(() => {
    startTransition(() => {
      fetchCategories();
    });
  }, [fetchCategories]);

  const openCreate = () => { setEditingCategory(undefined); setModalMode('create'); };
  const openEdit = (cat: Category) => { setEditingCategory(cat); setModalMode('edit'); };
  const closeModal = () => setModalMode(null);
  const handleSuccess = () => { closeModal(); fetchCategories(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteTarget(null);
      fetchCategories();
    } else {
      const json = await res.json();
      setDeleteError(json.error ?? 'Delete failed');
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag size={22} />
              Categories
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage product collections and showcase on storefront.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-xs"
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        {deleteError && (
          <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg">
            {deleteError}
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search category by name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                <option value="all">All Departments</option>
                <option value="Fragrance">Fragrance</option>
                <option value="Leather">Leather</option>
                <option value="Essentials">Essentials</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Showing {categories.length} of {pagination.total} categories
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center py-12 text-sm text-red-500">{error}</p>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm font-medium">No categories found.</p>
              <p className="text-gray-400 text-xs mt-1">Try refining your search or create a new category.</p>
              <button onClick={openCreate} className="mt-4 text-sm text-black underline font-medium">
                Create new category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Category</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Department</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Slug</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Status</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Products</th>
                    <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <div className="w-10 h-10 relative rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <Image src={cat.image} alt={cat.name} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0 text-gray-400 border border-gray-200">
                              <Tag size={16} />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            cat.department === 'Leather'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : cat.department === 'Essentials'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {cat.department || 'Fragrance'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cat.isActive
                              ? 'bg-green-50 text-green-700 border border-green-200/60'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {cat.isActive ? (
                            <><CheckCircle2 size={12} /> Active</>
                          ) : (
                            <><XCircle size={12} /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          {cat._count.products}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => { setDeleteError(''); setDeleteTarget(cat); }}
                            className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Create / Edit Modal */}
      {modalMode && (
        <CategoryFormModal
          mode={modalMode}
          category={editingCategory}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description={
          deleteTarget?._count.products
            ? `This category contains ${deleteTarget._count.products} product(s). Please reassign or delete them first.`
            : 'This action is irreversible and will permanently delete this category.'
        }
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
