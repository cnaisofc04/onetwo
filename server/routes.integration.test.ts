
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';

describe('Signup Integration Tests', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should create Mr user in supabaseMan', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestMr',
          email: 'testmr@test.com',
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: '+33612345678',
          gender: 'Mr'
        });
      
      expect(response.status).toBe(201);
    });

    it('should create Mrs user in supabaseWoman', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestMrs',
          email: 'testmrs@test.com',
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: '+33612345679',
          gender: 'Mrs'
        });
      
      expect(response.status).toBe(201);
    });

    it('should create Mr_Homosexuel user in supabaseMan', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestGay',
          email: 'testgay@test.com',
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: '+33612345680',
          gender: 'Mr_Homosexuel'
        });
      
      expect(response.status).toBe(201);
    });

    it('should create Mrs_Homosexuelle user in supabaseWoman', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestLesbian',
          email: 'testlesbian@test.com',
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: '+33612345681',
          gender: 'Mrs_Homosexuelle'
        });
      
      expect(response.status).toBe(201);
    });

    it('should reject invalid gender value', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestInvalid',
          email: 'testinvalid@test.com',
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: '+33612345682',
          gender: 'InvalidGender'
        });
      
      expect(response.status).toBe(400);
    });
  });
});
