import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { categorySchema } from '@/lib/validators';

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/categories/[id] – update a category
export async function PATCH(req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { name, slug, image, isActive, department } = parsed.data;

    const slugConflict = await prisma.category.findFirst({
      where: { slug, NOT: { id: categoryId } },
    });
    if (slugConflict) {
      return NextResponse.json({ error: { slug: ['Slug already in use'] } }, { status: 409 });
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        image: image || null,
        department: department || 'Fragrance',
        isActive,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/categories/:id]', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] – delete a category (only if no products attached)
export async function DELETE(_req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) are still assigned to this category.` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/categories/:id]', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
