import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { productSchema } from '@/lib/validators';
import { Prisma } from '@prisma/client';

// GET /api/admin/products – list products with server-side pagination, search, and category/stock filtering
export async function GET(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10') || 10));
    const search = searchParams.get('search')?.trim() || '';
    const categoryId = searchParams.get('categoryId') || 'all';
    const stockStatus = searchParams.get('stockStatus') || 'all';
    const department = searchParams.get('department') || 'all';

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (department && department !== 'all') {
      where.department = department;
    }

    if (categoryId && categoryId !== 'all') {
      const parsedCatId = parseInt(categoryId);
      if (!isNaN(parsedCatId)) {
        where.categoryId = parsedCatId;
      }
    }

    if (stockStatus === 'in_stock') {
      where.stockQuantity = { gt: 0 };
    } else if (stockStatus === 'out_of_stock') {
      where.stockQuantity = { lte: 0 };
    } else if (stockStatus === 'low_stock') {
      where.stockQuantity = { gt: 0, lte: 10 };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { category: { select: { id: true, name: true } } },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/products]', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/admin/products – create a product
export async function POST(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const data = parsed.data;
    const imagesArray = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    const coverImage = imagesArray[0] || data.imageURL || null;

    const product = await prisma.product.create({
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
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/products]', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
