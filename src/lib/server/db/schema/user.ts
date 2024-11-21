import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { profile } from './profile';
import { session } from './session';

export const user = sqliteTable('users', {
	id: text('id').primaryKey(),

	username: text('username').notNull().unique(),
	password: text('password').notNull(),

	phone: text('phone'),
	avatar: text('avatar'),

	updatedAt: integer('updated_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	profiles: many(profile)
}));

// schema
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user, {
	username: (schema) => schema.username.min(3).max(32),
	password: (schema) => schema.password.min(8).max(64),
	avatar: (schema) => schema.avatar.url()
});

// types
export type User = typeof selectUserSchema._type;
export type UserDTO = typeof insertUserSchema._type;
