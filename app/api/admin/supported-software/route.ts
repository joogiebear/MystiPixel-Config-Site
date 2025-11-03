import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Get all supported software
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supportedSoftware = await prisma.supportedSoftware.findMany({
      include: {
        _count: {
          select: { configs: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ supportedSoftware });

  } catch (error) {
    console.error('Error fetching supported software:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch supported software' }, { status: 500 });
  }
}

// POST - Create new supported software
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { name, slug, description, icon } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = await prisma.supportedSoftware.findUnique({ where: { slug } });

    if (existing) {
      return NextResponse.json({ error: 'A supported software with this slug already exists' }, { status: 400 });
    }

    const supportedSoftware = await prisma.supportedSoftware.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null
      }
    });

    return NextResponse.json(supportedSoftware, { status: 201 });

  } catch (error) {
    console.error('Error creating supported software:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to create supported software' }, { status: 500 });
  }
}
