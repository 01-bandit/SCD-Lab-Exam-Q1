const request = require('supertest');
const express = require('express');
const app = require('../index');

describe('API Gateway', () => {
  describe('Health Check', () => {
    it('should return 200 OK for health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });

  describe('Readiness Check', () => {
    it('should return 200 OK when all services are up', async () => {
      const response = await request(app).get('/ready');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'READY' });
    });
  });

  describe('Proxy Routes', () => {
    it('should proxy auth requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });
      expect(response.status).not.toBe(404);
    });

    it('should proxy blog requests', async () => {
      const response = await request(app)
        .get('/api/blogs');
      expect(response.status).not.toBe(404);
    });
  });
}); 