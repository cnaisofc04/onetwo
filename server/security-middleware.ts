import type { Request, Response, NextFunction } from 'express';

// ============================================================
// 🔐 SECURITY HEADERS MIDDLEWARE - OWASP
// ============================================================

export function securityHeadersMiddleware() {
  return [
    // Custom security headers
    (req: Request, res: Response, next: NextFunction) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      // Disable MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      // CSP - Content Security Policy
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
      // HSTS - Force HTTPS
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      // Prevent cache for sensitive data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      // Prevent information leakage
      res.removeHeader('Server');
      res.removeHeader('X-Powered-By');

      next();
    },
  ];
}

// ============================================================
// 🔐 CORS - CONFIGURABLE SECURISÉ
// ============================================================

export function secureCorsMiddleware() {
  const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://0.0.0.0:5000',
  ];

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  };
}

// ============================================================
// 🔐 REQUEST VALIDATION MIDDLEWARE
// ============================================================

export function requestValidationMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check content-type for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
      }
    }

    // Limit request size
    if (req.headers['content-length']) {
      const size = parseInt(req.headers['content-length']);
      if (size > 1024 * 1024) { // 1MB limit
        return res.status(413).json({ error: 'Request entity too large' });
      }
    }

    next();
  };
}

// ============================================================
// 🔐 SECURITY CONTEXT MIDDLEWARE
// ============================================================

declare global {
  namespace Express {
    interface Request {
      securityContext?: {
        requestId: string;
        timestamp: Date;
        ip: string;
        userAgent: string;
      };
    }
  }
}

export function securityContextMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    req.securityContext = {
      requestId: req.headers['x-request-id']?.toString() || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    res.setHeader('X-Request-ID', req.securityContext.requestId);
    next();
  };
}
