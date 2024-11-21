import { defineConfig } from 'vite';

import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	ssr: {
		noExternal: ['oslo', '@node-rs/argon2', '@node-rs/bcrypt']
	},

	optimizeDeps: {
		exclude: ['@node-rs/argon2', '@node-rs/bcrypt']
	}
});
