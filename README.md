# 💪 Workout companion

This is a SvelteKit application designed to help you manage and execute your workouts. Define your workout routines using a structured YAML format, and the app will guide you through each step with timers and progress tracking. It even includes a handy prompt to help you convert your free-text workout plans into the required YAML structure using an AI!

## 🏗 Architecture Overview

The app is **local-first**: your workout data lives in `localStorage` by default. An **optional Supabase login** enables cross-device sync. When logged in, workouts are synced to a cloud PostgreSQL database via Row Level Security (RLS) policies, so only you can read or write your own data.

## 🏗 Backend / Database Setup

This app uses [Supabase](https://supabase.com/) for authentication and cross-device sync. You need a Supabase project for both **local development** and **production**.

### 1. Create a Supabase project

1. Go to https://supabase.com and sign up/log in.
2. Create a new project (free tier).
3. Note your **Project URL** and **anon/public API key**.

### 2. Create the database table and RLS policy

In the Supabase dashboard, go to **SQL Editor → New query** and run:

```sql
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own workouts"
  ON workouts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. Configure Authentication URLs

Go to **Authentication → URL Configuration** and set:

| Environment | Site URL | Redirect URLs |
|---|---|---|
| **Dev** | `http://localhost:5173/` | `http://localhost:5173/**` |
| **Prod** | `https://workout-companion.leverstone.me/` | `https://workout-companion.leverstone.me/**` |

Also enable **Email** as a provider under **Authentication → Providers**.

### 4. Set up environment variables

Copy `.env.example` to `.env` and fill in the values for your **dev** project:

```bash
cp .env.example .env
```

```
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_...
```

`.env` is gitignored for security. Production builds pull these values from **GitHub Environment Secrets**, not from this file.

## 🚀 Getting Started (Local Development)

```bash
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## 📦 Deployment

This project is configured for continuous deployment to GitHub Pages using GitHub Actions.

### GitHub Environments & Secrets

Two [GitHub Environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment) are used:

| Environment | Used by | Purpose |
|---|---|---|
| `development` | Test job | Provides Supabase credentials to the `npm run dev` server so Playwright E2E tests can start the app without hanging |
| `production` | Build & Deploy job | Provides Supabase credentials for the production build deployed to GitHub Pages |

Set up each environment under **Settings → Environments → New environment** and add these secrets:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The `production` environment should point to your **production** Supabase project. The `development` environment can point to the **same** dev project you use locally, or a separate one.

### Dev / Prod database separation

To keep prod data clean, create a **second** Supabase project for production and repeat the SQL + URL configuration steps above. Your local `.env` and the `development` GitHub Environment point to the dev project; the `production` GitHub Environment points to the prod project.
