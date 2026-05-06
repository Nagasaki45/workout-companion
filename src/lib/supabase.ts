import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const user = writable<User | null>(null);

// Initialize from existing session
supabase.auth.getSession().then(({ data: { session } }) => {
	user.set(session?.user ?? null);
});

// Keep store in sync with auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
	user.set(session?.user ?? null);
});
