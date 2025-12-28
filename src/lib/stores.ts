// src/lib/stores.ts
import { workoutService } from './workoutService';

// This creates a svelte writable store that is managed by our workoutService
export const workouts = workoutService.getWorkouts();

