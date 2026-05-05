import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { resources } from '../db/schema.js';
import type { AppDatabase } from '../db/connection.js';

export class ResourceService {
  constructor(private db: AppDatabase) {}

  listResources(routeId: number) {
    return this.db.select().from(resources).where(eq(resources.routeId, routeId)).all();
  }

  findResourceById(resourceId: number) {
    const resource = this.db.select().from(resources).where(eq(resources.id, resourceId)).get();
    if (!resource) throw new ResourceNotFoundError(`Resource with id ${resourceId} not found`);
    return resource;
  }

  findResourceByKey(routeId: number, keyField: string, keyValue: string) {
    const allResources = this.db
      .select()
      .from(resources)
      .where(eq(resources.routeId, routeId))
      .all();

    const match = allResources.find((r) => {
      const data = r.data as Record<string, unknown>;
      return String(data[keyField]) === String(keyValue);
    });

    if (!match) throw new ResourceNotFoundError(`Resource with ${keyField}=${keyValue} not found`);
    return match;
  }

  createResource(routeId: number, data: Record<string, unknown>, keyField: string) {
    const enrichedData = injectKeyIfMissing(data, keyField);

    return this.db.insert(resources).values({
      routeId,
      data: enrichedData,
    }).returning().get();
  }

  updateResource(resourceId: number, data: Record<string, unknown>) {
    this.findResourceById(resourceId); // throws if not found

    return this.db.update(resources)
      .set({
        data,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(resources.id, resourceId))
      .returning()
      .get();
  }

  deleteResource(resourceId: number) {
    this.findResourceById(resourceId); // throws if not found
    this.db.delete(resources).where(eq(resources.id, resourceId)).run();
  }
}

function injectKeyIfMissing(data: Record<string, unknown>, keyField: string): Record<string, unknown> {
  if (data[keyField] !== undefined) return data;

  return {
    ...data,
    [keyField]: nanoid(10),
  };
}

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}
