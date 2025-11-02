import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all game modes (public)
export async function GET(request: NextRequest) {
  try {
    const gameModes = await prisma.gameMode.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ gameModes });

  } catch (error) {
    console.error('Error fetching game modes:', error);
    return NextResponse.json({ error: 'Failed to fetch game modes' }, { status: 500 });
  }
}
