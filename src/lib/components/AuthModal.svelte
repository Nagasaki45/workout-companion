<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ close: void }>();

  let mode: 'login' | 'signup' | 'forgot' = 'login';
  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';
  let successMsg = '';

  async function handleSubmit() {
    errorMsg = '';
    successMsg = '';
    loading = true;

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) errorMsg = error.message;
      else dispatch('close');
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) errorMsg = error.message;
      else successMsg = 'Check your email to confirm your account!';
    } else {
      // forgot
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) errorMsg = error.message;
      else successMsg = 'Password reset email sent!';
    }

    loading = false;
  }
</script>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
  }
  .modal {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
    margin-bottom: 0.75rem;
  }
  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }
  button[type="submit"]:hover {
    background: #0056b3;
  }
  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .error {
    color: #dc3545;
    margin-bottom: 0.75rem;
  }
  .success {
    color: #28a745;
    margin-bottom: 0.75rem;
  }
  .mode-switch {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #555;
  }
  .mode-switch button {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    text-decoration: underline;
  }
  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #555;
  }
  .modal-wrapper {
    position: relative;
  }
</style>

<div class="modal-backdrop" role="button" tabindex="0" aria-label="Close" on:click={() => dispatch('close')} on:keypress={(e) => e.key === 'Enter' && dispatch('close')}>
  <div class="modal-wrapper" on:click|stopPropagation>
    <button class="close-btn" on:click={() => dispatch('close')}>×</button>
    <div class="modal" role="dialog" aria-modal="true">
      {#if mode === 'login'}
        <h2>Log In</h2>
      {:else if mode === 'signup'}
        <h2>Sign Up</h2>
      {:else}
        <h2>Reset Password</h2>
      {/if}

      {#if errorMsg}
        <div class="error">{errorMsg}</div>
      {/if}
      {#if successMsg}
        <div class="success">{successMsg}</div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <input type="email" bind:value={email} placeholder="Email" required />
        {#if mode !== 'forgot'}
          <input type="password" bind:value={password} placeholder="Password" required />
        {/if}
        <button type="submit" disabled={loading}>
          {#if loading}
            Please wait...
          {:else if mode === 'login'}
            Log In
          {:else if mode === 'signup'}
            Sign Up
          {:else}
            Send Reset Link
          {/if}
        </button>
      </form>

      <div class="mode-switch">
        {#if mode === 'login'}
          <button on:click={() => mode = 'signup'}>Need an account? Sign up</button>
          &nbsp;·&nbsp;
          <button on:click={() => mode = 'forgot'}>Forgot password?</button>
        {:else if mode === 'signup'}
          <button on:click={() => mode = 'login'}>Already have an account? Log in</button>
        {:else}
          <button on:click={() => mode = 'login'}>Back to log in</button>
        {/if}
      </div>
    </div>
  </div>
</div>
