import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// starhold.fyi: Starlight, reskinned onto the shared Starhold fleet design system
// (STAR-27 spec §2). Token copies under src/styles/fleet/ are written by
// `node brand/check-drift.mjs --write` and are never edited here.
// STAR-152: retired pages. Astro writes these as meta-refresh stubs; the real 301s
// live in deploy/Caddyfile.vps (starhold.fyi block), which is what visitors hit.
// The qnix sources are kept in git under _drafts/qnix and are not built.
export default defineConfig({
	site: 'https://starhold.fyi',
	redirects: {
		'/qnix': 'https://starhold.dev/qnix',
		'/qnix/architecture': 'https://starhold.dev/qnix',
		'/qnix/build-chronicle': 'https://starhold.dev/qnix',
		'/qnix/hosting': 'https://starhold.dev/qnix',
		'/qnix/tenancy-security': 'https://starhold.dev/qnix',
		'/bots/features': '/',
		'/bots/ordering': '/'
	},
	integrations: [
		starlight({
			title: 'Starhold docs',
			favicon: '/favicon.svg',
			// Load order matters: tokens → fleet map → site accent → the Starlight map,
			// which pulls fleet-base.css and fyi.css into the sh.site cascade layer.
			customCss: [
				'./src/styles/fleet/fleet-tokens.css',
				'./src/styles/fleet/fleet-map.css',
				'./src/styles/fleet/accent.css',
				'./src/styles/starlight-map.css'
			],
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				Header: './src/components/Header.astro',
				Hero: './src/components/Hero.astro',
				Footer: './src/components/Footer.astro',
				Sidebar: './src/components/Sidebar.astro'
			},
			head: [
				// The one font file (B2). Preloaded because the header wordmark uses it on every page.
				{
					tag: 'link',
					attrs: { rel: 'preload', href: '/fonts/michroma-latin.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }
				},
				{ tag: 'meta', attrs: { name: 'color-scheme', content: 'dark' } }
			],
			expressiveCode: {
				themes: ['github-dark'],
				styleOverrides: {
					borderColor: 'var(--border)',
					borderRadius: 'var(--radius-md)',
					codeBackground: 'var(--bg-raised)',
					frames: {
						editorTabBarBackground: 'var(--surface-2)',
						terminalTitlebarBackground: 'var(--surface-2)'
					}
				}
			},
			sidebar: [
				{ label: 'Start here', link: '/' },
				// STAR-134: one page per hosted service, state and privacy defaults first.
				{ label: 'Services', items: [{ autogenerate: { directory: 'services' } }] },
				{ label: 'Shush', items: [{ autogenerate: { directory: 'shushgame' } }] },
				{ label: 'Open Source', items: [{ autogenerate: { directory: 'open-source' } }] },
				// Q8: "Mission Log" renamed. Slugs unchanged.
				{ label: 'Build log', items: [{ autogenerate: { directory: 'log' } }] }
			]
		})
	]
});
