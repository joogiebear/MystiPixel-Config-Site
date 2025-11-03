// Simple in-memory rate limiter
// For production, consider using Redis or a database

interface RateLimitEntry {
  attempts: number[];
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const registrationAttempts = new Map<string, RateLimitEntry>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Clean login attempts
  for (const [key, entry] of loginAttempts.entries()) {
    entry.attempts = entry.attempts.filter(timestamp => timestamp > oneHourAgo);
    if (entry.attempts.length === 0 && (!entry.lockedUntil || entry.lockedUntil < now)) {
      loginAttempts.delete(key);
    }
  }

  // Clean registration attempts
  for (const [key, entry] of registrationAttempts.entries()) {
    entry.attempts = entry.attempts.filter(timestamp => timestamp > oneHourAgo);
    if (entry.attempts.length === 0) {
      registrationAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Login rate limiting: 5 attempts per 15 minutes
export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(identifier) || { attempts: [] };

  // Check if account is locked
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000)
    };
  }

  // Remove attempts older than 15 minutes
  const fifteenMinutesAgo = now - (15 * 60 * 1000);
  entry.attempts = entry.attempts.filter(timestamp => timestamp > fifteenMinutesAgo);

  // Check if limit exceeded
  if (entry.attempts.length >= 5) {
    // Lock account for 15 minutes
    entry.lockedUntil = now + (15 * 60 * 1000);
    loginAttempts.set(identifier, entry);

    return {
      allowed: false,
      retryAfter: 15 * 60
    };
  }

  return { allowed: true };
}

export function recordLoginAttempt(identifier: string, success: boolean) {
  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(identifier);
  } else {
    const entry = loginAttempts.get(identifier) || { attempts: [] };
    entry.attempts.push(Date.now());
    loginAttempts.set(identifier, entry);
  }
}

// Registration rate limiting: 3 registrations per hour per IP
export function checkRegistrationRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = registrationAttempts.get(ip) || { attempts: [] };

  // Remove attempts older than 1 hour
  const oneHourAgo = now - (60 * 60 * 1000);
  entry.attempts = entry.attempts.filter(timestamp => timestamp > oneHourAgo);

  // Check if limit exceeded
  if (entry.attempts.length >= 3) {
    const oldestAttempt = Math.min(...entry.attempts);
    const retryAfter = Math.ceil((oldestAttempt + (60 * 60 * 1000) - now) / 1000);

    return {
      allowed: false,
      retryAfter
    };
  }

  return { allowed: true };
}

export function recordRegistrationAttempt(ip: string) {
  const entry = registrationAttempts.get(ip) || { attempts: [] };
  entry.attempts.push(Date.now());
  registrationAttempts.set(ip, entry);
}
