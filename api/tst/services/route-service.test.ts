import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase } from '../../src/db/connection.js';
import { RouteService, RouteNotFoundError } from '../../src/services/route-service.js';

describe('RouteService', () => {
  let routeService: RouteService;

  beforeEach(() => {
    const { db } = createDatabase(':memory:');
    routeService = new RouteService(db);
  });

  describe('createRoute', () => {
    it('should create a new route', () => {
      const route = routeService.createRoute('users');
      expect(route.path).toBe('users');
      expect(route.keyField).toBe('id');
      expect(route.latency).toBe(0);
      expect(route.isStatic).toBe(false);
    });

    it('should return existing route if path already exists', () => {
      const first = routeService.createRoute('users');
      const second = routeService.createRoute('users');
      expect(first.id).toBe(second.id);
    });

    it('should accept custom options', () => {
      const route = routeService.createRoute('products', {
        keyField: 'sku',
        latency: 500,
        isStatic: true,
        staticCode: 503,
        staticPayload: '{"status":"maintenance"}',
      });

      expect(route.keyField).toBe('sku');
      expect(route.latency).toBe(500);
      expect(route.isStatic).toBe(true);
      expect(route.staticCode).toBe(503);
    });
  });

  describe('listRoutes', () => {
    it('should return all routes', () => {
      routeService.createRoute('users');
      routeService.createRoute('products');

      const routes = routeService.listRoutes();
      expect(routes).toHaveLength(2);
    });
  });

  describe('findRouteById', () => {
    it('should find a route by id', () => {
      const created = routeService.createRoute('users');
      const found = routeService.findRouteById(created.id);
      expect(found.path).toBe('users');
    });

    it('should throw RouteNotFoundError for unknown id', () => {
      expect(() => routeService.findRouteById(999)).toThrow(RouteNotFoundError);
    });
  });

  describe('updateRoute', () => {
    it('should update route properties', () => {
      const route = routeService.createRoute('users');
      const updated = routeService.updateRoute(route.id, { latency: 1000 });
      expect(updated!.latency).toBe(1000);
    });
  });

  describe('deleteRoute', () => {
    it('should delete a route', () => {
      const route = routeService.createRoute('users');
      routeService.deleteRoute(route.id);
      expect(routeService.listRoutes()).toHaveLength(0);
    });

    it('should throw RouteNotFoundError for unknown id', () => {
      expect(() => routeService.deleteRoute(999)).toThrow(RouteNotFoundError);
    });
  });

  describe('wipeAll', () => {
    it('should remove all routes', () => {
      routeService.createRoute('users');
      routeService.createRoute('products');
      routeService.wipeAll();
      expect(routeService.listRoutes()).toHaveLength(0);
    });
  });
});
