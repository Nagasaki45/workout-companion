# Phase 2: Firebase Sync Implementation Plan

## 1. Objective

Integrate Firebase to provide optional user authentication and data synchronization across multiple devices. The application must remain fully functional offline, using local storage as the source of truth when a user is not logged in or is offline.

## 2. Key Principles

- **Offline-First:** The app must work without a network connection. All data will be stored locally.
- **Optional Login:** Users can use the application without creating an account.
- **Data Synchronization:** Logged-in users will have their workout data synced with Firestore.
- **Conflict Resolution:** A clear strategy to merge local and remote data on login. The last-write-wins based on a timestamp will be the initial approach.

## 3. Implementation Steps

### Step 1: Firebase Project Setup

1.  **Create Firebase Project:** Set up a new project in the Firebase console.
2.  **Install Firebase SDK:** Add the Firebase client-side SDK to the project.
    ```bash
    npm install firebase
    ```
3.  **Initialize Firebase:**
    - Create a new file `src/lib/firebase.ts` to configure and initialize the Firebase app.
    - Store Firebase configuration in environment variables for security (using SvelteKit's environment variable handling).

### Step 2: Authentication

1.  **Auth UI:**
    - Add "Login" and "Logout" buttons to the main layout (`src/routes/+layout.svelte`).
    - Display user information (e.g., name or email) when logged in.
2.  **Auth Store:**
    - Create a new Svelte store `src/lib/authStore.ts` to manage the user's authentication state (`uid`, `email`, logged-in status).
    - This store will wrap Firebase's `onAuthStateChanged` to provide a reactive user object to the rest of the application.
3.  **Authentication Logic:**
    - Implement authentication using a provider (e.g., Google Authentication) in `src/lib/authStore.ts`.
    - Provide functions for `login()` and `logout()`.

### Step 3: Data Storage & Sync Service

1.  **Firestore Data Model:**
    - Design the data structure in Firestore.
    - A top-level collection named `users`.
    - Each document in `users` will have the `uid` of the user as its ID.
    - Inside each user document, a sub-collection named `workouts` will store the workout data.
2.  **Data Service (`workoutService.ts`):**
    - Create a central service at `src/lib/workoutService.ts` to abstract all data operations (CRUD for workouts).
    - This service will be the single point of interaction for workout data.
    - It will intelligently interact with both local storage and Firestore based on the user's auth state and network status.
3.  **Synchronization Logic:**
    - **On App Load:**
        - If logged out, `workoutService` will load data from local storage.
        - If logged in, `workoutService` will use Firestore as the primary source, leveraging its offline cache.
    - **On Login:**
        - A sync function will be triggered.
        - It will fetch all workouts from Firestore.
        - It will read all workouts from local storage.
        - It will merge the two sets of data. A simple "last modified" timestamp on each workout object will be used to resolve conflicts (last write wins).
        - The merged data will be written back to both Firestore and local storage.
    - **On Data Modification (while logged in):**
        - All create, update, and delete operations will go through the `workoutService`.
        - The service will update the data in local storage immediately for a fast UI response.
        - It will then write the changes to Firestore. Firestore's offline persistence will automatically handle syncing when the connection is restored.

### Step 4: Refactor Existing Code

1.  **Update `stores.ts`:**
    - The existing `workouts` store in `src/lib/stores.ts` will be refactored.
    - Instead of directly interacting with local storage, it will use the new `workoutService` to fetch and update data.
2.  **Update Components:**
    - All Svelte components that currently interact with the `workouts` store or local storage will be reviewed.
    - They should not need significant changes if they correctly use the Svelte store, as the store's interface will remain consistent.

### Step 5: UI/UX Enhancements

1.  **Sync Status:**
    - Add a visual indicator in the UI to show the current data sync status (e.g., "Synced", "Syncing...", "Offline").
2.  **Login Flow:**
    - The login process should be smooth. After a user logs in, their data should appear automatically after the sync is complete.
