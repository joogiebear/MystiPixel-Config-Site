import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth-helpers';

// GET - Check if config is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const { configId } = await params;

    // Get user ID (optional - returns null if not authenticated)
    const userId = await getCurrentUserId();

    // If not authenticated, return not favorited
    if (!userId) {
      return NextResponse.json({
        isFavorited: false,
        favoriteId: null
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        configId_userId: {
          userId,
          configId
        }
      }
    });

    return NextResponse.json({
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null
    });

  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
