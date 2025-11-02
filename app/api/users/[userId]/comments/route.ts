import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Get all comments for a user's profile
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    const comments = await prisma.profileComment.findMany({
      where: { profileUserId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Error fetching profile comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment on a user's profile
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authorId = await requireAuth();
    const profileUserId = params.userId;
    const body = await request.json();

    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Prevent users from commenting on their own profile
    if (authorId === profileUserId) {
      return NextResponse.json(
        { error: 'You cannot comment on your own profile' },
        { status: 400 }
      );
    }

    // Verify the profile user exists
    const profileUser = await prisma.user.findUnique({
      where: { id: profileUserId }
    });

    if (!profileUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.profileComment.create({
      data: {
        content,
        authorId,
        profileUserId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(comment, { status: 201 });

  } catch (error) {
    console.error('Error creating profile comment:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
