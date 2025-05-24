const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');

describe('Blog Service', () => {
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

  describe('Blog Operations', () => {
    it('should create a new blog post with valid JWT token', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Blog',
          content: 'Test Content',
          author: 'Test Author'
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Blog');
    });

    it('should fail to create blog post without JWT token', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .send({
          title: 'Test Blog',
          content: 'Test Content',
          author: 'Test Author'
        });
      expect(response.status).toBe(401);
    });

    it('should get all blog posts', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 