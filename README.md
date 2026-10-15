# NuroPulse Web Dashboard

The neurologist-facing web dashboard of **NuroPulse**, a companion system for people living with Parkinson's disease and for anyone having problem with hand tremor.

Patients run short tremor checks with the NuroPulse mobile app (nuropulse-mobile). The results are connected via Supabase, so a neurologist can review each patient's tremor measurements over time, next to their medication log.

> NuroPulse is not a diagnostic tool and does not replace a doctor's examination. The dashboard shows what the app measured; the neurologist interprets it.

## Features

| Area | What it does |
| --- | --- | 
| Landing page (`/`) | Public page: what NuroPulse is, how it works, sign-in for doctors
| Sign-up and login (`/register`, `/login`) | Doctor accounts through Supabase Auth; only `role = doctor` may enter
| Dashboard (`/dashboard`) | Patients flagged "Perlu ditinjau", a summary of totals, and patients who have not checked in
| Patients (`/patients`, `/patients/:id`) | Patient list with search and filters; patient detail with tremor tests, medication schedule, and medication log
| Medicines (`/medicines`, `/medicines/:id`) | Shared medicine catalog: browse, search, add
| Profile (`/profile`) | Read-only doctor profile and the doctor's connection code

## Tech stack

- [React Router](https://reactrouter.com/) in framework mode, as a single-page app (`ssr: false`)
- TypeScript (strict)
- [Supabase](https://supabase.com/) (`@supabase/supabase-js`), called from the browser with the anon key; access is enforced by Row Level Security
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com/) (Radix UI), with design tokens in `app/app.css`
- [Lucide](https://lucide.dev/) icons

## Getting started

### Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon or publishable key>
```
### Run

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Restart the dev server after changing `.env`.

## Project structure

```
app/
  components/
    elements/     # Shared app elements: sidebar, status and flag badges, pagination, decorations
    ui/           # shadcn/ui primitives
  lib/            # Supabase client, query client, shared helpers (dates, patient status, medication rules)
  modules/        # One folder per feature: LandingPage, Auth, Dashboard, Patients, Medicines, Profile, NotFound
  routes/         # Route files; each renders a module page
  app.css         # Tailwind setup and design tokens
  root.tsx        # App root and providers
  routes.ts       # Route config
public/assets/    # Images, logo
```

