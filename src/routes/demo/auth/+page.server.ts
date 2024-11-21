import { SessionUtils } from '$lib/server/auth/session';

import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/auth/login');
	}
	return { user: event.locals.user };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}

		const utils = new SessionUtils(event);
		await utils.invalidateSession(event.locals.session.id);
		utils.deleteSessionCookie();

		return redirect(302, '/demo/auth/login');
	}
};
