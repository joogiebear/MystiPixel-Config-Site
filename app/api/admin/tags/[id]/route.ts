import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// PATCH - Update tag
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const { name, slug } = body;

    if (slug) {
      const existing = await prisma.tag.findFirst({
        where: { slug, NOT: { id } }
      });

      if (existing) {
        return NextResponse.json({ error: 'A tag with this slug already exists' }, { status: 400 });
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined
      }
    });

    return NextResponse.json(tag);

  } catch (error) {
    console.error('Error updating tag:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const configCount = await prisma.config.count({
      where: { tags: { some: { id } } }
    });

    if (configCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete tag with ${configCount} config(s). Remove them first.` },
        { status: 400 }
      );
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({ message: 'Tag deleted successfully' });

  } catch (error) {
    console.error('Error deleting tag:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
