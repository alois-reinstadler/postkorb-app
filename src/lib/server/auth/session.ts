import { dev } from '$app/environment';
import { table } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';

import type { RequestEvent } from '@sveltejs/kit';
import type { Database } from '$lib/server/db';

export class SessionUtils {
	#event: RequestEvent;
	#db: Database;

	static DAY_IN_MS = 1000 * 60 * 60 * 24;
	static sessionCookieName = 'auth-session';

	static generateToken(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(20));
		return encodeBase32LowerCaseNoPadding(bytes);
	}

	static getSessionid(event: RequestEvent) {
		return event.cookies.get(SessionUtils.sessionCookieName);
	}

	static setSessionCookie(event: RequestEvent, session: table.Session) {
		event.cookies.set(SessionUtils.sessionCookieName, session.id, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev
		});
	}

	static deleteSessionCookie(event: RequestEvent) {
		event.cookies.delete(SessionUtils.sessionCookieName, { path: '/' });
	}

	constructor(event: RequestEvent) {
		this.#db = event.locals.db;
		this.#event = event;
	}

	getSessionid() {
		return this.#event.cookies.get(SessionUtils.sessionCookieName);
	}

	setSessionCookie(session: table.Session) {
		this.#event.cookies.set(SessionUtils.sessionCookieName, session.id, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev
		});
	}

	deleteSessionCookie() {
		this.#event.cookies.delete(SessionUtils.sessionCookieName, { path: '/' });
	}

	async createSession(userId: string) {
		const token = SessionUtils.generateToken();
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

		const session: table.Session = {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + SessionUtils.DAY_IN_MS * 30)
		};

		await this.#db.insert(table.session).values(session);
		return session;
	}

	async invalidateSession(sessionId: string) {
		await this.#db.delete(table.session).where(eq(table.session.id, sessionId));
	}

	async validateSession(sessionId: string) {
		const [result] = await this.#db
			.select({
				// Adjust user table here to tweak returned data
				user: { id: table.user.id, username: table.user.username },
				session: table.session
			})
			.from(table.session)
			.innerJoin(table.user, eq(table.session.userId, table.user.id))
			.where(eq(table.session.id, sessionId));

		if (!result) {
			return { session: null, user: null };
		}

		const { session, user } = result;
		const sessionExpired = Date.now() >= session.expiresAt.getTime();

		if (sessionExpired) {
			await this.#db.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		const renewSession = Date.now() >= session.expiresAt.getTime() - SessionUtils.DAY_IN_MS * 15;

		if (renewSession) {
			session.expiresAt = new Date(Date.now() + SessionUtils.DAY_IN_MS * 30);
			await this.#db
				.update(table.session)
				.set({ expiresAt: session.expiresAt })
				.where(eq(table.session.id, session.id));
		}

		return { session, user };
	}
}

export type SessionValidationResult = Awaited<ReturnType<SessionUtils['validateSession']>>;
