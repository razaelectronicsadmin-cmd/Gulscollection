import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { categorySchema } from '@/lib/validators';
import { Prisma } from '@prisma/client';

// GET /api/admin/categories – list categories with search, pagination, status filter
export async function GET(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    // If 'all=true', return simplified list for dropdown selection in forms
    if (all) {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, isActive: true, department: true },
      });
      return NextResponse.json(categories);
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10') || 10));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all';
    const department = searchParams.get('department') || 'all';

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (department && department !== 'all') {
      where.department = department;
    }

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
    ]);

    return NextResponse.json({
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/categories]', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories – create a new category
export async function POST(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { name, slug, image, isActive, department } = parsed.data;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: { slug: ['Slug already in use'] } }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image: image || null,
        department: department || 'Fragrance',
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/categories]', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
