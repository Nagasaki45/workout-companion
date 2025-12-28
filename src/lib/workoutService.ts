// src/lib/workoutService.ts
import { writable, get } from 'svelte/store';
import type { WorkoutDefinition } from './types';
import { db } from './firebase';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  writeBatch,
  enableIndexedDbPersistence,
  Timestamp
} from 'firebase/firestore';
import { user } from './authStore';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one.
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the
    // features required to enable persistence
  }
});

const workoutStore = writable<WorkoutDefinition[]>([]);
const LOCAL_STORAGE_KEY = 'user-workouts';

const getFromLocalStorage = (): WorkoutDefinition[] => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveToLocalStorage = (workouts: WorkoutDefinition[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workouts));
};

const getFromFirestore = async (uid: string): Promise<WorkoutDefinition[]> => {
  const querySnapshot = await getDocs(collection(db, 'users', uid, 'workouts'));
  return querySnapshot.docs.map((doc) => doc.data() as WorkoutDefinition);
};

const saveToFirestore = async (uid: string, workouts: WorkoutDefinition[]) => {
  const batch = writeBatch(db);
  workouts.forEach((workout) => {
    const docRef = doc(db, 'users', uid, 'workouts', workout.name);
    batch.set(docRef, workout);
  });
  await batch.commit();
};

const sync = async (uid: string) => {
  const localWorkouts = getFromLocalStorage();
  const remoteWorkouts = await getFromFirestore(uid);

  const mergedWorkouts = [...localWorkouts];

  remoteWorkouts.forEach((remoteWorkout) => {
    const localIndex = mergedWorkouts.findIndex((w) => w.name === remoteWorkout.name);
    if (localIndex === -1) {
      mergedWorkouts.push(remoteWorkout);
    } else {
      const local = mergedWorkouts[localIndex];
      const remoteTime = (remoteWorkout.lastModified as Timestamp)?.toDate().getTime() || 0;
      const localTime = (local.lastModified as number) || 0;

      if (remoteTime > localTime) {
        mergedWorkouts[localIndex] = remoteWorkout;
      }
    }
  });

  workoutStore.set(mergedWorkouts);
  await saveToFirestore(uid, mergedWorkouts);
};

user.subscribe(async ($user) => {
  if ($user) {
    await sync($user.uid);
  } else {
    workoutStore.set(getFromLocalStorage());
  }
});

workoutStore.subscribe((workouts) => {
  saveToLocalStorage(workouts);
  const $user = get(user);
  if ($user) {
    saveToFirestore($user.uid, workouts);
  }
});

const getWorkouts = () => {
  return workoutStore;
};

const addWorkout = (workout: WorkoutDefinition) => {
  const now = Timestamp.now();
  workout.lastModified = now;
  workoutStore.update((workouts) => [...workouts, workout]);
};

const updateWorkout = (name: string, updatedWorkout: WorkoutDefinition) => {
  const now = Timestamp.now();
  updatedWorkout.lastModified = now;
  workoutStore.update((workouts) =>
    workouts.map((w) => (w.name === name ? updatedWorkout : w))
  );
};

const deleteWorkout = (name: string) => {
  workoutStore.update((workouts) => workouts.filter((w) => w.name !== name));
};

export const workoutService = {
  getWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  sync,
};
