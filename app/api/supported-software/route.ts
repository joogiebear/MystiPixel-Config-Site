import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all supported software (public)
export async function GET(request: NextRequest) {
  try {
    const supportedSoftware = await prisma.supportedSoftware.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ supportedSoftware });

  } catch (error) {
    console.error('Error fetching supported software:', error);
    return NextResponse.json({ error: 'Failed to fetch supported software' }, { status: 500 });
  }
}
