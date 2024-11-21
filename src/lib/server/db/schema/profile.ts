import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { user } from './user';

export const profile = sqliteTable('profiles', {
	id: text('id').primaryKey(),
	email: text('email').notNull(),

	alias: text('alias').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),

	role: text('role'),
	organization: text('organization'),

	avatar: text('avatar'), // size 96x96
	phone: text('phone'),

	updatedAt: integer('updated_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const profileRelations = relations(profile, ({ one }) => ({
	user: one(user, {
		fields: [profile.userId],
		references: [user.id]
	})
}));

// schema
export const selectProfileSchema = createSelectSchema(profile);
export const insertProfileSchema = createInsertSchema(profile, {
	email: (schema) => schema.email.email(),
	alias: (schema) => schema.alias.min(3).max(32),
	role: (schema) => schema.role.min(3).max(32),
	organization: (schema) => schema.organization.min(3).max(32),
	avatar: (schema) => schema.avatar.url()
	// phone: (schema) => schema.phone()
});

// types
export type Profile = typeof selectProfileSchema._type;
export type ProfileDTO = typeof insertProfileSchema._type;
