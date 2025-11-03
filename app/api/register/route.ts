import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validatePassword, validateEmail, validateName, sanitizeInput } from '@/lib/validation'
import { checkRegistrationRateLimit, recordRegistrationAttempt } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Check registration rate limit
    const rateLimitCheck = checkRegistrationRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please try again in ${Math.ceil(rateLimitCheck.retryAfter! / 60)} minutes.`
        },
        { status: 429 }
      );
    }

    const body = await request.json()
    let { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate and sanitize email
    email = email.toLowerCase().trim();
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate and sanitize name
    name = sanitizeInput(name);
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (email not verified yet)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: null // Will be set when email is verified
      }
    })

    // Record registration attempt for rate limiting
    recordRegistrationAttempt(ip);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.id);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails - user can request new verification email
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Account created successfully. Please check your email to verify your account.'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
