<script lang="ts">
  import { page } from '$app/stores';
  import { workouts } from '$lib/stores';
  import { goto } from '$app/navigation';
  import type { WorkoutDefinition } from '$lib/types';
  import jsyaml from 'js-yaml';
  import { onMount } from 'svelte';

  let workout: WorkoutDefinition | undefined;
  let yamlText = '';
  let originalName = '';

  onMount(() => {
    const slug = $page.params.slug;
    if (slug) {
      originalName = decodeURIComponent(slug);
      workout = $workouts.find(w => w.name === originalName);
      if (workout) {
        const yamlObject = { workouts: [workout] };
        yamlText = jsyaml.dump(yamlObject, { indent: 2 });
      } else {
        goto('/');
      }
    } else {
      goto('/');
    }
  });

  function saveWorkout() {
    try {
      const data = jsyaml.load(yamlText) as { workouts: WorkoutDefinition[] };
      if (!data || !data.workouts || !Array.isArray(data.workouts) || data.workouts.length !== 1) {
        alert('Invalid YAML format: Expected an object with a "workouts" array containing a single workout.');
        return;
      }

      const updatedWorkout = data.workouts[0];

      workouts.update(currentWorkouts => {
        const workoutMap = new Map(currentWorkouts.map(w => [w.name, w]));
        
        if (originalName !== updatedWorkout.name) {
            workoutMap.delete(originalName);
        }

        workoutMap.set(updatedWorkout.name, updatedWorkout);

        return Array.from(workoutMap.values());
      });

      goto(`/workout/${encodeURIComponent(updatedWorkout.name)}`);
    } catch (e: any) {
      alert(`Invalid YAML format: ${e.message}`);
    }
  }
</script>

<style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: sans-serif;
  }
  h1 {
    color: #333;
    margin-bottom: 1rem;
  }
  textarea {
    width: 100%;
    height: 400px;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: monospace;
  }
  .actions {
    display: flex;
    gap: 1rem;
  }
  button, .button {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }
  button:hover, .button:hover {
    background-color: #0056b3;
  }
  .button-cancel {
    background-color: #6c757d;
  }
  .button-cancel:hover {
    background-color: #5a6268;
  }
</style>

<div class="container">
  <h1>Edit {originalName} (YAML)</h1>

  <textarea bind:value={yamlText}></textarea>

  <div class="actions">
    <button on:click={saveWorkout}>Save Changes</button>
    <a href="/workout/{encodeURIComponent(originalName)}" class="button button-cancel">Cancel</a>
  </div>
</div>
