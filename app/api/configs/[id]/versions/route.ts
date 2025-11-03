import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET all versions for a config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const versions = await prisma.configVersion.findMany({
      where: { configId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST create new version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const userId = await requireAuth();

    const { version, changelog, fileUrl } = await request.json();

    // Validation
    if (!version || !fileUrl) {
      return NextResponse.json(
        { error: 'Version number and file are required' },
        { status: 400 }
      );
    }

    // Check if config exists and user owns it
    const config = await prisma.config.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (config.authorId !== userId && !user?.isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to add versions to this config' },
        { status: 403 }
      );
    }

    // Check if version already exists
    const existingVersion = await prisma.configVersion.findFirst({
      where: {
        configId: id,
        version
      }
    });

    if (existingVersion) {
      return NextResponse.json(
        { error: 'A version with this number already exists' },
        { status: 400 }
      );
    }

    // Create version
    const newVersion = await prisma.configVersion.create({
      data: {
        configId: id,
        version,
        changelog: changelog || '',
        fileUrl
      }
    });

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}
