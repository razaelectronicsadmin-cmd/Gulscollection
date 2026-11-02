import { z } from 'zod';

// ─── Category ──────────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be under 80 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(80, 'Slug must be under 80 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  department: z.enum(['Fragrance', 'Leather', 'Essentials']),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── Product ───────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  brand: z.string().min(1, 'Brand is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: 'Price must be a positive number' }),
  stockQuantity: z
    .string()
    .min(1, 'Stock is required')
    .refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 0, { message: 'Stock must be 0 or more' }),
  categoryId: z
    .string()
    .min(1, 'Category is required')
    .refine((v) => !isNaN(parseInt(v)), { message: 'Invalid category' }),
  imageURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  department: z.enum(['Fragrance', 'Leather', 'Essentials']),
  topNote: z.string().max(200).optional().or(z.literal('')),
  heartNote: z.string().max(200).optional().or(z.literal('')),
  baseNote: z.string().max(200).optional().or(z.literal('')),
  ingredients: z.string().optional().or(z.literal('')),
  isSpecialEdition: z.boolean(),
  specialEditionType: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['Men', 'Women', 'Unisex']),
});

export type ProductFormValues = z.infer<typeof productSchema>;
