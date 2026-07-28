<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>QFlix</title>
	<meta
		name="description"
		content="No ads. No price hikes. No selling your data. Ever."
	/>
</svelte:head>

{@render children()}
