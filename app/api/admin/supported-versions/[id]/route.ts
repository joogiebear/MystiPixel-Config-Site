import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// DELETE - Delete Supported Version
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const configCount = await prisma.config.count({
      where: { supportedVersions: { some: { id } } }
    });

    if (configCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete version with ${configCount} config(s). Remove them first.` },
        { status: 400 }
      );
    }

    await prisma.supportedVersion.delete({ where: { id } });

    return NextResponse.json({ message: 'Supported Version deleted successfully' });

  } catch (error) {
    console.error('Error deleting Supported Version:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to delete Supported Version' }, { status: 500 });
  }
}
