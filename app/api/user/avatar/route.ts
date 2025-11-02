import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// POST - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: dataUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error uploading avatar:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error removing avatar:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
