import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Get all tags
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { configs: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ tags });

  } catch (error) {
    console.error('Error fetching tags:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST - Create new tag
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = await prisma.tag.findUnique({ where: { slug } });

    if (existing) {
      return NextResponse.json({ error: 'A tag with this slug already exists' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: { name, slug }
    });

    return NextResponse.json(tag, { status: 201 });

  } catch (error) {
    console.error('Error creating tag:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
