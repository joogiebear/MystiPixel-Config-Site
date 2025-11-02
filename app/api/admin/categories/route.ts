import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Get all categories (admin view with full details)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { configs: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ categories });

  } catch (error) {
    console.error('Error fetching categories:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { name, slug, description, icon } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null
      }
    });

    return NextResponse.json(category, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
