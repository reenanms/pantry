import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../../src/server.js';
import type { FastifyInstance } from 'fastify';

describe('Dynamic Routes (/api/*)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildServer(':memory:');
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auto-Provisioning', () => {
    it('should auto-provision a route on first POST', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { name: 'Alice' },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.name).toBe('Alice');
      expect(body.id).toBeDefined(); // auto-generated key
    });

    it('should return 404 for GET on non-existent route', async () => {
      const response = await app.inject({ method: 'GET', url: '/api/nothing' });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { id: 'u1', name: 'Alice' },
      });
    });

    it('should GET all resources', async () => {
      const response = await app.inject({ method: 'GET', url: '/api/users' });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Alice');
    });

    it('should GET a single resource by key', async () => {
      const response = await app.inject({ method: 'GET', url: '/api/users/u1' });
      expect(response.statusCode).toBe(200);
      expect(response.json().name).toBe('Alice');
    });

    it('should PUT to update a resource', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/u1',
        payload: { name: 'Alice Updated' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().name).toBe('Alice Updated');
    });

    it('should DELETE a resource', async () => {
      const del = await app.inject({ method: 'DELETE', url: '/api/users/u1' });
      expect(del.statusCode).toBe(204);

      const get = await app.inject({ method: 'GET', url: '/api/users' });
      expect(get.json()).toHaveLength(0);
    });
  });

  describe('Static Response', () => {
    it('should return static code and payload when isStatic is enabled', async () => {
      // First create a route via admin
      const createRes = await app.inject({
        method: 'POST',
        url: '/admin/routes',
        payload: {
          path: 'maintenance',
          isStatic: true,
          staticCode: 503,
          staticPayload: '{"message":"Under maintenance"}',
        },
      });
      expect(createRes.statusCode).toBe(201);

      // Now any request to /api/maintenance should get static response
      const response = await app.inject({ method: 'GET', url: '/api/maintenance' });
      expect(response.statusCode).toBe(503);
      expect(response.json().message).toBe('Under maintenance');
    });
  });

  describe('404 for unknown paths', () => {
    it('should return 404 for paths outside /admin and /api', async () => {
      const response = await app.inject({ method: 'GET', url: '/something-else' });
      expect(response.statusCode).toBe(404);
    });
  });
});
