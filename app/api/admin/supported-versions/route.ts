import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Get all Supported Versions
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const versions = await prisma.supportedVersion.findMany({
      include: {
        _count: {
          select: { configs: true }
        }
      },
      orderBy: { version: 'desc' } // Latest versions first
    });

    return NextResponse.json({ versions });

  } catch (error) {
    console.error('Error fetching Supported Versions:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch Supported Versions' }, { status: 500 });
  }
}

// POST - Create new Supported Version
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { version } = body;

    if (!version) {
      return NextResponse.json({ error: 'Version is required' }, { status: 400 });
    }

    const existing = await prisma.supportedVersion.findUnique({ where: { version } });

    if (existing) {
      return NextResponse.json({ error: 'This Supported Version already exists' }, { status: 400 });
    }

    const supportedVersion = await prisma.supportedVersion.create({
      data: { version }
    });

    return NextResponse.json(supportedVersion, { status: 201 });

  } catch (error) {
    console.error('Error creating Supported Version:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to create Supported Version' }, { status: 500 });
  }
}
