import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all Minecraft versions (public)
export async function GET(request: NextRequest) {
  try {
    const versions = await prisma.minecraftVersion.findMany({
      select: {
        id: true,
        version: true
      },
      orderBy: { version: 'desc' }
    });

    return NextResponse.json({ versions });

  } catch (error) {
    console.error('Error fetching Minecraft versions:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}
