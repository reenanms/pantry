import type { FastifyInstance } from 'fastify';
import type { RouteService } from '../services/route-service.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function registerLatencyPlugin(app: FastifyInstance, routeService: RouteService) {
  app.addHook('preHandler', async (request, reply) => {
    const path = extractDynamicPath(request.url);
    if (!path) return;

    const route = routeService.findRouteByPath(path);
    if (!route) return;
    if (route.latency <= 0) return;

    await delay(route.latency);
  });
}

function extractDynamicPath(url: string): string | null {
  const match = url.match(/^\/api\/(.+?)(?:\?.*)?$/);
  if (!match) return null;

  // Strip trailing key segment for resource lookups (e.g., /api/users/123 → users)
  const segments = match[1].split('/');
  return segments[0];
}
