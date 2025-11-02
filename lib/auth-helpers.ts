import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { NextRequest } from 'next/server'

/**
 * Get the current authenticated user from the session
 * @returns User session or null if not authenticated
 */
export async function getAuthSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user's ID from the session
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuthSession()
  return session?.user?.id || null
}

/**
 * Require authentication - throws error if not authenticated
 * Use this for protected API routes
 * @returns User ID
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

/**
 * Check if the current user owns a resource
 * @param resourceOwnerId - The ID of the resource owner
 * @returns true if the current user owns the resource
 */
export async function isResourceOwner(resourceOwnerId: string): Promise<boolean> {
  const userId = await getCurrentUserId()
  return userId === resourceOwnerId
}
