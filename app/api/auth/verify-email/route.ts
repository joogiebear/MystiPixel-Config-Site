import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing token or email' },
        { status: 400 }
      );
    }

    const isValid = await verifyEmailToken(email, token);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
