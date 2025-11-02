import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET user's favorites
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = 'TEMP_USER_ID'; // TODO: Replace with session.user.id

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
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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

    const userId = 'TEMP_USER_ID'; // TODO: Replace with session.user.id

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
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const configId = searchParams.get('configId');

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      );
    }

    const userId = 'TEMP_USER_ID'; // TODO: Replace with session.user.id

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
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
