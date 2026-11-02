import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { productSchema } from '@/lib/validators';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/admin/products/[id] – single product (for edit form prefill)
export async function GET(_req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[GET /api/admin/products/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PATCH /api/admin/products/[id] – update a product
export async function PATCH(req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const data = parsed.data;
    const imagesArray = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    const coverImage = imagesArray[0] || data.imageURL || null;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        brand: data.brand,
        description: data.description,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        categoryId: parseInt(data.categoryId),
        imageURL: coverImage,
        images: imagesArray.length > 0 ? JSON.stringify(imagesArray) : coverImage ? JSON.stringify([coverImage]) : null,
        department: data.department || 'Fragrance',
        topNote: data.topNote || null,
        heartNote: data.heartNote || null,
        baseNote: data.baseNote || null,
        ingredients: data.ingredients || null,
        isSpecialEdition: data.isSpecialEdition,
        specialEditionType: data.specialEditionType || null,
        gender: data.gender,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/products/:id]', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] – delete a product
export async function DELETE(_req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // Prevent deletion if linked to order items
    const orderItemCount = await prisma.orderItem.count({ where: { productId } });
    if (orderItemCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: this product appears in ${orderItemCount} order(s).` },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/products/:id]', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

