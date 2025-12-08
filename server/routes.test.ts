
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';
import { VerificationService } from './verification-service';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('API Routes - Authentication', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // Don't mock - use real API calls via Doppler
    // vi.spyOn(VerificationService, 'sendEmailVerification').mockResolvedValue(true);
    // vi.spyOn(VerificationService, 'sendPhoneVerification').mockResolvedValue(true);
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        pseudonyme: 'testuser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'Password123',
        dateOfBirth: '2000-01-01',
        phone: '+33612345678',
        gender: 'Mr',
        city: 'Paris',
        country: 'France',
        nationality: 'Française'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should reject duplicate email', async () => {
      const timestamp = Date.now();
      const email = `duplicate${timestamp}@example.com`;
      const userData = {
        pseudonyme: 'user1' + timestamp,
        email,
        password: 'Password123',
        dateOfBirth: '2000-01-01',
        phone: `+3361299${timestamp.toString().slice(-4)}`,
        gender: 'Mr',
        city: 'Lyon',
        country: 'France',
        nationality: 'Française'
      };

      await request(app).post('/api/auth/signup').send(userData).expect(201);
      await request(app).post('/api/auth/signup').send({...userData, pseudonyme: 'user2' + timestamp}).expect(409);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'testuser',
          email: 'test@example.com',
          password: 'weak',
          dateOfBirth: '2000-01-01',
          phone: '+33612345678',
          gender: 'Mr'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject underage user', async () => {
      const today = new Date();
      const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'younguser',
          email: 'young@example.com',
          password: 'Password123',
          dateOfBirth: underageDate.toISOString().split('T')[0],
          phone: '+33612345678',
          gender: 'Mr',
          city: 'Marseille',
          country: 'France',
          nationality: 'Française'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      pseudonyme: 'logintest' + Date.now(),
      email: `login${Date.now()}@example.com`,
      password: 'Password123',
      dateOfBirth: '2000-01-01',
      phone: '+33612345678',
      gender: 'Mrs',
      city: 'Toulouse',
      country: 'France',
      nationality: 'Française'
    };

    beforeAll(async () => {
      await request(app).post('/api/auth/signup').send(testUser);
      
      await db
        .update(users)
        .set({
          emailVerified: true,
          phoneVerified: true
        })
        .where(eq(users.email, testUser.email.toLowerCase()));
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);
    });

    it('should reject non-existent email', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        })
        .expect(401);
    });
  });
});
