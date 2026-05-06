<script lang="ts">
	import AuthBar from '$lib/components/AuthBar.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<AuthBar />

{@render children()}
