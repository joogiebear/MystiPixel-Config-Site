import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// DELETE a version
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params;

    // Require authentication
    const userId = await requireAuth();

    // Check if version exists
    const version = await prisma.configVersion.findUnique({
      where: { id: versionId },
      include: {
        config: {
          select: { authorId: true }
        }
      }
    });

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (version.config.authorId !== userId && !user?.isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this version' },
        { status: 403 }
      );
    }

    // Delete version
    await prisma.configVersion.delete({
      where: { id: versionId }
    });

    return NextResponse.json({ message: 'Version deleted successfully' });
  } catch (error) {
    console.error('Error deleting version:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete version' },
      { status: 500 }
    );
  }
}
