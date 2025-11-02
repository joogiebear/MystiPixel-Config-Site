import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET user's favorites
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const userId = await requireAuth();

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        config: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true
              }
            },
            _count: {
              select: {
                downloads: true,
                ratings: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      favorites: favorites.map(fav => ({
        id: fav.id,
        addedAt: fav.createdAt,
        config: fav.config
      }))
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const userId = await requireAuth();

    const body = await request.json();
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      );
    }

    // Check if config exists
    const config = await prisma.config.findUnique({
      where: { id: configId }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_configId: {
          userId,
          configId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Config already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        configId
      },
      include: {
        config: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            category: true
          }
        }
      }
    });

    return NextResponse.json(favorite, { status: 201 });

  } catch (error) {
    console.error('Error adding favorite:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const userId = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const configId = searchParams.get('configId');

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_configId: {
          userId,
          configId
        }
      }
    });

    return NextResponse.json({ message: 'Removed from favorites' });

  } catch (error) {
    console.error('Error removing favorite:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
