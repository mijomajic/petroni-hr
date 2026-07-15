import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' }),
		csrf: {
			trustedOrigins: [
				'https://wallet.test.corvuspay.com',
				'https://wallet.corvuspay.com'
			]
		}
	}
};

export default config;
