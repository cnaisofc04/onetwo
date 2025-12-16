import type { Request, Response, NextFunction } from 'express';

// ============================================================
// 🔐 RATE LIMITING - PROTECTION BRUTE FORCE
// ============================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class RateLimiter {
  private stores = new Map<string, Map<string, RateLimitEntry>>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    const storeValues = Array.from(this.stores.values());
    for (const store of storeValues) {
      const entries = Array.from(store.entries());
      for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
          store.delete(key);
        }
      }
    }
  }

  getMiddleware(storeName: string, config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.stores.has(storeName)) {
        this.stores.set(storeName, new Map());
      }

      const store = this.stores.get(storeName)!;
      const key = `${req.ip}:${req.path}`;
      const now = Date.now();

      let entry = store.get(key);

      if (!entry || now > entry.resetTime) {
        entry = { count: 0, resetTime: now + config.windowMs };
        store.set(key, entry);
      }

      entry.count++;

      const remaining = Math.max(0, config.maxRequests - entry.count);
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      res.setHeader('RateLimit-Limit', config.maxRequests);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

      if (entry.count > config.maxRequests) {
        console.warn(`⚠️  [RATE-LIMIT] ${key} exceeded limit`);
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter,
        });
      }

      next();
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

export const rateLimiter = new RateLimiter();

// ============================================================
// 🔐 PRE-CONFIGURED RATE LIMITERS
// ============================================================

export const loginLimiter = rateLimiter.getMiddleware('login', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts
});

export const signupLimiter = rateLimiter.getMiddleware('signup', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 signups
});

export const verificationLimiter = rateLimiter.getMiddleware('verification', {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 verification attempts
});

export const emailLimiter = rateLimiter.getMiddleware('email', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 email resends
});

export const passwordResetLimiter = rateLimiter.getMiddleware('password-reset', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts
});

export const apiLimiter = rateLimiter.getMiddleware('api', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});
