import type { FastifyInstance } from 'fastify';
import { RouteService } from '../services/route-service.js';
import { ResourceService, ResourceNotFoundError } from '../services/resource-service.js';

export function registerDynamicRoutes(app: FastifyInstance, routeService: RouteService, resourceService: ResourceService) {
  // Catch-all for /api/*
  app.all('/api/*', async (request, reply) => {
    const parsed = parseDynamicUrl(request.url);
    if (!parsed) return reply.code(400).send({ error: 'Invalid API path' });

    const { routePath, resourceKey } = parsed;
    const method = request.method;

    // GET collection or single resource
    if (method === 'GET') {
      return handleGet(routeService, resourceService, routePath, resourceKey, reply);
    }

    // POST — create or auto-provision
    if (method === 'POST') {
      return handlePost(routeService, resourceService, routePath, request.body, reply);
    }

    // PUT / PATCH — update resource
    if (method === 'PUT' || method === 'PATCH') {
      if (!resourceKey) return reply.code(400).send({ error: 'Resource key is required for updates' });
      return handleUpdate(routeService, resourceService, routePath, resourceKey, request.body, reply);
    }

    // DELETE
    if (method === 'DELETE') {
      if (!resourceKey) return reply.code(400).send({ error: 'Resource key is required for deletion' });
      return handleDelete(routeService, resourceService, routePath, resourceKey, reply);
    }

    return reply.code(405).send({ error: 'Method not allowed' });
  });
}

async function handleGet(
  routeService: RouteService,
  resourceService: ResourceService,
  routePath: string,
  resourceKey: string | null,
  reply: any,
) {
  const route = routeService.findRouteByPath(routePath);
  if (!route) return reply.code(404).send({ error: `Route '${routePath}' not found` });

  if (!resourceKey) {
    const items = resourceService.listResources(route.id);
    return items.map((r) => r.data);
  }

  try {
    const item = resourceService.findResourceByKey(route.id, route.keyField, resourceKey);
    return item.data;
  } catch (error) {
    if (error instanceof ResourceNotFoundError) return reply.code(404).send({ error: error.message });
    throw error;
  }
}

async function handlePost(
  routeService: RouteService,
  resourceService: ResourceService,
  routePath: string,
  body: unknown,
  reply: any,
) {
  if (!body || typeof body !== 'object') return reply.code(400).send({ error: 'Request body is required' });

  // Auto-provision: create route if it doesn't exist
  const route = routeService.createRoute(routePath);
  const resource = resourceService.createResource(route.id, body as Record<string, unknown>, route.keyField);

  return reply.code(201).send(resource.data);
}

async function handleUpdate(
  routeService: RouteService,
  resourceService: ResourceService,
  routePath: string,
  resourceKey: string,
  body: unknown,
  reply: any,
) {
  const route = routeService.findRouteByPath(routePath);
  if (!route) return reply.code(404).send({ error: `Route '${routePath}' not found` });
  if (!body || typeof body !== 'object') return reply.code(400).send({ error: 'Request body is required' });

  try {
    const existing = resourceService.findResourceByKey(route.id, route.keyField, resourceKey);
    const merged = { ...(existing.data as Record<string, unknown>), ...(body as Record<string, unknown>) };
    const updated = resourceService.updateResource(existing.id, merged);
    return updated.data;
  } catch (error) {
    if (error instanceof ResourceNotFoundError) return reply.code(404).send({ error: error.message });
    throw error;
  }
}

async function handleDelete(
  routeService: RouteService,
  resourceService: ResourceService,
  routePath: string,
  resourceKey: string,
  reply: any,
) {
  const route = routeService.findRouteByPath(routePath);
  if (!route) return reply.code(404).send({ error: `Route '${routePath}' not found` });

  try {
    const existing = resourceService.findResourceByKey(route.id, route.keyField, resourceKey);
    resourceService.deleteResource(existing.id);
    return reply.code(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) return reply.code(404).send({ error: error.message });
    throw error;
  }
}

interface ParsedDynamicUrl {
  routePath: string;
  resourceKey: string | null;
}

function parseDynamicUrl(url: string): ParsedDynamicUrl | null {
  // Strip query params
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/^\/api\/(.+)$/);
  if (!match) return null;

  const segments = match[1].split('/').filter(Boolean);
  if (segments.length === 0) return null;

  // First segment is the route path, second (if exists) is the resource key
  return {
    routePath: segments[0],
    resourceKey: segments.length > 1 ? segments[1] : null,
  };
}
