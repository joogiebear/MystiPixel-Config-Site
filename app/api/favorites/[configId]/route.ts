import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Check if config is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  try {
    const { configId } = params;

    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ isFavorited: false });
    // }

    const userId = 'TEMP_USER_ID'; // TODO: Replace with session.user.id

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_configId: {
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
