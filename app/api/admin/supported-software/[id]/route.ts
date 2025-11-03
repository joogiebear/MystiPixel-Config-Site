import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// PATCH - Update supported software
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const { name, slug, description, icon } = body;

    if (slug) {
      const existing = await prisma.supportedSoftware.findFirst({
        where: { slug, NOT: { id } }
      });

      if (existing) {
        return NextResponse.json({ error: 'A supported software with this slug already exists' }, { status: 400 });
      }
    }

    const supportedSoftware = await prisma.supportedSoftware.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
        icon: icon !== undefined ? icon : undefined
      }
    });

    return NextResponse.json(supportedSoftware);

  } catch (error) {
    console.error('Error updating supported software:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to update supported software' }, { status: 500 });
  }
}

// DELETE - Delete supported software
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const configCount = await prisma.config.count({
      where: { supportedSoftwareId: id }
    });

    if (configCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete supported software with ${configCount} config(s). Remove them first.` },
        { status: 400 }
      );
    }

    await prisma.supportedSoftware.delete({ where: { id } });

    return NextResponse.json({ message: 'Supported software deleted successfully' });

  } catch (error) {
    console.error('Error deleting supported software:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to delete supported software' }, { status: 500 });
  }
}
