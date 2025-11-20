/**
 * Security utilities for protecting sensitive data
 */

import { NextResponse } from 'next/server';

// Fields that should never be exposed to clients
const SENSITIVE_FIELDS = [
  'password',
  'googleId',
  '__v',
  'encryptionKey',
  'refreshToken',
  'accessToken',
];

/**
 * Remove sensitive fields from a single object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, additionalFields: string[] = []): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };
  const fieldsToRemove = [...SENSITIVE_FIELDS, ...additionalFields];

  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
}

/**
 * Remove sensitive fields from an array of objects
 */
export function sanitizeArray<T extends Record<string, any>>(arr: T[], additionalFields: string[] = []): Partial<T>[] {
  if (!Array.isArray(arr)) return arr;
  return arr.map(obj => sanitizeObject(obj, additionalFields));
}

/**
 * Create a safe error response without exposing internal details
 */
export function createErrorResponse(
  message: string, 
  statusCode: number = 500,
  details?: string
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return NextResponse.json(
    {
      error: message,
      // Only include details in development
      ...((!isProduction && details) ? { details } : {}),
    },
    { status: statusCode }
  );
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or a dedicated service
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    // Create new window
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment counter
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Clean up expired rate limit records periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

/**
 * Validate session and return user ID
 */
export function validateSession(session: any): string | null {
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

/**
 * Mask sensitive information for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '****';
  return `${data.slice(0, visibleChars)}${'*'.repeat(data.length - visibleChars)}`;
}

/**
 * Generate a safe log message for errors
 */
export function safeErrorLog(error: unknown, context?: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const contextStr = context ? `[${context}] ` : '';
  
  if (isProduction) {
    // In production, log generic message
    return `${contextStr}An error occurred`;
  }
  
  // In development, log full error
  if (error instanceof Error) {
    return `${contextStr}${error.message}`;
  }
  
  return `${contextStr}${String(error)}`;
}
