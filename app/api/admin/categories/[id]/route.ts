import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

// PATCH - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const { name, slug, description, icon } = body;

    // If slug is changing, check it's not already taken
    if (slug) {
      const existing = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
        icon: icon !== undefined ? icon : undefined
      }
    });

    return NextResponse.json(category);

  } catch (error) {
    console.error('Error updating category:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if category has configs
    const configCount = await prisma.config.count({
      where: { categoryId: id }
    });

    if (configCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${configCount} config(s). Move or delete them first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Error deleting category:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
