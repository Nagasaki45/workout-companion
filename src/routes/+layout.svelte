<script lang="ts">
	import { user } from '$lib/authStore';
	import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	let { children } = $props();

	const login = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	};

	const logout = () => {
		signOut(auth);
	};
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<header>
	<h1>💪 Workout companion</h1>
	<nav>
		{#if $user}
			<button onclick={logout} title="{$user.email}">Logout</button>
		{:else if $user === null}
			<button onclick={login}>Login</button>
		{/if}
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #ccc;
		font-family: sans-serif;
	}

	h1 {
		margin: 0;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
</style>
