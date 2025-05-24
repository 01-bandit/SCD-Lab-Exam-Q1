const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');

describe('Profile Service', () => {
  let authToken;

  beforeAll(async () => {
    // Simulate getting JWT token from auth service
    authToken = jwt.sign(
      { userId: 'test-user-id', email: 'test@test.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

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

  describe('Profile Operations', () => {
    it('should create a new profile with valid JWT token', async () => {
      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'test-user-id',
          name: 'Test User',
          bio: 'Test Bio'
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test User');
    });

    it('should fail to create profile without JWT token', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send({
          userId: 'test-user-id',
          name: 'Test User',
          bio: 'Test Bio'
        });
      expect(response.status).toBe(401);
    });

    it('should get a profile by user ID', async () => {
      const response = await request(app)
        .get('/api/profile/test-user-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('bio');
    });
  });
}); 