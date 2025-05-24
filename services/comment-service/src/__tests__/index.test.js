const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');

describe('Comment Service', () => {
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

  describe('Comment Operations', () => {
    it('should create a new comment with valid JWT token', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          blogId: 'test-blog-id',
          content: 'Test Comment',
          author: 'Test User'
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('Test Comment');
    });

    it('should fail to create comment without JWT token', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({
          blogId: 'test-blog-id',
          content: 'Test Comment',
          author: 'Test User'
        });
      expect(response.status).toBe(401);
    });

    it('should get comments for a blog', async () => {
      const response = await request(app)
        .get('/api/comments/blog/test-blog-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 