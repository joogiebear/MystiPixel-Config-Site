import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string; commentId: string } }
) {
  try {
    const userId = await requireAuth();
    const commentId = params.commentId;

    // Find the comment
    const comment = await prisma.profileComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only the comment author can delete their comment
    if (comment.authorId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    await prisma.profileComment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Error deleting comment:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
