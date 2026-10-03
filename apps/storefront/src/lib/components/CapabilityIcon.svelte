<script lang="ts">
	// Original 24px stroke icons, one per capability. Drawn on a 24x24 grid with
	// currentColor so the icon chip (not this file) decides the colour. They are
	// decorative: the tile's heading already names the capability, so the SVG is
	// hidden from assistive tech rather than announced twice.
	let { name }: { name: 'automation' | 'platform' | 'bots' | 'fullstack' } = $props();
</script>

<svg
	class="icon"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	{#if name === 'automation'}
		<!-- flow: a step, a branch, a step -->
		<rect x="3" y="4" width="7" height="5" rx="1.5" />
		<rect x="14" y="15" width="7" height="5" rx="1.5" />
		<path d="M10 6.5h2.5a2.5 2.5 0 0 1 2.5 2.5v3" />
		<path d="M12.5 12.5 15 15l2.5-2.5" />
		<path d="M6.5 15v5M4 17.5h5" />
	{:else if name === 'platform'}
		<!-- server stack -->
		<rect x="3" y="4" width="18" height="6" rx="2" />
		<rect x="3" y="14" width="18" height="6" rx="2" />
		<path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
	{:else if name === 'bots'}
		<!-- chat bubble with a face -->
		<path d="M5 4.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6.5L8 21v-3.5H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
		<path d="M9 10h.01M15 10h.01" />
		<path d="M9.5 13.2c.7.6 1.5.9 2.5.9s1.8-.3 2.5-.9" />
	{:else}
		<!-- three layers -->
		<path d="m12 2.5 9 5-9 5-9-5 9-5z" />
		<path d="m3 12 9 5 9-5" />
		<path d="m3 16.5 9 5 9-5" />
	{/if}
</svg>

<style>
	.icon {
		width: var(--icon);
		height: var(--icon);
		display: block;
	}
</style>
