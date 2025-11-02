import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single config by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    await prisma.config.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Fetch config with all relations
    const config = await prisma.config.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                configs: true
              }
            }
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
        tags: {
          select: {
            id: true,
            name: true
          }
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            downloadRecords: true,
            favorites: true,
            comments: true,
            ratings: true
          }
        }
      }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = config.ratings.length > 0
      ? config.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / config.ratings.length
      : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      5: config.ratings.filter((r: any) => r.rating === 5).length,
      4: config.ratings.filter((r: any) => r.rating === 4).length,
      3: config.ratings.filter((r: any) => r.rating === 3).length,
      2: config.ratings.filter((r: any) => r.rating === 2).length,
      1: config.ratings.filter((r: any) => r.rating === 1).length,
    };

    return NextResponse.json({
      ...config,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: config.ratings.length,
      ratingDistribution,
      downloadCount: config._count.downloadRecords,
      favoriteCount: config._count.favorites,
      commentCount: config._count.comments
    });

  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating configs
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add authentication and authorization check
    // Make sure the user owns this config

    const config = await prisma.config.update({
      where: { id },
      data: body,
      include: {
        author: true,
        category: true,
        tags: true
      }
    });

    return NextResponse.json(config);

  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for deleting configs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Add authentication and authorization check
    // Make sure the user owns this config

    await prisma.config.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Config deleted successfully' });

  } catch (error) {
    console.error('Error deleting config:', error);
    return NextResponse.json(
      { error: 'Failed to delete config' },
      { status: 500 }
    );
  }
}
