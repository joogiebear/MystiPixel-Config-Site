import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { checkLoginRateLimit, recordLoginAttempt } from './rate-limit'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const email = credentials.email.toLowerCase().trim();

        // Check rate limit
        const rateLimitCheck = checkLoginRateLimit(email);
        if (!rateLimitCheck.allowed) {
          const minutes = Math.ceil(rateLimitCheck.retryAfter! / 60);
          throw new Error(`Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
        }

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        })

        if (!user || !user.password) {
          recordLoginAttempt(email, false);
          throw new Error('Invalid email or password')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          recordLoginAttempt(email, false);
          throw new Error('Invalid email or password')
        }

        // Successful login - clear rate limit
        recordLoginAttempt(email, true);

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          image: user.image || undefined
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
