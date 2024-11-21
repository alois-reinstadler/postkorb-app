import { drizzle } from 'drizzle-orm/d1';

import * as table from './schema';

import type { RequestEvent } from '@sveltejs/kit';

export function useDatabase(event: RequestEvent) {
	if (!event.platform?.env?.DB) throw new Error('Missing Database in Platform.env');
	return drizzle(event.platform.env.DB);
}

export { table };

export type Database = ReturnType<typeof useDatabase>;
