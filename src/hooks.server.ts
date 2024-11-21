import { i18n } from '$lib/i18n';
import { SessionUtils } from '$lib/server/auth/session';
import { useDatabase } from '$lib/server/db';

import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import type { Handle } from '@sveltejs/kit';

const handleDatabase: Handle = ({ event, resolve }) => {
	event.locals.db = useDatabase(event);
	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const utils = new SessionUtils(event);
	const sessionId = utils.getSessionid();

	if (!sessionId) {
		if (event.route.id?.startsWith('/(app)')) return redirect(302, '/login');

		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await utils.validateSession(sessionId);

	if (session) {
		if (event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/sign-up'))
			return redirect(302, '/app');
		utils.setSessionCookie(session);
	} else {
		utils.deleteSessionCookie();
		if (event.url.pathname.startsWith('/app')) return redirect(302, '/login');
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

const handleParaglide: Handle = i18n.handle();

export const handle: Handle = sequence(handleParaglide, handleDatabase);
