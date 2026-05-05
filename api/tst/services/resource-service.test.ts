import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase } from '../../src/db/connection.js';
import { RouteService } from '../../src/services/route-service.js';
import { ResourceService, ResourceNotFoundError } from '../../src/services/resource-service.js';

describe('ResourceService', () => {
  let routeService: RouteService;
  let resourceService: ResourceService;
  let routeId: number;

  beforeEach(() => {
    const { db } = createDatabase(':memory:');
    routeService = new RouteService(db);
    resourceService = new ResourceService(db);

    const route = routeService.createRoute('users');
    routeId = route.id;
  });

  describe('createResource', () => {
    it('should create a resource with provided key', () => {
      const resource = resourceService.createResource(routeId, { id: 'abc', name: 'Alice' }, 'id');
      const data = resource.data as Record<string, unknown>;
      expect(data.id).toBe('abc');
      expect(data.name).toBe('Alice');
    });

    it('should auto-generate key when missing', () => {
      const resource = resourceService.createResource(routeId, { name: 'Bob' }, 'id');
      const data = resource.data as Record<string, unknown>;
      expect(data.id).toBeDefined();
      expect(typeof data.id).toBe('string');
      expect((data.id as string).length).toBe(10);
    });

    it('should auto-generate custom key field when missing', () => {
      const resource = resourceService.createResource(routeId, { name: 'Widget' }, 'sku');
      const data = resource.data as Record<string, unknown>;
      expect(data.sku).toBeDefined();
    });
  });

  describe('listResources', () => {
    it('should return all resources for a route', () => {
      resourceService.createResource(routeId, { name: 'Alice' }, 'id');
      resourceService.createResource(routeId, { name: 'Bob' }, 'id');

      const items = resourceService.listResources(routeId);
      expect(items).toHaveLength(2);
    });
  });

  describe('findResourceByKey', () => {
    it('should find resource by key field value', () => {
      resourceService.createResource(routeId, { id: 'x1', name: 'Alice' }, 'id');
      const found = resourceService.findResourceByKey(routeId, 'id', 'x1');
      const data = found.data as Record<string, unknown>;
      expect(data.name).toBe('Alice');
    });

    it('should throw ResourceNotFoundError for unknown key', () => {
      expect(() => resourceService.findResourceByKey(routeId, 'id', 'nope')).toThrow(ResourceNotFoundError);
    });
  });

  describe('updateResource', () => {
    it('should update resource data and set updatedAt', () => {
      const resource = resourceService.createResource(routeId, { id: 'x1', name: 'Alice' }, 'id');
      const updated = resourceService.updateResource(resource.id, { id: 'x1', name: 'Alice Updated' });
      const data = updated.data as Record<string, unknown>;
      expect(data.name).toBe('Alice Updated');
    });
  });

  describe('deleteResource', () => {
    it('should delete a resource', () => {
      const resource = resourceService.createResource(routeId, { id: 'x1', name: 'Alice' }, 'id');
      resourceService.deleteResource(resource.id);
      expect(resourceService.listResources(routeId)).toHaveLength(0);
    });

    it('should throw ResourceNotFoundError for unknown id', () => {
      expect(() => resourceService.deleteResource(999)).toThrow(ResourceNotFoundError);
    });
  });
});
