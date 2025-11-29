import type { Request, Response, NextFunction } from 'express';
import { securityLogger } from './security-logger';

// ============================================================
// 🔐 SECURE ERROR HANDLING - OWASP
// ============================================================

interface ApiError {
  statusCode: number;
  message: string;
  requestId?: string;
}

class ErrorHandler {
  handle(req: Request, res: Response, error: any) {
    console.error('[ERROR]', error);

    const requestId = req.securityContext?.requestId || 'unknown';
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Don't leak internal error messages
    let statusCode = 500;
    let message = 'An error occurred';
    let details: any = undefined;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    if (error.message) {
      // Only include error message if appropriate
      if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
        message = error.message;
      }
    }

    // Include details in development only
    if (isDevelopment && error.details) {
      details = error.details;
    }

    // Log security issue
    if (statusCode >= 400 && statusCode < 500) {
      securityLogger.logValidationError(req, 'general', message);
    } else if (statusCode >= 500) {
      securityLogger.logSuspiciousActivity(req, `Server error: ${error.message}`);
    }

    const response: ApiError & { details?: any } = {
      statusCode,
      message,
      requestId,
    };

    if (details) {
      response.details = details;
    }

    res.status(statusCode).json(response);
  }
}

export const errorHandler = new ErrorHandler();

// ============================================================
// 🔐 GLOBAL ERROR MIDDLEWARE
// ============================================================

export function globalErrorHandler() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    errorHandler.handle(req, res, err);
  };
}

// ============================================================
// 🔐 ASYNC WRAPPER FOR ROUTES
// ============================================================

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================================
// 🔐 VALIDATION ERROR FORMATTER
// ============================================================

export function formatValidationError(error: any) {
  return {
    statusCode: 400,
    message: 'Validation failed',
    details: error.flatten?.() || error.message,
  };
}
