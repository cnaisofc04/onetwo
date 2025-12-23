import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Token Middleware
 * Prevents Cross-Site Request Forgery attacks
 * 
 * Strategy: Double-submit cookie pattern
 * 1. Generate token and store in HTTP-only cookie
 * 2. Require token in request header for state-changing operations
 * 3. Server validates token matches cookie
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_COOKIE = '__csrf_token';

interface TokenStore {
  [key: string]: { token: string; timestamp: number };
}

// In-memory token store (in production, use Redis or similar)
const tokenStore: TokenStore = {};
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function csrfMiddleware() {
  return [
    // Middleware 1: Generate and store CSRF token
    (req: Request, res: Response, next: NextFunction) => {
      const sessionId = req.headers['x-session-id'] as string;
      
      // Generate token if not exists
      if (!sessionId || !tokenStore[sessionId] || isTokenExpired(tokenStore[sessionId].timestamp)) {
        const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
        const storeKey = sessionId || crypto.randomBytes(16).toString('hex');
        
        tokenStore[storeKey] = {
          token,
          timestamp: Date.now(),
        };
        
        // Store token in HTTP-only cookie
        res.cookie(CSRF_TOKEN_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: TOKEN_EXPIRY_MS,
          path: '/',
        });
        
        // Make token available in response headers for frontend
        res.setHeader('x-csrf-token', token);
      }
      
      next();
    },
    
    // Middleware 2: Validate CSRF token for state-changing operations
    (req: Request, res: Response, next: NextFunction) => {
      // Only validate for state-changing operations
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
      }
      
      // Skip validation for specific safe endpoints (health checks, public APIs)
      // All auth and onboarding endpoints are safe - they don't require CSRF tokens
      // These are public registration/onboarding flows, not dangerous state-changing operations
      const safeEndpoints = [
        '/health',
        // Auth endpoints - registration and verification flows
        '/api/auth/signup',
        '/api/auth/signup/session',
        '/api/auth/check-email',
        '/api/auth/check-pseudonyme',
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/change-password',
        '/api/auth/verify-email',
        '/api/auth/verify-phone',
        '/api/auth/resend-email',
        '/api/auth/resend-phone',
        // Onboarding endpoints - user profile setup
        '/api/onboarding',
      ];
      
      if (safeEndpoints.some(ep => req.path.startsWith(ep))) {
        return next();
      }
      
      // Get token from header
      const tokenFromHeader = req.headers[CSRF_TOKEN_HEADER] as string;
      
      // Get token from cookie
      const tokenFromCookie = req.cookies?.[CSRF_TOKEN_COOKIE];
      
      // Get session ID to look up stored token
      const sessionId = req.headers['x-session-id'] as string;
      const storedTokenData = sessionId ? tokenStore[sessionId] : null;
      
      // Validate
      if (!tokenFromHeader || !tokenFromCookie) {
        return res.status(403).json({
          error: 'CSRF token missing',
          message: 'Request must include CSRF token in header and cookie',
        });
      }
      
      if (tokenFromHeader !== tokenFromCookie) {
        return res.status(403).json({
          error: 'CSRF token mismatch',
          message: 'Token in header does not match token in cookie',
        });
      }
      
      // If we have a session ID, also verify against server-side token
      if (storedTokenData && isTokenExpired(storedTokenData.timestamp)) {
        return res.status(403).json({
          error: 'CSRF token expired',
          message: 'Please refresh the page and try again',
        });
      }
      
      next();
    },
  ];
}

/**
 * Helper: Check if token has expired
 */
function isTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > TOKEN_EXPIRY_MS;
}

/**
 * Cleanup middleware: Remove expired tokens periodically
 */
export function csrfCleanupMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Cleanup every 1000 requests to avoid memory leaks
    if (Math.random() < 0.001) {
      const now = Date.now();
      Object.keys(tokenStore).forEach((key) => {
        if (now - tokenStore[key].timestamp > TOKEN_EXPIRY_MS) {
          delete tokenStore[key];
        }
      });
    }
    next();
  };
}

/**
 * Helper function to get CSRF token (for frontend)
 */
export function getCSRFToken(req: Request): string | null {
  return req.headers['x-csrf-token'] as string || null;
}
