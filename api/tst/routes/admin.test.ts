import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../../src/server.js';
import type { FastifyInstance } from 'fastify';

describe('Admin Routes (/admin/*)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildServer(':memory:');
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /admin/routes', () => {
    it('should create a new route', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/routes',
        payload: { path: 'products', keyField: 'sku' },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().path).toBe('products');
      expect(response.json().keyField).toBe('sku');
    });

    it('should return 400 if path is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/routes',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /admin/routes', () => {
    it('should list all routes', async () => {
      await app.inject({ method: 'POST', url: '/admin/routes', payload: { path: 'users' } });
      await app.inject({ method: 'POST', url: '/admin/routes', payload: { path: 'products' } });

      const response = await app.inject({ method: 'GET', url: '/admin/routes' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(2);
    });
  });

  describe('GET /admin/routes/:id', () => {
    it('should return a single route', async () => {
      const created = await app.inject({ method: 'POST', url: '/admin/routes', payload: { path: 'users' } });
      const id = created.json().id;

      const response = await app.inject({ method: 'GET', url: `/admin/routes/${id}` });
      expect(response.statusCode).toBe(200);
      expect(response.json().path).toBe('users');
    });

    it('should return 404 for unknown id', async () => {
      const response = await app.inject({ method: 'GET', url: '/admin/routes/999' });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /admin/routes/:id', () => {
    it('should update route config', async () => {
      const created = await app.inject({ method: 'POST', url: '/admin/routes', payload: { path: 'users' } });
      const id = created.json().id;

      const response = await app.inject({
        method: 'PUT',
        url: `/admin/routes/${id}`,
        payload: { latency: 2000, isStatic: true, staticCode: 500 },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().latency).toBe(2000);
      expect(response.json().isStatic).toBe(true);
      expect(response.json().staticCode).toBe(500);
    });
  });

  describe('DELETE /admin/routes/:id', () => {
    it('should delete a route', async () => {
      const created = await app.inject({ method: 'POST', url: '/admin/routes', payload: { path: 'users' } });
      const id = created.json().id;

      const del = await app.inject({ method: 'DELETE', url: `/admin/routes/${id}` });
      expect(del.statusCode).toBe(204);

      const list = await app.inject({ method: 'GET', url: '/admin/routes' });
      expect(list.json()).toHaveLength(0);
    });
  });

  describe('POST /admin/wipe', () => {
    it('should wipe all data', async () => {
      await app.inject({ method: 'POST', url: '/admin/routes', payload: { path: 'users' } });
      await app.inject({ method: 'POST', url: '/api/users', payload: { name: 'Alice' } });

      const wipe = await app.inject({ method: 'POST', url: '/admin/wipe' });
      expect(wipe.statusCode).toBe(200);

      const list = await app.inject({ method: 'GET', url: '/admin/routes' });
      expect(list.json()).toHaveLength(0);
    });
  });

  describe('GET /admin/logs', () => {
    it('should return request logs', async () => {
      await app.inject({ method: 'GET', url: '/admin/routes' });

      const response = await app.inject({ method: 'GET', url: '/admin/logs' });
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });
  });
});
