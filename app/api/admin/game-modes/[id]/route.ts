import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// PATCH - Update game mode
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
      const existing = await prisma.gameMode.findFirst({
        where: { slug, NOT: { id } }
      });

      if (existing) {
        return NextResponse.json({ error: 'A game mode with this slug already exists' }, { status: 400 });
      }
    }

    const gameMode = await prisma.gameMode.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
        icon: icon !== undefined ? icon : undefined
      }
    });

    return NextResponse.json(gameMode);

  } catch (error) {
    console.error('Error updating game mode:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to update game mode' }, { status: 500 });
  }
}

// DELETE - Delete game mode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const configCount = await prisma.config.count({
      where: { gameModes: { some: { id } } }
    });

    if (configCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete game mode with ${configCount} config(s). Remove them first.` },
        { status: 400 }
      );
    }

    await prisma.gameMode.delete({ where: { id } });

    return NextResponse.json({ message: 'Game mode deleted successfully' });

  } catch (error) {
    console.error('Error deleting game mode:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to delete game mode' }, { status: 500 });
  }
}
