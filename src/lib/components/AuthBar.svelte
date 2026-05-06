<script lang="ts">
  import { user, supabase } from '$lib/supabase';
  import AuthModal from './AuthModal.svelte';

  let showModal = false;

  async function logout() {
    await supabase.auth.signOut();
  }
</script>

<style>
  .auth-bar {
    padding: 0.5rem 1rem;
    text-align: right;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
    background: #fff;
  }
  .auth-bar button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .auth-bar button:hover {
    background: #0056b3;
  }
  .auth-bar button.logout {
    background: #6c757d;
  }
  .auth-bar button.logout:hover {
    background: #5a6268;
  }
  .sync-hint {
    color: #28a745;
    margin-right: 0.75rem;
  }
</style>

<div class="auth-bar">
  {#if $user}
    <span style="color: #555;">{$user.email}</span>
    <span class="sync-hint">● Synced</span>
    <button class="logout" on:click={logout}>Log Out</button>
  {:else}
    <button on:click={() => showModal = true}>Log In</button>
  {/if}
</div>

{#if showModal}
  <AuthModal on:close={() => showModal = false} />
{/if}
