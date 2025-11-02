import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all ratings for a config
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const ratings = await prisma.rating.findMany({
      where: { configId: id },
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
    });

    // Calculate average and distribution
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    const distribution = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length,
    };

    return NextResponse.json({
      ratings,
      average: Math.round(avgRating * 10) / 10,
      total: ratings.length,
      distribution
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

// POST new rating
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { rating, review } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if config exists
    const config = await prisma.config.findUnique({
      where: { id }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    const userId = 'TEMP_USER_ID'; // TODO: Replace with session.user.id

    // Check if user already rated this config
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_configId: {
          userId,
          configId: id
        }
      }
    });

    let result;

    if (existingRating) {
      // Update existing rating
      result = await prisma.rating.update({
        where: {
          userId_configId: {
            userId,
            configId: id
          }
        },
        data: {
          rating,
          review: review || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });
    } else {
      // Create new rating
      result = await prisma.rating.create({
        data: {
          rating,
          review: review || null,
          userId,
          configId: id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating/updating rating:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}

// DELETE rating
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = 'TEMP_USER_ID'; // TODO: Replace with session.user.id

    await prisma.rating.delete({
      where: {
        userId_configId: {
          userId,
          configId: id
        }
      }
    });

    return NextResponse.json({ message: 'Rating deleted successfully' });

  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: 'Failed to delete rating' },
      { status: 500 }
    );
  }
}
