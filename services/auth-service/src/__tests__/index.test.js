const request = require('supertest');
const app = require('../index');

describe('Auth Service', () => {
  describe('Health Check', () => {
    it('should return 200 OK for health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });

  describe('Readiness Check', () => {
    it('should return 200 OK when database is connected', async () => {
      const response = await request(app).get('/ready');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'READY' });
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User'
        });
      expect(response.status).toBe(201);
    });

    it('should login an existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
}); 