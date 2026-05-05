import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Route Configuration Table
export const routeConfigs = sqliteTable('route_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(),
  keyField: text('key_field').notNull().default('id'),
  latency: integer('latency').notNull().default(0),
  staticCode: integer('static_code'),
  isStatic: integer('is_static', { mode: 'boolean' }).notNull().default(false),
  staticPayload: text('static_payload'),
}, (table) => ({
  pathIdx: uniqueIndex('path_idx').on(table.path),
}));

// Resources (JSON Data) Table
export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routeId: integer('route_id')
    .notNull()
    .references(() => routeConfigs.id, { onDelete: 'cascade' }),
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
