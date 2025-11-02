import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Get all game modes
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const gameModes = await prisma.gameMode.findMany({
      include: {
        _count: {
          select: { configs: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ gameModes });

  } catch (error) {
    console.error('Error fetching game modes:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch game modes' }, { status: 500 });
  }
}

// POST - Create new game mode
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { name, slug, description, icon } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = await prisma.gameMode.findUnique({ where: { slug } });

    if (existing) {
      return NextResponse.json({ error: 'A game mode with this slug already exists' }, { status: 400 });
    }

    const gameMode = await prisma.gameMode.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null
      }
    });

    return NextResponse.json(gameMode, { status: 201 });

  } catch (error) {
    console.error('Error creating game mode:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to create game mode' }, { status: 500 });
  }
}
