import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// ============================================================
// 🔐 SECURITY AUDIT LOGGING
// ============================================================

interface SecurityEvent {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  type: string;
  description: string;
  ip: string;
  requestId?: string;
  userId?: string;
  details?: Record<string, any>;
}

class SecurityLogger {
  private logDir = '/tmp/security-logs';

  constructor() {
    this.ensureLogDir();
  }

  private ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create security log directory:', error);
    }
  }

  log(event: SecurityEvent) {
    const logEntry = JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    console.log(`[SECURITY-${event.level}] ${event.type}: ${event.description}`);

    try {
      const fileName = `security-${event.level.toLowerCase()}.log`;
      const filePath = path.join(this.logDir, fileName);
      fs.appendFileSync(filePath, logEntry + '\n');
    } catch (error) {
      console.error('Failed to write security log:', error);
    }
  }

  logAuthAttempt(req: Request, success: boolean, userId?: string) {
    this.log({
      timestamp: new Date(),
      level: success ? 'INFO' : 'WARN',
      type: 'AUTH_ATTEMPT',
      description: `Authentication ${success ? 'successful' : 'failed'} for ${req.path}`,
      ip: req.ip || 'unknown',
      requestId: req.securityContext?.requestId,
      userId,
      details: {
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
      },
    });
  }

  logRateLimitExceeded(req: Request) {
    this.log({
      timestamp: new Date(),
      level: 'WARN',
      type: 'RATE_LIMIT_EXCEEDED',
      description: `Rate limit exceeded for ${req.path}`,
      ip: req.ip || 'unknown',
      requestId: req.securityContext?.requestId,
      details: {
        path: req.path,
        method: req.method,
      },
    });
  }

  logValidationError(req: Request, field: string, error: string) {
    this.log({
      timestamp: new Date(),
      level: 'WARN',
      type: 'VALIDATION_ERROR',
      description: `Validation error on field: ${field}`,
      ip: req.ip || 'unknown',
      requestId: req.securityContext?.requestId,
      details: {
        path: req.path,
        field,
        error,
      },
    });
  }

  logSuspiciousActivity(req: Request, description: string) {
    this.log({
      timestamp: new Date(),
      level: 'CRITICAL',
      type: 'SUSPICIOUS_ACTIVITY',
      description,
      ip: req.ip || 'unknown',
      requestId: req.securityContext?.requestId,
      details: {
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
      },
    });
  }

  logPasswordReset(req: Request, userId: string, success: boolean) {
    this.log({
      timestamp: new Date(),
      level: success ? 'INFO' : 'WARN',
      type: 'PASSWORD_RESET',
      description: `Password reset ${success ? 'successful' : 'failed'} for user ${userId}`,
      ip: req.ip || 'unknown',
      requestId: req.securityContext?.requestId,
      userId,
    });
  }

  logDataAccess(req: Request, userId: string, resource: string) {
    this.log({
      timestamp: new Date(),
      level: 'INFO',
      type: 'DATA_ACCESS',
      description: `User accessed resource: ${resource}`,
      ip: req.ip || 'unknown',
      requestId: req.securityContext?.requestId,
      userId,
      details: { resource },
    });
  }
}

export const securityLogger = new SecurityLogger();
