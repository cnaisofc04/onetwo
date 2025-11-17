
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';
import { VerificationService } from './verification-service';

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

  beforeEach(() => {
    vi.spyOn(VerificationService, 'sendEmailVerification').mockResolvedValue(true);
    vi.spyOn(VerificationService, 'sendPhoneVerification').mockResolvedValue(true);
  });

  describe('POST /api/auth/signup', () => {
    it('should create Mr user in supabaseMan', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestMr' + Date.now(),
          email: `testmr${Date.now()}@test.com`,
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
          pseudonyme: 'TestMrs' + Date.now(),
          email: `testmrs${Date.now()}@test.com`,
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: `+3361234${Date.now().toString().slice(-4)}`,
          gender: 'Mrs'
        });
      
      expect(response.status).toBe(201);
    });

    it('should create Mr_Homosexuel user in supabaseMan', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestGay' + Date.now(),
          email: `testgay${Date.now()}@test.com`,
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: `+3361235${Date.now().toString().slice(-4)}`,
          gender: 'Mr_Homosexuel'
        });
      
      expect(response.status).toBe(201);
    });

    it('should create Mrs_Homosexuelle user in supabaseWoman', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          pseudonyme: 'TestLesbian' + Date.now(),
          email: `testlesbian${Date.now()}@test.com`,
          password: 'Test1234',
          dateOfBirth: '1990-01-01',
          phone: `+3361236${Date.now().toString().slice(-4)}`,
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
