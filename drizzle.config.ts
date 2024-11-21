import type { Config } from 'drizzle-kit';

export default {
	dialect: 'sqlite',
	schema: './src/lib/server/schema.ts',
	out: './migrations'
} satisfies Config;
