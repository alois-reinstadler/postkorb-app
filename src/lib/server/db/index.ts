import { drizzle } from 'drizzle-orm/d1';

import type { RequestEvent } from '@sveltejs/kit';

export const useDatabase = (event: RequestEvent) => {
	if (!event.platform?.env?.d1) throw new Error('Database missing');
	return drizzle(event.platform.env.d1);
};
