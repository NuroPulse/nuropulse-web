# CLAUDE.md — NuroPulse Web Dashboard

Guidance for Claude Code (and any contributor) working in this repository. Read this fully before writing code. When a decision here changes, update this file in the same change.

Status: draft v0.3 (2026-10-16).

### Changelog

- **v0.3 (2026-10-16)**
  - Flags and both compliance measures are computed on the web when the data is read, from the backend's measurement `status` and the medication log; nothing is stored (Section 10). Helpers in `lib/patient-status.ts` and `lib/medication.ts`.
  - Patient lists are filtered and paginated in the browser after loading the doctor's patients, because flags and compliance are not in the database (Section 9).
  - The Patients module exports `useMyPatients`, shared by Daftar Pasien and the Dashboard overview (Section 6). The overview reads Supabase; `lib/sample-data.ts` is no longer used but kept.
  - Vitest is installed; `npm test` runs the helper tests (Sections 5, 13).
- **v0.2 (2026-10-15)**
  - Doctor sign-up now asks for a phone number (WhatsApp), sent as `phone` in the sign-up metadata; `phone` is required for patients and doctors (Sections 2, 3, 4, 9, 10).
  - New "Visual style" subsection in Section 7: follow the mobile app (light surfaces, cards, sparing blue, green accents, status boxes, shared decorations).
  - Section 8: wording for sign-up, login, the sidebar, and the Profile page; the connection code card is titled "Kode koneksi Anda".
  - Section 13: `npm run gen:types` to regenerate the Supabase types.
  - Open: the generated schema differs from Section 4 (for example `profiles.phone` instead of `phone_number`, plus `doctor_details` and `patient_details`); Section 4 is updated once the team decides.
- **v0.1 (2026-10-14):** first draft.

---

## 1. What this project is

NuroPulse is a companion system for people living with Parkinson's disease and for anyone worried about a hand tremor. This repository is the **neurologist-facing web dashboard**. Its backend is Supabase. The patient-facing Flutter app lives in a separate repository.

How the system fits together:

1. **Screening (mobile, before diagnosis).** The patient app is used by a community health worker (kader) or by a person on their own. It runs an FFT-based tremor analysis of the phone's accelerometer **on the device** and reports a simple result.
2. **Monitoring (mobile → web, after diagnosis).** The patient does short periodic check-ins (about 10–15 s) aligned with their medication schedule. Each result is uploaded automatically and appears on this dashboard.
3. **This dashboard.** The neurologist reviews, per patient, long-term quantitative tremor data instead of relying on the patient's subjective memory. The goal is to help the neurologist notice patterns relative to medication timing.

This dashboard is **not a medical device and never gives a diagnosis**. It presents measurements; the neurologist interprets them. See Section 2.

Source of truth for data shapes: the **NuroPulse Data Contract** (Google Doc: https://docs.google.com/document/d/1OKP_CYbWHBk-w0SY65_Eyy82N_Fs982KTxe1qxnRd4A/edit). Section 4 summarizes it. If this file and the contract disagree, the contract wins for data shapes and this file must be corrected.

---

## 2. Features and limits

### In scope (MVP)

| Feature | Notes |
| --- | --- |
| Landing page (public) | Open to everyone without login, including patients and the general public: logo, what NuroPulse is, how it works (check in the app, doctor monitors on the dashboard), a disclaimer, and a doctors-only "Masuk" button. Static content; no Supabase calls. No patient section and no app download button. |
| Doctor sign-up | Doctors register themselves on the web: full name, phone number (WhatsApp), email, password. The backend assigns `role = doctor` and generates the connection code. No email confirmation and no password reset in the MVP. |
| Doctor login | Email + password via Supabase auth. Only `role = doctor` may enter. |
| Dashboard overview | Date and greeting, flagged patients ("Perlu ditinjau") as the main block, a summary of totals, and the patients who have not checked in. No patient table; that is Daftar Pasien. |
| Patient directory | All patients connected to this doctor: name, phone number, activity status, last measurement, flag. Search, plus filters by activity status and by compliance (Section 10). |
| Patient detail | Per patient: name and phone number, then three parts: **medication** (schedule), **medication log**, and **tremor tests** (latest metrics, trend graph, history). No other personal fields. |
| Medicine library | One shared catalog of medicines that every doctor can read and add to. Add form: name, common dosage, notes. No review step and no request flow. |
| Medication schedule | The doctor creates and manages the schedule of each connected patient: medicine, dose per intake, fixed daily times, start and end date. |
| Medication log (read-only) | The doctor sees which scheduled doses the patient marked taken or skipped, and which were missed. Written by mobile only. |
| Doctor profile | "Profil Saya" page, **read-only**: full name, login email, join date, **the doctor's own connection code with a copy button (the code is shown here, not on the dashboard)**, and sign out. No editing, no password change, no photo, no professional info. |

### Limits

- **The dashboard shows what the app measured.** Rest tremor only (`condition = rest`). No gait, voice, handwriting, or other signals.
- **Thresholds are not calibrated** and were not validated on smartphones. Never present results as clinical-grade.
- **Amplitude (`band_rms_g`) is only comparable on the same person and the same phone model.** Show it as a per-patient trend only. Never rank or compare patients by amplitude, and note the phone model when it changes within a trend.
- **No diagnosis, no disease name** in any generated text, tooltip, alert, or label. Frequency alone does not separate Parkinson's tremor from essential tremor, drug-induced tremor, or enhanced physiological tremor.
- **Doctors only, except the public landing page.** Patients use the mobile app; they may read the landing page but have nothing to sign in to here. If a signed-in user's profile `role` is not `doctor`, sign out and show a message that this dashboard is for neurologists.
- **NuroPulse flags; it does not judge.** A flag on a patient ("Perlu ditinjau") only draws the doctor's attention to data. It never states that something is clinically wrong, and it always states the data reason it was raised (Section 10).
- **Status labels describe the measurement, never the patient.** The dashboard says "Pola tremor terdeteksi" or "Pola tremor tidak terdeteksi", never "normal", "waspada", "sehat", "bahaya", or similar (Section 8).

### Do not claim anywhere (UI, README, code comments)

"Detects Parkinson's", "diagnoses", "detects wearing-off", "accuracy of X%" (no accuracy has been measured by the team). A wearing-off-related hint is allowed only in the non-diagnostic form described in Section 8. The dashboard also never validates or recommends doses, never flags drug interactions, and never suggests changing a medication: those decisions belong to the doctor.

---

## 3. Doctor flow

```
Landing -> Login (or Sign-up -> Login) -> Dashboard overview
   -> Patient directory / search / filter -> Patient detail
        -> medication schedule (create / edit / stop)
        -> medication log
        -> tremor tests: latest metrics, trend graph, history
   -> Medicine library (browse, search, add)
   -> Profile (connection code, sign out)
```

1. **Landing (public, everyone).** NuroPulse logo, a short explanation of NuroPulse, how it works, the disclaimer, and a "Masuk" button explicitly marked as doctors-only so patients do not try to sign in (the automatic sign-out for non-doctor accounts stays as a safety net). A signed-in doctor who opens `/` is redirected to the dashboard. No sign-up for organizations (that was FisioMate).
2. **Sign-up (doctors).** Doctors register themselves: full name, phone number (WhatsApp), email, password. Patients never register on the web; they register in the mobile app. The login page links to sign-up ("Belum punya akun? Daftar") and back.
3. **Login.** Email and password. Wrong credentials show the generic message from Section 8. After login the router redirects to the dashboard.
4. **Connecting patients.** There is **one connection code per doctor** (`profiles.connection_code`). The doctor gives the code to the patient after diagnosis; the patient enters it in the mobile app. The web has **no** "create patient" form and does not generate per-patient codes. The doctor's own code is shown **on the Profile page only** (copy button), so they can share it. The code is fixed: the web has no way to regenerate it. Patients appear in the directory once connected.
5. **Review.** The doctor opens a patient and reads the medication schedule, the medication log, and the tremor tests.
6. **Medication.** The doctor picks medicines from the shared library (or adds a missing one), then sets the patient's schedule. The patient logs each dose in the mobile app. The doctor reads the log next to the tremor measurements.

---

## 4. Data contract summary (web view)

> **Not yet verified against the real Supabase schema.** The backend was built separately. Before writing any data code (queries, `api.ts`, guards), generate `app/lib/database.types.ts` with the Supabase CLI, compare it with this section, and report the differences. Do not write queries against tables or columns that are not in the generated types.
Defined in the data contract (PDF, 4 pages). **Profile** and **Measurement** are fixed. The web is a **reader** of measurements: it never creates them and never writes `role`. The medication models (Medicine, Medication Schedule, Medication Log) are defined in a second contract, summarized under "Medication models" below. Some decisions in this section are not in the contracts yet; they are marked "not yet in the contract".

Supabase tables (decided): `profiles`, `measurements`, `medicines`, `medication_schedules`, `medication_logs`.

**Status is not sent by the mobile app.** The contract PDF still lists `status` and `invalid_reason` as sent by mobile, but the team has decided mobile does **not** send them. The backend fills `status` (see "Derived status" below). Do not compute status in the web from `features`: the thresholds live in the mobile DSP config, are uncalibrated, and must not be duplicated here. Because mobile does not upload `invalid` measurements, every measurement the web receives is a valid one.

### Profile

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Same as the Supabase auth user id |
| `role` | text | `patient` or `doctor`. Web never writes it. |
| `full_name` | text | Patient name shown to the doctor. For the signed-in doctor, the name on the Profile page (read-only). Entered at sign-up. |
| `phone` | text | **Patients and doctors, required.** International format, for example `+6281234567890`; for doctors, their WhatsApp number. Patients enter it at registration in the mobile app; doctors enter it on the web sign-up form, and the backend trigger copies it from the sign-up metadata. The web never writes it directly. **Decided but not yet in the contract, and not yet in `database.types.ts`: the backend still has to add the column.** |
| `doctor_id` | uuid, nullable | **Patients.** The connected doctor. Set when the patient enters a connection code. Decided; not yet in the contract. |
| `connected_at` | timestamptz, nullable | **Patients.** When the patient connected to the current doctor. Decided; not yet in the contract. |
| `connection_code` | text, unique | Doctors only. 8 characters (the contract says "proposed"), generated automatically when the doctor account is created. The web shows the signed-in doctor's own code **on the Profile page**, read-only. |
| `created_at` | timestamptz | Shown as the join date on the Profile page |

The product has **no** photo, specialty, STR number, or verification fields; do not add them. The login email comes from Supabase Auth, not from Profile.

A patient is connected to exactly **one** doctor (`profiles.doctor_id`); a doctor has many patients. When a patient connects to a new doctor, the backend stops the old doctor's schedules (`is_active = false`). Measurements and medication logs belong to the patient and stay visible to the new doctor.

### Measurement (one per check, written by mobile)

| Column | Type | Web usage |
| --- | --- | --- |
| `id` | uuid | Row key |
| `patient_id` | uuid, optional | Owner; null or blank when the check was made without an account. Rows without an owner are never shown. |
| `measured_at` | timestamptz | X axis of trends; display in the doctor's local time |
| `uploaded_at` | timestamptz | Backend-set. Show only if useful (late uploads). |
| `condition` | text | `rest` now. The contract allows `postural`, but mobile always sends `rest` in this version. Do not build UI for `postural`. |
| `duration_s` | number | Duration of the analyzed signal. **Do not hardcode a value.** Real use is 10 to 30 s; the MVP demo may use 4 s (decided; not yet in the contract). Display whatever is stored. |
| `status` | text | **Not sent by mobile.** Filled by a backend trigger on insert: `none` or `tremor` (see below). |
| `invalid_reason` | text | **Not sent by mobile.** |
| `features` | object | Always present for the measurements the web receives |
| `algo_version` | text | `0.1.0` now. Show it next to results so data from different algorithm versions is not silently mixed. |
| `device` | object | Device metadata, see below |

**Derived status (decided).** A backend trigger fills `measurements.status` when a row is inserted, with `none` or `tremor`, the same values the mobile app uses. The thresholds are stored in the backend per `algo_version` and kept identical to the mobile DSP config. The web only reads `status` and maps it to a label (Section 8); it never computes it.

`features` object:

| Key | Unit | Meaning |
| --- | --- | --- |
| `peak_frequency_hz` | Hz | Frequency of the highest spectral power in the peak-search range |
| `band_power_ratio` | 0 to 1 | Power in the tremor band (3.5–7 Hz) divided by total power in 1–15 Hz |
| `snr` | ratio | Peak power divided by the median power in 1–15 Hz |
| `band_rms_g` | g | RMS in the tremor band, in g |
| `consistency` | 0 to 1 | Fraction of time segments that contain the tremor |

`device` object:

| Key | Type | Meaning |
| --- | --- | --- |
| `model` | text | Phone model, for example `Pixel 7` |
| `os` | text | `android` or `ios` |
| `app_version` | text | App version |
| `effective_sampling_hz` | number | Actual sampling rate during the recording, in Hz |

Use `device.model` to mark phone-model changes on a patient's trend (amplitude is only comparable on the same phone model). Show `effective_sampling_hz` in a measurement's detail only; do not use it to judge a measurement.

JSON keys are `snake_case` exactly as above. TypeScript types use `camelCase` and map in the data layer (one mapper per model). Do not use `snake_case` outside the data layer.

### Medication models

Source: **NuroPulse Data Contract: Obat dan Jadwal Pengobatan** (https://claude.ai/code/artifact/574de853-d9de-4d65-a832-4f7d2caedd16). If this section and that contract disagree, the contract wins. Replace the link with the Google Doc link if the contract moves. The items that contract marked *(usulan)* are now decided as written here.

**Medicine**: one shared catalog. Every doctor reads all rows and may add rows. No review step.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `name` | text | Required, max 120 characters. Unique ignoring case. |
| `common_dosage` | text | Required, max 1000 characters. Free-text **reference** only; not the dose a patient takes. |
| `notes` | text | Optional, max 1000 characters |
| `created_by` | uuid | Doctor who added it; set by the backend |
| `created_at`, `updated_at` | timestamptz | Backend-set, UTC |

A medicine used by any schedule cannot be deleted (`medicine_in_use`). Only the doctor who created an entry may edit or delete it. The NuroPulse team fixes wrong entries directly in the Supabase dashboard; there is no admin UI.

**Medication Schedule**: one row = one medicine for one patient, fixed times every day. Created and managed by the doctor on the web; mobile only reads the patient's own.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `patient_id` | uuid | Must be a patient connected to the creating doctor |
| `doctor_id` | uuid | The creating doctor |
| `medicine_id` | uuid | References Medicine |
| `dose` | text | Required, max 1000 characters. Dose **per intake** for this patient, free text. |
| `times` | text[] | Required. `HH:MM`, 24 h, local wall-clock time of the patient, **no time zone** (accepted for the MVP). 1 to 8 entries, no duplicates, ascending. |
| `start_date` | date | Required, `YYYY-MM-DD` |
| `end_date` | date | Optional; last day, inclusive. Empty = no end. Not before `start_date`. |
| `instructions` | text | Optional, max 1000 characters, for example before or after meals |
| `is_active` | boolean | `true` on creation; `false` = stopped |
| `created_at`, `updated_at` | timestamptz | Backend-set, UTC |

Rules:

- A scheduled dose exists on date *d* at time *t* when `is_active` is `true`, `start_date` ≤ *d* ≤ `end_date` (or no `end_date`), and *t* is in `times`.
- Only `end_date`, `instructions`, and `is_active` may be edited in place. Changing `medicine_id`, `dose`, or `times` means: stop the old schedule (`is_active = false`) and create a new one, so old logs keep pointing at the right dose.
- Schedules are never hard-deleted; "delete" means `is_active = false`.

**Medication Log**: one row = one scheduled dose that the patient answered. **Written by mobile only; the web reads it.**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Created by mobile |
| `patient_id` | uuid | Owner |
| `schedule_id` | uuid | References Medication Schedule |
| `scheduled_at` | timestamptz | The scheduled dose that was answered, sent from the patient's device clock, stored as UTC |
| `status` | text | `taken` or `skipped` |
| `taken_at` | timestamptz | Only when `taken`; device time, may differ from `scheduled_at` |
| `logged_at` | timestamptz | When the patient pressed the button; separates live entries from late ones |
| `uploaded_at` | timestamptz | Backend-set |

- **Missed** is not stored. A scheduled dose with no log row **2 hours after its scheduled time** is shown as missed ("Terlewat"), derived from schedule and log. Before those 2 hours pass it is still pending, not missed.
- A patient may correct a log entry in the mobile app up to **24 hours after the scheduled time** (same `id`, new values). The web always shows the latest stored values.
- Compare medication timing with tremor measurements through `taken_at` (log) and `measured_at` (measurement). Do not add medication fields to Measurement.
- Because schedules carry no time zone, the web cannot verify a log row's `scheduled_at` against `times`. Treat both as approximate for patients who travel across time zones.

Backend error codes (English identifiers; the UI maps them to Indonesian text): `medicine_not_found`, `medicine_duplicate`, `medicine_in_use`, `forbidden`, `schedule_not_found`, `schedule_invalid_times`, `schedule_invalid_range`, `patient_not_connected`, `log_duplicate`. Supabase returns Postgres codes, not these names. **Decided:** the web's data layer maps them itself, by Postgres code and constraint name; there are no RPC functions for this. `23505` (unique) → `medicine_duplicate`; `23503` (foreign key) → `medicine_in_use`; `23514` (check) → `schedule_invalid_times` or `schedule_invalid_range` by constraint name; `42501` (RLS) → `forbidden`. RLS cannot tell `forbidden` from `patient_not_connected`, so the web shows the `forbidden` message for both. `log_duplicate` only concerns mobile.

---

## 5. Tech stack and decisions

| Area | Decision |
| --- | --- |
| Framework | React Router (bootstrapped with `create-react-router`). framework mode with SPA (`ssr: false`).|
| Language | TypeScript (template default; confirm strict mode in `tsconfig.json`) |
| Backend client | `@supabase/supabase-js`, called **directly from the web app** with the anon key and the doctor's session. Access control is enforced by **Row Level Security (RLS)**, owned by the backend team. |
| Styling / UI kit | Tailwind v4 and shadcn/ui (Radix UI). Components are added with `npx shadcn@latest add <name>` into `app/components/ui/`. Design tokens live in `app/app.css`, taken from the Figma file "NuroPulse Design System" (https://www.figma.com/design/xnuVASh56Wn2R2EZEAmEAh/NuroPulse-Design-System?node-id=6-12). Font: Plus Jakarta Sans only, self-hosted through `@fontsource-variable/plus-jakarta-sans` (imported in `app/app.css`; no Google Fonts link). Light mode only. Icons: Lucide (`lucide-react`). |
| Data fetching | TanStack Query (`@tanstack/react-query`) on top of `@supabase/supabase-js`. One `QueryClient` in `app/lib/query-client.ts` (`staleTime` 30 s, `retry` 1), provided in `app/root.tsx`; Supabase client in `app/lib/supabase.ts`. Each feature keeps its query keys and hooks in its `api.ts`; after a write, invalidate the related keys. Devtools (`@tanstack/react-query-devtools`) are a dev dependency, development only. |
| Data fetching | TanStack Query (`@tanstack/react-query`). One `QueryClient` in `app/lib/query-client.ts` (`staleTime` 30 s, `retry` 1), provided in `app/root.tsx`. Devtools (`@tanstack/react-query-devtools`) are a dev dependency. Supabase client in `app/lib/supabase.ts`. |
| Charts | shadcn/ui charts (built on Recharts). |
| Testing | Vitest (5.0.5, dev dependency), for helpers only (activity status, flags, compliance, schedule rules, mappers). Config in `vitest.config.ts`, separate from `vite.config.ts` so the React Router plugin does not run in tests. Test files sit next to the helper: `app/**/*.test.ts`. No component tests in the MVP. |
| Deploy | Static hosting on Vercel or Netlify, with an SPA fallback so every route serves `index.html` (opening a deep link such as a patient page must not return 404). |
| Config | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon or publishable key only) in `.env`, git-ignored. `.env.example` lists the names without values. |
| Package manager | npm |

Rules for dependencies:

- Do not pin versions from memory. Check the latest version on the registry when adding a package, and say which version you added.
- Ask before adding any dependency, especially UI kits, chart libraries, state managers, and data-fetching libraries.
- Never commit `.env`. Never put a Supabase service-role key anywhere in this repository or in the browser bundle.
- Before working on routing, loaders, actions, or route modules, read `.agents/skills/react-router/SKILL.md` and the files in its `references/` folder that apply. Do not edit that folder.
- The `shadcn` package is a dev dependency (CLI plus `shadcn/tailwind.css`). `npm audit` reports high-severity issues in its CLI dependency chain (`braces`); they do not reach the browser bundle (`npm audit --omit=dev` is clean). Do not run `npm audit fix --force`.

---

## 6. Architecture and folder structure

Modular and feature-based. Route files stay thin; features live under `modules/`.

```
app/
  components/
    elements/            # Shared app elements: app-sidebar, page-header
    ui/                  # shadcn/ui primitives (button, card, input, table, badge, ...)
  lib/
    utils.ts             # cn (from shadcn)
    supabase.ts          # Supabase client
    query-client.ts      # TanStack Query client
    patient-status.ts    # Shared helpers: status label, activity status, compliance
  modules/
    LandingPage/         # Public landing page and its sections
    Auth/                # Login, register, session, doctor-role guard
    Dashboard/           # Overview: totals, flagged patients, patient list
    Patients/            # Patient list and detail (medication, medication log, tremor tests)
    Medicines/           # Medicine library: list, detail, add
    Profile/             # Read-only doctor profile and connection code
    NotFound/            # 404 page
  routes/                # Thin route files
  app.css                # Global styles and design tokens
  root.tsx               # App root, providers
  routes.ts              # Route config
```

Inside a module (one module = one feature area):

```
modules/Patients/
  components/            # every .tsx of the module: pages and their parts
    patient-list-page.tsx
    patient-detail-page.tsx
    medication-section.tsx
  api.ts                 # plain Supabase functions (no React), snake_case → camelCase mapping
  hooks.ts               # TanStack Query hooks and query keys, built on api.ts
  types.ts
  index.ts               # public surface of the module
```

- Module folders are **PascalCase**; every folder and file inside a module is **kebab-case**. Component names in code are PascalCase.
- All `.tsx` files of a module live in its `components/` folder; `.ts` logic files live in the module root. No `features/` subfolder.
- Each module has one `index.ts` that exports only its public surface: the pages that routes render and the types other modules need. Routes and other modules import from `~/modules/<Module>` only.
- Files inside a module never import from their own module's `index.ts`; they use relative imports, to avoid circular imports.
- Do not add barrel files anywhere else (`components/`, `lib/`).
- Static images live in `public/assets/<module-name>/` (kebab-case, for example `public/assets/landing-page/`); images used across modules live in `public/assets/shared/`. The logo mark has two variants there: `logo-putih.svg` for dark (navy) backgrounds and `logo-biru.svg` for light backgrounds. It is a mark only, so place the "NuroPulse" text next to it.
- Ask before creating a new module, a new top-level folder, or a new layer.

### Routes

URLs are English. Planned routes (`app/routes.ts`):

| URL | Route file | Access |
| --- | --- | --- |
| `/` | `routes/landing.tsx` | Public; a signed-in doctor is redirected to `/dashboard` |
| `/login`, `/register` | `routes/login.tsx`, `routes/register.tsx` | Public |
| `/dashboard` | `routes/dashboard.tsx` | Doctor |
| `/patients`, `/patients/:patientId` | `routes/patients.tsx`, `routes/patient-detail.tsx` | Doctor |
| `/medicines`, `/medicines/:medicineId` | `routes/medicines.tsx`, `routes/medicine-detail.tsx` | Doctor |
| `/profile` | `routes/profile.tsx` | Doctor |
| `*` | `routes/not-found.tsx` | Public |

All doctor routes sit under one layout route, `routes/app-layout.tsx`, which holds the session and doctor-role guard and the sidebar. A route file only imports a module page and renders it; it contains no feature logic.

### Layer rules

- **Components** contain layout and event forwarding only. Fetching, mapping, and status logic live in hooks or data functions, not in JSX.
- **Data access** (Supabase calls) lives only in a feature's `api.ts`, wrapped in TanStack Query hooks. The Supabase client itself lives in `lib/supabase.ts`. Components never call Supabase directly.
- A module may import another module's exported page or types only. Never reach into another module's internals; shared logic goes to `lib/`. One exception: `Patients` exports `useMyPatients`, so the Dashboard overview shares the patient list query (and its cache) with Daftar Pasien and the counts always match.
- `lib/` and `components/` never import from `modules/`.
- Raw rows from Supabase are mapped to frontend types in `api.ts`. Do not pass raw `snake_case` rows into components.
- Do not duplicate the status mapping (Section 8); define it once in `lib/patient-status.ts` and reuse it.

### Imports

Use the `~/` alias (maps to `app/`) for cross-folder imports and relative imports inside a module. Barrel files follow the module rules above.

---

## 7. Coding standards

- Type-check must pass before every commit. No linter or formatter is configured yet; ask before adding one. No `any` without a comment explaining why.
- Prefer immutability and small pure functions. Prefer early returns over deep nesting.
- One component per file; file names `kebab-case`, components `PascalCase`, hooks `useCamelCase`.
- Comments explain **why**, not what. No commented-out code. No `console.log` left behind.
- Do not swallow errors. Convert Supabase errors to a typed error at the data-layer boundary; the UI maps each error type to an Indonesian message.
- Every list or chart has explicit **loading**, **empty**, and **error** states.
- Dates: store and fetch in UTC (timestamptz), render in the doctor's local time zone, with a consistent format helper in `lib/`.
- Accessibility: status must never be conveyed by color alone (always add text or an icon). Keyboard-navigable tables and filters. Sufficient contrast.
- Never log or display tokens, passwords, connection codes in logs, or full measurement payloads.
- Responsive: the dashboard is laptop first; tablet width should not break. The **landing page is mobile first**: patients will open it on a phone, so it must be fully usable at phone width.

### Design tokens

- Use only the token classes from `app/app.css`. No raw hex, `rgb()`, or arbitrary values such as `text-[#3653c5]` or `text-[15px]`. If a value is missing, ask; do not add one-off values.
- Typography: `text-h1`–`text-h9` (Bold), `text-sh1`–`text-sh10` (SemiBold), `text-b1`–`text-b10` (Regular). Each class already sets size, line height, and weight; do not add `font-bold` and similar on top. The aliases `text-heading`, `text-subheading`, and `text-body` exist but are sized for mobile; prefer the scale on the dashboard.
- Suggested dashboard defaults: page title `text-h4`, section title `text-sh6`, card title `text-sh7`, body and table text `text-b8`, captions and helper text `text-b9`.
- Colors: use the shadcn tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, …) for UI. Use the Figma palette (`primary-*`, `secondary-*`, `neutral-*`) and semantic tokens (`surface`, `ink`, `line`, `success`, `warning`, `danger`) only where no shadcn token fits.
- `danger` / `destructive` are for system states only: form errors, failed actions, destructive buttons. Never use them for patient data, measurements, or flags.
- When the Figma file changes, update `app/app.css` first, then the components. Never redefine tokens inside a component.

### Visual style

The web follows the NuroPulse mobile app: white, airy, and calm. Every new page (dashboard, patients, medicines, profile) uses these rules.

- **Base:** page background `bg-surface`; content sits in cards `rounded-2xl border border-line bg-surface-raised`, with no shadow (or `shadow-card` at most). Leave generous whitespace.
- **Blue, used sparingly:** primary buttons (default `Button`, `primary-600`/`700`), headings (`text-primary-600`), icons, links, and chart lines. No large blue blocks or panels; a light tint (`bg-primary-50`) is the most a panel may carry.
- **Green as the second accent (`secondary-*`):** secondary buttons and navigation, active or progress indicators, and small decorative touches such as a dot before a section label (`size-2 rounded-full bg-secondary-500` with `text-secondary-600` label).
- **Illustrations, not photos:** flat vector art (blue, light lavender, green leaves) from the mobile team. Until it arrives, use a light placeholder (`rounded-2xl border border-line bg-primary-50`).
- **Status boxes:** soft background + 1px border + icon on the left, for example `rounded-2xl border border-success bg-success-soft p-4` with a Lucide icon in `text-success`. Neutral notices (such as the disclaimer) use `success`; flags ("Perlu ditinjau") use `warning`; `danger` only for form errors and failed actions (see Design tokens).
- **Inputs:** white (`bg-surface-raised`, already the `Input` default) with a `border-input` (`line-strong`) border; never a grey filled field.
- **Text:** body `text-ink-muted` (also the page default on the landing page); headings `text-primary-600` in a single colour (or `text-ink` for small card titles). Avoid the darkest shades (`primary-800`/`900`, `secondary-800`/`900`) for text and shapes; they read too heavy next to the mobile app.
- **Decorations (sparingly, never over text):** shared in `app/components/elements/`: `Tulip` (Parkinson's awareness symbol; vary `tone` between tulips), `TremorWave` (echoes the tremor signal chart), and `Bubble` (a large, low-contrast circle that fades into the page background with a faint shadow, placed partly off the page edge; never a small coloured dot). Place them behind content with `-z-10`, inside a wrapper with `isolate` and `overflow-x-clip` so they can flow between sections without a hard cut. No comment- or drop-shaped blobs.
- **Shapes:** cards `rounded-2xl`; status boxes `rounded-xl` or `rounded-2xl`; badges and chips `rounded-full`; buttons and inputs keep the component default (`rounded-lg`).

---

## 8. Language rules

### User-facing text → Bahasa Indonesia

Everything rendered in the UI: labels, buttons, errors, toasts, dialogs, validation, chart titles and axis labels, empty states, landing page.

### Developer-facing text → English

Code comments, commit messages, logs, variable/function/file names, test names, JSON keys, error messages that are only logged, and this file. Never mix: no English strings in the UI, no Indonesian identifiers in code.

Write UI copy inline in the component that renders it. No strings file, no UI-text constants, no i18n setup. Exception: text that must never drift apart (for example the status labels below) is owned by one small component or helper and reused.

### Status mapping (single source in the code)

The mobile app does **not** send a status, and it does not upload `invalid` checks. A backend trigger fills `measurements.status` (Section 4); the dashboard shows it as:

| `status` | Dashboard label | Meaning |
| --- | --- | --- |
| `none` | Pola tremor tidak terdeteksi | A rhythmic tremor pattern was not detected in this check |
| `tremor` | Pola tremor terdeteksi | A rhythmic tremor pattern was detected in this check |

The web only maps the backend's value to a label, in one place. It never derives the status from `features` itself. If a measurement has no `status` or no `features`, do not show a label and do not count it in totals, trends, or flags; log it as a data issue.

The labels report what one measurement found; they never describe the patient's health. Never use "normal", "waspada", "sehat", "bahaya", or similar for a status. Show the labels as **neutral badges**, never red and green, because red reads as danger and green as healthy: "Pola tremor terdeteksi" = `bg-primary-50 text-primary-800`; "Pola tremor tidak terdeteksi" = `bg-surface-sunken text-ink-muted`. Always text plus an icon, never color alone.

### Wording that must stay consistent

| Meaning | Indonesian text |
| --- | --- |
| Log in | Masuk |
| Log out | Keluar |
| Email | Email |
| Password | Kata sandi |
| Wrong credentials | Email atau kata sandi tidak sesuai. |
| Patient directory | Daftar Pasien |
| Patient detail | Detail Pasien |
| View detail | Lihat Detail |
| Search patient | Cari pasien |
| Status: `none` | Pola tremor tidak terdeteksi |
| Status: `tremor` | Pola tremor terdeteksi |
| Last measurement | Pengukuran terakhir |
| Last active | Terakhir aktif |
| Doctor connection code (Profile card title) | Kode koneksi Anda |
| Copy code | Salin Kode |
| Sign up | Daftar |
| Full name | Nama lengkap |
| Link to sign-up | Belum punya akun? Daftar |
| Link to login | Sudah punya akun? Masuk |
| Sign-up page title | Daftar sebagai dokter |
| Show password (button label) | Tampilkan kata sandi |
| Hide password (button label) | Sembunyikan kata sandi |
| Error: full name required | Nama lengkap wajib diisi. |
| Error: phone number required | Nomor telepon wajib diisi. |
| Error: phone number format | Gunakan format internasional, contoh +6281234567890. |
| Phone number helper (doctor sign-up) | Nomor WhatsApp yang aktif, diawali kode negara. |
| Password helper (doctor sign-up) | Minimal 6 karakter. Sebaiknya gabungkan huruf dan angka. |
| Error: email required | Email wajib diisi. |
| Error: email format | Format email tidak valid. |
| Error: password required | Kata sandi wajib diisi. |
| Error: password too short | Kata sandi minimal 6 karakter. |
| Error: email already registered | Email ini sudah terdaftar. Silakan masuk. |
| Error: weak password | Kata sandi terlalu lemah. Gunakan kata sandi yang lebih panjang dengan campuran huruf dan angka. |
| Sign-up succeeded without a session (login page notice) | Akun berhasil dibuat. Silakan masuk. |
| Loading (screen reader text) | Memuat… |
| Phone number | Nomor telepon |
| Activity status: active | Aktif |
| Activity status: no check-in | Belum check-in |
| Activity status: inactive | Tidak aktif |
| Activity status: no measurement yet | Belum ada pengukuran |
| Flag | Perlu ditinjau |
| Compliance filter | Filter Kepatuhan |
| Compliance filter: medication | Kepatuhan obat |
| Compliance filter: check-in | Kepatuhan check-in |
| Compliance buckets | Baik, Sedang, Rendah |
| Patient list label (above the title) | {n} pasien terhubung |
| Patient list subtitle | Semua pasien yang memasukkan kode koneksi Anda di aplikasi NuroPulse. |
| Status tabs | Semua · {n}, Aktif · {n}, Belum check-in · {n}, Tidak aktif · {n}, Belum ada pengukuran · {n} |
| Patient table columns | Nama pasien, Nomor telepon, Status aktivitas, Pengukuran terakhir, Penanda |
| Filters (default option) | Semua status · Filter Kepatuhan · Penanda |
| Compliance filter options | Kepatuhan obat: Baik / Sedang / Rendah · Kepatuhan check-in: Baik / Sedang / Rendah |
| Flag filter options | Perlu ditinjau · Tidak ditandai |
| No matching patients | Tidak ada pasien yang cocok dengan pencarian atau filter. |
| Reset filters | Atur ulang filter |
| Empty patient list hint | Bagikan kode koneksi Anda kepada pasien agar mereka muncul di sini. Kode ada di halaman Profil Saya. |
| Pagination summary (patients) | Menampilkan {a}–{b} dari {n} pasien |
| Uncalibrated notice: title | Ambang belum dikalibrasi |
| Uncalibrated notice: body | Status pola tremor memakai ambang awal yang belum divalidasi. Gunakan sebagai penanda, bukan kesimpulan klinis. |
| Profile page | Profil Saya |
| Sidebar menu label | MENU |
| Sidebar: collapse / expand (button label) | Perkecil sidebar / Perlebar sidebar |
| Sidebar: role under the doctor's name | Dokter |
| Mobile: open the sidebar (button label) | Buka menu |
| Mobile sidebar sheet (screen reader title / description) | Menu / Menampilkan menu navigasi. |
| Sidebar toggle (screen reader, shadcn default) | Buka atau tutup menu |
| Join date | Tanggal bergabung |
| Code copied (toast) | Kode disalin. |
| Connection code helper | Bagikan kode ini kepada pasien agar mereka dapat menghubungkan akun NuroPulse mereka dengan Anda. |
| Profile page label (above the title) | Akun Anda |
| Copy failed (toast) | Kode gagal disalin. Salin secara manual. |
| Connection code missing (backend problem) | Kode koneksi belum tersedia. Hubungi tim NuroPulse. |
| Connection code note | Pasien memasukkan kode di aplikasi NuroPulse. Setelah terhubung, pasien muncul di Daftar Pasien. |
| Value not available | Tidak tersedia |
| Retry (button) | Coba lagi |
| Empty list | Belum ada data. |
| No flag | Tidak ada yang perlu ditinjau. |
| Flag reason: tremor pattern | Ditandai karena: pola tremor terdeteksi di {n} dari 5 pengukuran terakhir. |
| Flag reason: medication compliance | Ditandai karena: kepatuhan obat rendah dalam 7 hari terakhir. |
| Offline / network error | Tidak ada koneksi internet. Coba lagi. |
| Generic error | Terjadi kesalahan. Silakan coba lagi. |
| Not a doctor account | Dashboard ini hanya untuk neurolog. Gunakan aplikasi NuroPulse untuk pasien. |
| Landing: doctor sign-in helper | Khusus untuk dokter. Pasien menggunakan aplikasi NuroPulse. |
| Landing: disclaimer | NuroPulse bukan alat diagnosis dan tidak menggantikan pemeriksaan dokter. |
| Trend ranges | 7 Hari, 30 Hari, 3 Bulan |
| Dashboard overview (page title, nav) | Dashboard |
| Overview subtitle | {n} pasien perlu ditinjau hari ini. / Tidak ada yang perlu ditinjau. |
| Overview flagged block | Perlu ditinjau · {n} pasien · Ditandai dari data 7 hari terakhir. Penanda hilang sendiri saat kondisinya tidak lagi terpenuhi. |
| Overview summary card | Ringkasan: Pasien terhubung, Aktif (5 hari terakhir), Belum check-in, Perlu ditinjau · Lihat Daftar Pasien |
| Overview not-checked-in card | Belum check-in · Tidak ada pengukuran 5–13 hari · {n} hari |
| Nobody without a check-in | Tidak ada pasien yang belum check-in. |
| Uncalibrated notice (Overview, one line) | Ambang belum dikalibrasi. Status pola tremor memakai ambang awal yang belum divalidasi. Gunakan sebagai penanda, bukan kesimpulan klinis. |
| Page not found (404) | Halaman tidak ditemukan |
| Medicine library | Daftar Obat |
| Medicine detail | Detail Obat |
| Search medicine | Cari obat |
| Add medicine | Tambah Obat |
| Medication schedule | Jadwal Obat |
| Add schedule | Tambah Jadwal |
| Stop schedule | Hentikan Jadwal |
| Medication log | Riwayat Minum Obat |
| Dose per intake | Dosis per minum |
| Intake times | Jam minum |
| Log status: taken | Diminum |
| Log status: skipped | Dilewati |
| Log status: missed | Terlewat |
| Log status: pending (less than 2 hours after the scheduled time) | Menunggu |
| Patient detail: jump links | Tes Tremor · Jadwal Obat · Riwayat Minum Obat |
| Patient detail: meta | Terakhir aktif {tanggal, jam} |
| Patient not found | Pasien tidak ditemukan. · Kembali ke Daftar Pasien |
| Latest measurement card | Pengukuran terakhir · {tanggal, jam} · Tremor saat istirahat · algoritma {versi} |
| Measurement metrics | Frekuensi puncak, Amplitudo pita (RMS), Rasio daya pita, Konsistensi, Durasi (detik) |
| No measurement yet (detail) | Belum ada pengukuran. |
| Trend card | Tren frekuensi puncak · Setiap titik adalah satu pengukuran. Strip di bawah menunjukkan dosis obat harian. |
| Trend chart placeholder (until the chart is built) | Grafik tren akan ditampilkan di sini. · {n} pengukuran dalam rentang ini · pita tremor 3,5–7 Hz sebagai acuan |
| Phone model change note | Ganti ponsel: {model} sejak {tanggal}. Amplitudo hanya sebanding pada model ponsel yang sama. |
| Measurement history | Riwayat pengukuran · Diurutkan berdasarkan waktu pengukuran; columns Waktu pengukuran, Status, Frekuensi puncak, Amplitudo (RMS), Durasi, Ponsel, Algoritma |
| Schedule card | Jadwal aktif yang Anda atur untuk pasien ini · Dosis per minum: {dosis} · Mulai {tanggal} · Selesai: {tanggal} / Tanpa batas |
| No active schedule | Belum ada jadwal obat aktif untuk pasien ini. |
| Edit schedule | Ubah · Ubah Jadwal · Simpan Perubahan |
| Edit schedule note | Untuk mengganti obat, dosis, atau jam minum, hentikan jadwal ini lalu buat jadwal baru. |
| Stop schedule confirm | Hentikan jadwal ini? · {obat} untuk {pasien} tidak akan dijadwalkan lagi. Riwayat minum obat yang sudah ada tetap tersimpan. |
| Add schedule dialog | Untuk {pasien} · Obat · Pilih dari Daftar Obat · Obat belum ada? Tambah Obat · Contoh: 1 tablet · Tambah jam · 1–8 jam per hari, waktu setempat pasien. · Tanggal mulai · Tanggal selesai (opsional) · Kosongkan untuk tanpa batas. · Instruksi (opsional) · Contoh: sesudah makan · Simpan Jadwal |
| Schedule form errors | Pilih obat. · Dosis per minum wajib diisi. · Dosis per minum maksimal 1000 karakter. · Tambahkan minimal satu jam minum. · Maksimal 8 jam minum per hari. · Format jam tidak valid. · Jam ini sudah ada. · Tanggal mulai wajib diisi. · Tanggal selesai tidak boleh sebelum tanggal mulai. · Instruksi maksimal 1000 karakter. |
| Schedule toasts | Jadwal ditambahkan. · Jadwal diperbarui. · Jadwal dihentikan. |
| Medication log card | Dicatat pasien di aplikasi. Terlewat = tidak ada catatan 2 jam setelah jadwal.; columns Jadwal, Obat, Status, Waktu diminum |
| No doses in range | Belum ada dosis terjadwal dalam rentang ini. |
| Medication compliance summary | Kepatuhan obat 7 hari terakhir: {persen} ({Baik/Sedang/Rendah}) / belum ada dosis terjadwal |
| Error: patient not connected | Pasien ini tidak terhubung dengan Anda. |
| Error: medicine in use | Obat ini masih dipakai pada jadwal pasien dan tidak bisa dihapus. |
| Error: medicine duplicate | Obat dengan nama ini sudah ada. |
| Medicine library label (above the title) | Katalog bersama semua dokter |
| Medicine library subtitle | Pilih obat dari sini saat membuat jadwal pasien. Dosis umum hanya referensi, bukan dosis pasien. |
| Medicine fields | Nama obat, Dosis umum, Catatan (opsional) |
| Medicine table columns | Nama obat, Dosis umum (referensi), Catatan, Ditambahkan oleh |
| Medicine form placeholders | Contoh: Levodopa/Karbidopa · Teks referensi dosis umum · Catatan tambahan |
| Common dosage helper | Hanya referensi untuk dokter lain, bukan dosis pasien. |
| Add medicine info | Obat langsung tersedia untuk semua dokter setelah disimpan. |
| Add medicine dialog (screen reader description) | Tambahkan obat baru ke katalog bersama semua dokter. |
| Save medicine / Cancel | Simpan Obat / Batal |
| Medicine added (toast) | Obat ditambahkan. |
| Error: medicine name required / too long | Nama obat wajib diisi. / Nama obat maksimal 120 karakter. |
| Error: common dosage required / too long | Dosis umum wajib diisi. / Dosis umum maksimal 1000 karakter. |
| Error: notes too long | Catatan maksimal 1000 karakter. |
| Error: forbidden (add medicine) | Anda tidak memiliki akses untuk menambah obat. |
| No search results (medicines) | Tidak ada obat yang cocok dengan pencarian. |
| Pagination summary | Menampilkan {a}–{b} dari {n} obat |
| Pagination buttons (labels) | Halaman sebelumnya / Halaman berikutnya / Halaman {n} |
| Breadcrumb (screen reader label) | Navigasi halaman |
| Medicine detail: added by | Ditambahkan oleh {nama} · {tanggal} |
| Medicine detail: dosage note | Dosis umum hanya referensi. Dosis untuk setiap pasien diatur di jadwal obat pasien. |
| Medicine usage card | Dipakai di jadwal Anda · Pasien Anda yang memiliki jadwal aktif dengan obat ini |
| Medicine usage empty | Belum ada pasien Anda yang memakai obat ini. |
| Medicine not found | Obat tidak ditemukan. · Kembali ke Daftar Obat |
| Open a patient from a list | Lihat |
| Close dialog (screen reader) | Tutup |

The sign-up, status, and medication strings above are proposed wording; confirm them with the team when the screens are built. Add new strings to this table when you add them. Result text must never say or imply a diagnosis (no "pasien menderita", no disease name).

**Wearing-off-style hint (only from schedule and log data that exist for that patient).** Allowed: a neutral statement of a data pattern, for example "Pola tremor meningkat mendekati jadwal obat berikutnya." Not allowed: "wearing-off terdeteksi", any diagnosis, any recommendation to change medication.

---

## 9. Data access, security, and sync

- The browser talks to Supabase directly with the anon key and the doctor's session. **RLS is the security boundary**, owned by the backend team. The UI hiding a patient is never access control; if a query returns data the doctor should not see, report it as a backend bug instead of filtering it in the UI.
- **Read-only:** measurements, patient profiles, and medication logs.
- **The web may write only:** new Medicine rows; Medication Schedule rows (create, and edit `end_date`, `instructions`, `is_active`). Nothing else. Never any Profile column (`role`, `full_name`, `phone_number`, `connection_code`). No hard deletes of schedules or logs.
- **Sign-up** goes through Supabase Auth: `signUp` with `full_name`, `phone_number`, and `signup_source: 'web'` in the user metadata. The web never inserts or updates a Profile row itself. A backend trigger on new auth users creates the Profile: `role = doctor` and a connection code when `signup_source` is `web`, otherwise `role = patient`. A client could fake `signup_source`; this is accepted because doctor sign-up has no verification anyway. Email confirmation is off for the MVP; there is no password reset. Never log or display passwords.
- A change to a schedule's medicine, dose, or times is two writes: stop the old schedule, create a new one. Do it so a failure of the second write is visible to the doctor (do not leave a patient silently without a schedule).
- A doctor may create schedules only for patients connected to them. The backend enforces it through RLS; the UI only lists connected patients.
- Medication data is shown only for the doctor's own patients and never mixed across patients.
- Pagination and filtering happen in the query (server side), not by loading everything, with one exception: the patient list loads all of the doctor's patients and filters and paginates in the browser, because flags and compliance are computed on the web (Section 10). Its data comes from batch queries over all patient ids (patients, 7 days of measurements and logs, schedules), never one query per patient. Revisit if a doctor reaches several hundred patients. Patient lists: **20 per page**, most recent measurement first. Trend graphs open on the **30 Hari** range.
- Session handling follows `@supabase/supabase-js` defaults. Route protection reads the session and the profile `role` in one place (`routes/app-layout.tsx`, using helpers from the `Auth` module); do not scatter session checks through components.
- Never display `uploaded_at` ordering as measurement ordering: order by `measured_at`.
- Mobile never uploads `invalid` checks, so the web has nothing to hide. The mapper still skips any row without `features` (defensive).
- Backend error codes (English identifiers from the contract) are mapped to typed errors in the data layer, then to Indonesian text in the UI.

---

## 10. Dashboard behavior

- **Landing page (public route `/`).** Read by patients, community health workers, and the general public as well as doctors, so the copy is plain Indonesian and **follows the mobile app's claim rules**:
  - Allowed: describe who NuroPulse is for (for example "pendamping untuk penderita Parkinson"), what the app does (rhythmic tremor check on the phone, periodic check-ins, data shared with the user's neurologist), and the dashboard for doctors.
  - Not allowed: "detects Parkinson's", "diagnoses", "detects wearing-off", any accuracy figure, any sentence about the reader's own condition ("Anda menderita...", "Anda sehat"), "healthy" as an outcome.
  - Sections: hero (logo, one-sentence explanation), how it works, for doctors ("Masuk" with the doctors-only helper text), disclaimer. No patient section and no download button. The disclaimer must be visible without scrolling far or expanding anything.
  - No Supabase data calls, no cookies or tracking on this page. The only session check: a signed-in doctor who opens `/` is redirected to the dashboard.
  - Final copy and branding come later; do not invent final copy.
  - Mobile first, readable at phone width, accessible (semantic headings, contrast, keyboard focus, alt text).

- **Sign-up and login pages.** Sign-up: full name, phone number (international format, normalized by removing spaces, dashes, dots, and brackets), email, password, "Daftar", and "Sudah punya akun? Masuk". Login: email, password, "Masuk", and "Belum punya akun? Daftar". Validate required fields in the form; map Supabase Auth errors to Indonesian text.
- **Activity status** (decided; one helper, reused everywhere), from the patient's most recent measurement `measured_at`:
  - **Aktif:** a measurement within the last 5 days.
  - **Belum check-in:** no measurement for 5 days or more (and less than 14).
  - **Tidak aktif:** no measurement for 14 days or more.
  - **Belum ada pengukuran:** the patient has never sent a measurement and connected less than 14 days ago (`connected_at`).
  - A patient with no measurement who connected 14 days ago or more is **Tidak aktif**.
  - The thresholds live in `lib/patient-status.ts` (`ACTIVE_WITHIN_DAYS = 5`, `INACTIVE_AFTER_DAYS = 14`); the Overview texts derive from them.
- **Flag ("Perlu ditinjau") (decided).** A patient is flagged when **at least one** of these is true:
  - "Pola tremor terdeteksi" in **3 of the last 5 measurements** within the last 7 days.
  - **Kepatuhan obat** is **Rendah** (< 50%) over the last 7 days (formula in the compliance filter below).
  - The web computes flags when the data is read (`getPatientFlag` in `lib/patient-status.ts`), so a flag follows new data and the passing of time with nothing stored. It only counts the backend's measurement `status`; it never looks at `features` or the DSP thresholds. The Patients data layer computes it once per load, and the Overview, the patient list, the filters, and Patient detail all read that result. Open pages refetch every 60 seconds. When both conditions hold, the tremor reason is shown. The `patient_details.flag` column is not used.
  - Every flag shows its **reason** in plain data terms, using the wording in Section 8. The flag never says what is wrong with the patient.
  - A flag disappears on its own when its condition is no longer true. There is no "mark as reviewed" action and no stored flag state.
  - Badge style: `bg-warning-soft text-warning` with an icon and the text "Perlu ditinjau". Warning (amber) draws attention without signalling danger; never use `danger` for a flag.
  - Not part of the rule: "Belum check-in" (it has its own activity status) and amplitude changes against the patient's own history (thresholds are uncalibrated and amplitude depends on the phone model).
- **Overview.** Today's date ("Kamis, 15 Oktober 2026"), greeting "Hai, {nama}" with the name from the doctor's own profile, and the subtitle "{n} pasien perlu ditinjau hari ini." (or "Tidak ada yang perlu ditinjau." when n = 0). No patient table on the Overview; the full list lives in Daftar Pasien. Two columns on large screens; the right column sets the row height:
  - **Left, main block "Perlu ditinjau"** with a count pill ("{n} pasien") and the note "Ditandai dari data 7 hari terakhir. Penanda hilang sendiri saat kondisinya tidak lagi terpenuhi." Each flagged patient shows the name, then the flag reason ("Ditandai karena: …", warning icon inline so a wrapped line starts at the left edge), then "Terakhir aktif …", and a filled "Lihat Detail" button to the patient. The list scrolls inside the card (capped height when the columns stack on small screens). At the bottom, one small grey line with the uncalibrated notice. Empty: "Tidak ada yang perlu ditinjau."
  - **Right, "Ringkasan":** Pasien terhubung, Aktif (5 hari terakhir), Belum check-in, Perlu ditinjau, as plain numbers without coloured icons, then the link "Lihat Daftar Pasien".
  - **Right, "Belum check-in":** "Tidak ada pengukuran 5–13 hari", then every such patient (longest without a measurement first) with "{n} hari", in a list about three rows tall that scrolls. Each name links to the patient.
  - Colour only in the "Perlu ditinjau" block; Ringkasan and Belum check-in stay neutral. Activity status comes from the shared helper in `lib/patient-status.ts`; flags are read from the data, never recomputed.
  - The numbers come from the same query as Daftar Pasien (`useMyPatients`), so the counts match.
- **Compliance filter ("Filter Kepatuhan").** Filters the patient list by one of two measures, both over the **last 7 days**:
  - **Kepatuhan obat** = doses marked taken ÷ scheduled doses whose time has passed (a dose counts once it is missed or logged).
  - **Kepatuhan check-in** = days with at least one measurement ÷ 7.
  - Buckets: **Baik** ≥ 80%, **Sedang** 50–79%, **Rendah** < 50%. Patients with no scheduled dose in the window have no medication bucket.
  - These are display filters, not clinical judgements. One helper computes each, and every page reuses it: `getMedicationCompliance` in `lib/medication.ts` (also used by the medication flag and the Patient detail summary), and `getCheckInCompliance` in `lib/patient-status.ts`. "Missed" is judged against the doctor's browser clock, since schedule times carry no time zone.
- **Patient detail.** One page per patient, reached from the patient list:
  - Header: name, phone number, activity status, last active, flag if any. No other personal fields.
  - **Medication.** Active schedules (medicine, dose per intake, times, start and end date, instructions) with buttons to add, edit the allowed fields, and stop a schedule.
  - **Medication log.** Taken, skipped, and missed doses (missed = no log 2 hours after the scheduled time).
  - **Tremor tests.** At the top, the uncalibrated notice banner (see below). Latest valid measurement (status label, peak frequency, band RMS, duration, timestamp); trend graph with ranges 7 days / 30 days / 3 months (opens on 30 days), with the tremor band **3.5–7 Hz** (from the data contract; decided) highlighted as a reference band, and `algo_version` and `device.model` changes marked; measurement history list.
  - Show tremor measurements and dose times on the same time axis so the doctor can see tremor relative to medication timing. Show the data; do not label patterns as wearing-off.
- **Medicine library page.** Searchable table (name, common dosage, notes), a detail view, and an add form (name, common dosage, notes). The add form has no review step. Show common dosage as a reference only, never as the patient's dose.
- **Profile page ("Profil Saya").** Read-only, no forms:
  - Full name, login email, join date.
  - **Connection code card:** the doctor's own code in large type, a "Salin Kode" button with a "Kode disalin." toast, and the helper text from Section 8. No regenerate action. The code is shown here and nowhere else in the dashboard.
  - "Keluar".
- **Uncalibrated notice (decided).** Title "Ambang belum dikalibrasi", body from Section 8. Placement: a banner at the top of the Tremor tests part of Patient detail that **cannot be dismissed**, and one short line under the flagged list on the Overview. Not on the landing page. Remove it only when the team says the thresholds are calibrated.
- No comparisons between patients. No ranking.

---

## 11. Testing

- Type-check and tests must pass before work is reported done.
- Unit-test the status mapper, the `snake_case` → `camelCase` mappers, date helpers, and any filter logic. Flags come from the backend view; test only how the web maps and shows them.
- Unit-test the activity status helper at its edges: just under 5 days, exactly 5 days, just under 14 days, exactly 14 days, and patients with no measurement before and after 14 days since `connected_at`.
- Unit-test the compliance helper: bucket edges (49/50%, 79/80%), patients with no scheduled dose, and the 2-hour missed rule.
- Unit-test the schedule rules: which doses fall on a given date (active flag, start and end date, `times`), schedule form validation (1 to 8 unique ascending `HH:MM` times, `end_date` not before `start_date`), and the missed-dose derivation from schedule and log.
- No component tests in the MVP; check loading, empty, and error states by hand.
- No tests that depend on a real Supabase project; mock the data layer.
- Test runner: Vitest (Section 5).

---

## 12. Out of scope (do not add unless explicitly asked)

Creating or editing measurements, patient-facing features (the public landing page is the only exception), patient sign-up on the web, a patient section or app download button on the landing page, contact / newsletter / waitlist forms, analytics or tracking on the landing page, per-patient connection codes, organization / admin-organization roles, doctor verification (STR) and professional info, profile photo, editing the doctor's profile, changing the password in the web, patient personal fields other than name and phone number, regenerating or changing the connection code, notification center, calendar view, patient diagnosis or disease-name output, accuracy claims, medication recommendations, raw-signal display or export, password reset and email confirmation, an admin UI for the medicine catalog, a medicine request / review flow, writing or editing medication logs, hard deletion of schedules or logs, dose validation, drug-interaction checks, medication reminders, analytics tracking, and any backend implementation (tables, RLS, functions), which belongs to the backend team.

---

## 13. Commands

```bash
npm install
npm run dev          # development server
npm run typecheck    # react-router typegen && tsc
npm run build        # SPA build: static files to deploy
npm run gen:types    # regenerate app/lib/database.types.ts from the Supabase project
npm test             # Vitest: unit tests for the lib/ helpers
```

- `gen:types` needs a one-time `npx supabase login`. Run it from `npm run` (not a raw PowerShell `>` redirect, which writes UTF-16). Regenerate whenever the backend changes the schema, then run `npm run typecheck` to find code that no longer matches.

- `npm run start` (`react-router-serve`) comes from the SSR template and is not used in SPA mode. `@react-router/node`, `@react-router/serve`, and that script can be removed once the SPA build is confirmed.
- After the first SPA build, record here the output folder to deploy (expected `build/client`).

---

## 14. Working agreements

- Ask before adding a dependency, a new top-level folder, a new module, or a new architectural layer.
- Never invent literature values, citations, accuracy numbers, or validation results. Unknown means ask.
- The data contract is the source of truth for anything read from or written to the backend. Do not add, rename, or drop fields on your own; raise it instead.
- Never write result text that implies a diagnosis (Sections 2 and 8).
- Keep `.agents/skills/` unedited; read the React Router skill before routing work.
- UI strings in Bahasa Indonesia; everything developer-facing in English.
- Run type-check, build, and tests (`npm test`) before reporting work as done, and state what you ran.
- Commit messages: English, imperative mood, one logical change per commit.