import { eq } from 'drizzle-orm';
import { routeConfigs, resources } from '../db/schema.js';
import type { AppDatabase } from '../db/connection.js';

export class RouteService {
  constructor(private db: AppDatabase) {}

  listRoutes() {
    return this.db.select().from(routeConfigs).all();
  }

  findRouteById(id: number) {
    const route = this.db.select().from(routeConfigs).where(eq(routeConfigs.id, id)).get();
    if (!route) throw new RouteNotFoundError(`Route with id ${id} not found`);
    return route;
  }

  findRouteByPath(path: string) {
    return this.db.select().from(routeConfigs).where(eq(routeConfigs.path, path)).get();
  }

  createRoute(path: string, options: Partial<RouteOptions> = {}) {
    const existing = this.findRouteByPath(path);
    if (existing) return existing;

    const result = this.db.insert(routeConfigs).values({
      path,
      keyField: options.keyField ?? 'id',
      latency: options.latency ?? 0,
      staticCode: options.staticCode ?? null,
      isStatic: options.isStatic ?? false,
      staticPayload: options.staticPayload ?? null,
    }).returning().get();

    return result;
  }

  updateRoute(id: number, data: Partial<RouteOptions>) {
    this.findRouteById(id); // throws if not found

    return this.db.update(routeConfigs)
      .set(data)
      .where(eq(routeConfigs.id, id))
      .returning()
      .get();
  }

  deleteRoute(id: number) {
    this.findRouteById(id); // throws if not found
    this.db.delete(routeConfigs).where(eq(routeConfigs.id, id)).run();
  }

  wipeAll() {
    this.db.delete(resources).run();
    this.db.delete(routeConfigs).run();
  }
}

export class RouteNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteNotFoundError';
  }
}

interface RouteOptions {
  keyField: string;
  latency: number;
  staticCode: number | null;
  isStatic: boolean;
  staticPayload: string | null;
}
