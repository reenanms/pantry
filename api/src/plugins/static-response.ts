import type { FastifyInstance } from 'fastify';
import type { RouteService } from '../services/route-service.js';

export function registerStaticResponsePlugin(app: FastifyInstance, routeService: RouteService) {
  app.addHook('preHandler', async (request, reply) => {
    const path = extractDynamicPath(request.url);
    if (!path) return;

    const route = routeService.findRouteByPath(path);
    if (!route) return;
    if (!route.isStatic) return;

    const statusCode = route.staticCode ?? 200;
    const payload = parseStaticPayload(route.staticPayload);

    reply.code(statusCode).send(payload);
  });
}

function extractDynamicPath(url: string): string | null {
  const match = url.match(/^\/api\/(.+?)(?:\/.*)?(?:\?.*)?$/);
  if (!match) return null;
  return match[1].split('/')[0];
}

function parseStaticPayload(payload: string | null): unknown {
  if (!payload) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}
