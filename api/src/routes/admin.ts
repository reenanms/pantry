import type { FastifyInstance } from 'fastify';
import { RouteService, RouteNotFoundError } from '../services/route-service.js';
import { clearLogEntries, getLogEntries } from '../services/request-log.js';

export function registerAdminRoutes(app: FastifyInstance, routeService: RouteService) {
  // List all routes
  app.get('/admin/routes', async () => {
    return routeService.listRoutes();
  });

  // Get a single route
  app.get('/admin/routes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      return routeService.findRouteById(Number(id));
    } catch (error) {
      if (error instanceof RouteNotFoundError) return reply.code(404).send({ error: error.message });
      throw error;
    }
  });

  // Create a route (manual / static)
  app.post('/admin/routes', async (request, reply) => {
    const body = request.body as {
      path: string;
      keyField?: string;
      latency?: number;
      staticCode?: number;
      isStatic?: boolean;
      staticPayload?: string;
    };

    if (!body.path) return reply.code(400).send({ error: 'path is required' });

    const route = routeService.createRoute(body.path, body);
    return reply.code(201).send(route);
  });

  // Update a route
  app.put('/admin/routes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    try {
      const updated = routeService.updateRoute(Number(id), body);
      return updated;
    } catch (error) {
      if (error instanceof RouteNotFoundError) return reply.code(404).send({ error: error.message });
      throw error;
    }
  });

  // Delete a route
  app.delete('/admin/routes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      routeService.deleteRoute(Number(id));
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof RouteNotFoundError) return reply.code(404).send({ error: error.message });
      throw error;
    }
  });

  // Wipe all data
  app.post('/admin/wipe', async (_request, reply) => {
    routeService.wipeAll();
    clearLogEntries();
    return reply.code(200).send({ message: 'All data wiped successfully' });
  });

  // Get request logs
  app.get('/admin/logs', async () => {
    return getLogEntries();
  });
}
