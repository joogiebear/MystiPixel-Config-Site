import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const result = await verifyPasswordResetToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
