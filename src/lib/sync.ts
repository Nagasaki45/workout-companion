import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { user, supabase } from './supabase';
import { workouts } from './stores';
import type { WorkoutDefinition } from './types';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;
let lastPushedWorkouts: WorkoutDefinition[] | null = null;

async function deleteStaleRows(userId: string, currentNames: string[]) {
	const { data: existing, error } = await supabase
		.from('workouts')
		.select('id, name')
		.eq('user_id', userId);

	if (error || !existing) return;

	const toDelete = existing.filter((row) => !currentNames.includes(row.name));
	if (toDelete.length === 0) return;

	const { error: delError } = await supabase
		.from('workouts')
		.delete()
		.in(
			'id',
			toDelete.map((r) => r.id)
		);

	if (delError) console.error('Delete stale rows error:', delError);
}

async function upsertWorkouts(userId: string, data: WorkoutDefinition[]) {
	const rows = data.map((w) => ({
		user_id: userId,
		name: w.name,
		data: w,
		updated_at: new Date().toISOString()
	}));

	const { error } = await supabase.from('workouts').upsert(rows, { onConflict: 'user_id,name' });

	if (error) console.error('Upsert error:', error);
}

async function pushWorkouts(workoutsToPush: WorkoutDefinition[]) {
	if (!isSyncing) return;

	const userId = get(user)?.id;
	if (!userId) return;

	// Skip if data hasn't changed since last push
	if (
		lastPushedWorkouts &&
		JSON.stringify(lastPushedWorkouts) === JSON.stringify(workoutsToPush)
	) {
		return;
	}

	await upsertWorkouts(userId, workoutsToPush);
	await deleteStaleRows(
		userId,
		workoutsToPush.map((w) => w.name)
	);

	lastPushedWorkouts = JSON.parse(JSON.stringify(workoutsToPush));
}

function debouncedPush() {
	if (!isSyncing) return;
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		pushWorkouts(get(workouts));
	}, 1000);
}

async function initialPull(userId: string) {
	const [{ data: supaData, error: supaError }, localWorkouts] = await Promise.all([
		supabase.from('workouts').select('name, data, updated_at').eq('user_id', userId),
		get(workouts)
	]);

	if (supaError) {
		console.error('Initial pull error:', supaError);
		return;
	}

	const supaWorkouts = supaData ?? [];
	const merged = new Map<string, WorkoutDefinition>();

	// Local first
	for (const w of localWorkouts) {
		merged.set(w.name, w);
	}
	// Supabase wins on collision
	for (const row of supaWorkouts) {
		merged.set(row.name, row.data as WorkoutDefinition);
	}

	const mergedArray = Array.from(merged.values());
	const needsStoreUpdate = JSON.stringify(mergedArray) !== JSON.stringify(localWorkouts);

	if (needsStoreUpdate) {
		workouts.set(mergedArray);
	}

	// Prevent the store subscriber from triggering a redundant push
	lastPushedWorkouts = JSON.parse(JSON.stringify(mergedArray));
	await upsertWorkouts(userId, mergedArray);
	await deleteStaleRows(userId, mergedArray.map((w) => w.name));
}

// Watch auth state changes
user.subscribe((u) => {
	if (u) {
		isSyncing = true;
		lastPushedWorkouts = null;
		initialPull(u.id);
	} else {
		isSyncing = false;
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		lastPushedWorkouts = null;
	}
});

export function initSync() {
	if (!browser) return;
	workouts.subscribe(() => {
		if (isSyncing) {
			debouncedPush();
		}
	});
}
