import { SessionUtils } from '$lib/server/auth/session';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/demo/lucia');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const db = event.locals.db;
		const formData = await event.request.formData();
		const validation = table.selectUserSchema.safeParse(Object.fromEntries(formData.entries()));

		if (!validation.success) return fail(400);

		const { data } = validation;
		const [existingUser] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, data.username));

		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await verify(existingUser.password, data.password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const utils = new SessionUtils(event);
		const session = await utils.createSession(existingUser.id);
		utils.setSessionCookie(session);

		return redirect(302, '/u/0');
	},
	register: async (event) => {
		const db = event.locals.db;
		const formData = await event.request.formData();
		const validation = table.insertUserSchema.safeParse(Object.fromEntries(formData.entries()));

		if (!validation.success) return fail(400);

		const { data } = validation;

		const userId = generateUserId();
		const passwordHash = await hash(data.password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			await db.insert(table.user).values({
				id: userId,
				username: data.username,
				password: passwordHash,
				createdAt: new Date(Date.now())
			});
			const utils = new SessionUtils(event);

			const session = await utils.createSession(userId);
			utils.setSessionCookie(session);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/u/0');
	}
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
