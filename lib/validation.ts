// Password strength validation
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  // Optional: Check for common passwords
  const commonPasswords = ['password', '12345678', 'qwerty123', 'password1', 'admin123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'This password is too common. Please choose a stronger password' };
  }

  return { valid: true };
}

// Email validation
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check length
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  // Sanitize: convert to lowercase
  return { valid: true };
}

// Name validation
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Check for suspicious patterns (basic XSS prevention)
  if (/<script|javascript:|onerror=|onclick=/i.test(name)) {
    return { valid: false, error: 'Invalid characters in name' };
  }

  return { valid: true };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove inline event handlers
}
