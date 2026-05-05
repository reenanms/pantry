import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { createDatabase } from './db/connection.js';
import { RouteService } from './services/route-service.js';
import { ResourceService } from './services/resource-service.js';
import { addLogEntry } from './services/request-log.js';
import { registerLatencyPlugin } from './plugins/latency.js';
import { registerStaticResponsePlugin } from './plugins/static-response.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerDynamicRoutes } from './routes/dynamic.js';

export function buildServer(dbPath?: string) {
  const app = Fastify({ logger: true });
  const { db } = createDatabase(dbPath);

  const routeService = new RouteService(db);
  const resourceService = new ResourceService(db);

  // Plugins
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve frontend static files in production (Docker)
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(currentDir, '..', 'public');

  if (existsSync(publicDir)) {
    app.register(fastifyStatic, {
      root: publicDir,
      prefix: '/admin/',
      decorateReply: false,
    });
  }

  // Simulation hooks (must be registered before routes)
  registerStaticResponsePlugin(app, routeService);
  registerLatencyPlugin(app, routeService);

  // Routes
  registerAdminRoutes(app, routeService);
  registerDynamicRoutes(app, routeService, resourceService);

  // Request logging
  app.addHook('onResponse', async (request, reply) => {
    addLogEntry({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: Math.round(reply.elapsedTime),
    });
  });

  // Reject everything outside /admin and /api
  app.setNotFoundHandler(async (_request, reply) => {
    return reply.code(404).send({ error: 'Not found. Pantry only serves /admin/* and /api/*' });
  });

  return app;
}
