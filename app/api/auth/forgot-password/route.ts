import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to prevent email enumeration
    // (Don't reveal whether the email exists or not)
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent'
      });
    }

    // Send password reset email
    try {
      await sendPasswordResetEmail(normalizedEmail);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent revealing email existence
    }

    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
