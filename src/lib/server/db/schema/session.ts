import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { user } from './user';

export const session = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),

	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

// schema
export const selectSessionSchema = createSelectSchema(session);
export const insertSessionSchema = createInsertSchema(session);

// types
export type Session = typeof selectSessionSchema._type;
export type SessionDTO = typeof insertSessionSchema._type;
