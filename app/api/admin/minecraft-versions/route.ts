import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Get all Minecraft versions
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const versions = await prisma.minecraftVersion.findMany({
      include: {
        _count: {
          select: { configs: true }
        }
      },
      orderBy: { version: 'desc' } // Latest versions first
    });

    return NextResponse.json({ versions });

  } catch (error) {
    console.error('Error fetching Minecraft versions:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch Minecraft versions' }, { status: 500 });
  }
}

// POST - Create new Minecraft version
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { version } = body;

    if (!version) {
      return NextResponse.json({ error: 'Version is required' }, { status: 400 });
    }

    const existing = await prisma.minecraftVersion.findUnique({ where: { version } });

    if (existing) {
      return NextResponse.json({ error: 'This Minecraft version already exists' }, { status: 400 });
    }

    const mcVersion = await prisma.minecraftVersion.create({
      data: { version }
    });

    return NextResponse.json(mcVersion, { status: 201 });

  } catch (error) {
    console.error('Error creating Minecraft version:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to create Minecraft version' }, { status: 500 });
  }
}
