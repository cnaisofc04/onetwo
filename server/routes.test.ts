
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';

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

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        pseudonyme: 'testuser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'Password123',
        dateOfBirth: '2000-01-01',
        phone: '+33612345678',
        gender: 'Mr'
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
      const email = `duplicate${Date.now()}@example.com`;
      const userData = {
        pseudonyme: 'user1',
        email,
        password: 'Password123',
        dateOfBirth: '2000-01-01',
        phone: '+33612345678',
        gender: 'Mr'
      };

      await request(app).post('/api/auth/signup').send(userData).expect(201);
      await request(app).post('/api/auth/signup').send({...userData, pseudonyme: 'user2'}).expect(409);
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
          gender: 'Mr'
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
      gender: 'Mrs'
    };

    beforeAll(async () => {
      await request(app).post('/api/auth/signup').send(testUser);
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
