# CRM Alquileres — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the real Locaria app on Next.js + Supabase + Vercel: full DB schema with RLS, a working login, and an authenticated dashboard shell — a thin vertical slice a real user can log into, even though the alquileres list/wizard/detail are still empty (that's the next plan).

**Architecture:** Next.js App Router (TypeScript, no CSS framework — inline styles matching the source mockup's oklch palette). Supabase Postgres with row-level security for multi-tenancy (`profiles.inmobiliaria_id`), Supabase Auth for email/password login, all reads/writes server-side via Server Components and Server Actions using `@supabase/ssr`. One `auth.users` row = one inmobiliaria (agency-level login, per the approved spec).

**Tech Stack:** Next.js 16.3.1, React 19.2.8, TypeScript 7.0.2, @supabase/ssr 0.12.4, @supabase/supabase-js 2.112.3, Supabase CLI (already linked, project-ref `dakrneqrjtwuzyrbrses`), Playwright 1.62.1 for e2e verification.

**Spec:** `docs/superpowers/specs/2026-08-14-crm-alquileres-foundation-design.md`

---

## Before you start

This plan runs at the repo root (`/Users/felipeganame/Desktop/PROYE TO/cuentik_CRM`), which currently has only `docs/`, `supabase/` (CLI-linked, empty besides `.temp/`), and `.claude/`. There is no `package.json` yet — Task 1 creates one by hand rather than via `create-next-app`, so every file's contents are exact and reviewable up front.

You will need, at some point before Task 4, the project's anon key and service role key from the Supabase dashboard (Project Settings → API) for project ref `dakrneqrjtwuzyrbrses`. Task 3 creates `.env.local` as a placeholder; fill in the real keys before running anything that talks to Supabase (Task 4 onward).

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `next-env.d.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "locaria-crm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "seed": "tsx scripts/seed.ts",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "@supabase/ssr": "0.12.4",
    "@supabase/supabase-js": "2.112.3"
  },
  "devDependencies": {
    "typescript": "7.0.2",
    "@types/node": "26.2.0",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "tsx": "4.23.12",
    "dotenv": "17.4.2",
    "@playwright/test": "1.62.1"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create `next-env.d.ts`**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
.next/
.vercel/
.env*.local
supabase/.temp/
playwright-report/
test-results/
```

- [ ] **Step 6: Install dependencies**

Run: `cd "/Users/felipeganame/Desktop/PROYE TO/cuentik_CRM" && npm install`
Expected: installs succeed, `package-lock.json` and `node_modules/` created, no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs next-env.d.ts .gitignore
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Base layout and styles

**Files:**
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`

- [ ] **Step 1: Create `app/globals.css`**

```css
body{margin:0;font-family:'Source Sans 3',system-ui,sans-serif;background:oklch(97% 0.004 250);-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
input,select,textarea{font-family:inherit}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-thumb{background:oklch(85% 0.006 250);border-radius:4px}
a{color:oklch(55% 0.16 250)}
a:hover{color:oklch(46% 0.16 250)}
```

- [ ] **Step 2: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Locaria — CRM de alquileres',
  description: 'CRM de alquileres para inmobiliarias de Córdoba',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create `app/page.tsx`**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

- [ ] **Step 4: Verify the app builds**

Run: `npm run build`
Expected: build succeeds (it will warn or fail on missing `/login` and `/dashboard` routes referenced later — at this point only `/` exists, so build should succeed with a single static route).

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css app/page.tsx
git commit -m "feat: base app layout and global styles"
```

---

### Task 3: Environment variables

**Files:**
- Create: `.env.local.example`
- Create: `.env.local` (not committed — gitignored by Task 1)

- [ ] **Step 1: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://dakrneqrjtwuzyrbrses.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 2: Create `.env.local` with real values**

Copy `.env.local.example` to `.env.local`, then fill `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard: Project Settings → API, project `dakrneqrjtwuzyrbrses`.

Run: `cp .env.local.example .env.local`
Expected: file created. Then manually paste in the two keys — this file is gitignored, never commit it.

- [ ] **Step 3: Commit the example file only**

```bash
git add .env.local.example
git commit -m "chore: add env var template"
```

---

### Task 4: Database schema migration

**Files:**
- Create: `supabase/migrations/0001_schema.sql`

- [ ] **Step 1: Create `supabase/migrations/0001_schema.sql`**

```sql
create extension if not exists "pgcrypto";

create table public.inmobiliarias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email_contacto text not null,
  telefono text,
  limite_propiedades integer not null default 20,
  estado text not null default 'Activo' check (estado in ('Activo','Suspendido')),
  fecha_vencimiento date,
  logo_url text,
  cobro_estado text not null default 'Pendiente' check (cobro_estado in ('Pagado','Pendiente')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('superadmin','inmobiliaria')),
  inmobiliaria_id uuid references public.inmobiliarias(id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now(),
  constraint profiles_role_tenant_check check (
    (role = 'inmobiliaria' and inmobiliaria_id is not null) or
    (role = 'superadmin' and inmobiliaria_id is null)
  )
);
create index profiles_inmobiliaria_id_idx on public.profiles(inmobiliaria_id);

create table public.alquileres (
  id uuid primary key default gen_random_uuid(),
  inmobiliaria_id uuid not null references public.inmobiliarias(id) on delete cascade,
  monto numeric(12,2) not null,
  dia_pago integer not null check (dia_pago between 1 and 31),
  metodo_pago text not null,
  cuenta text,
  frecuencia_pago text not null default 'Mensual',
  actualizacion_tipo text not null check (actualizacion_tipo in ('porcentaje','indice')),
  actualizacion_valor text not null,
  frecuencia_actualizacion text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  contrato_pdf_path text,
  created_at timestamptz not null default now()
);
create index alquileres_inmobiliaria_id_idx on public.alquileres(inmobiliaria_id);

create table public.propiedades (
  id uuid primary key default gen_random_uuid(),
  alquiler_id uuid not null references public.alquileres(id) on delete cascade,
  direccion text not null,
  localidad text not null,
  tipo text not null,
  created_at timestamptz not null default now()
);
create index propiedades_alquiler_id_idx on public.propiedades(alquiler_id);

create table public.propiedad_fotos (
  id uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index propiedad_fotos_propiedad_id_idx on public.propiedad_fotos(propiedad_id);

create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dni text,
  telefono text,
  email text,
  domicilio text,
  created_at timestamptz not null default now()
);

create table public.alquiler_partes (
  id uuid primary key default gen_random_uuid(),
  alquiler_id uuid not null references public.alquileres(id) on delete cascade,
  contacto_id uuid not null references public.contactos(id) on delete cascade,
  rol text not null check (rol in ('locador','locatario','garante')),
  created_at timestamptz not null default now()
);
create index alquiler_partes_alquiler_id_idx on public.alquiler_partes(alquiler_id);
create index alquiler_partes_contacto_id_idx on public.alquiler_partes(contacto_id);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  nombre text not null,
  paga text not null check (paga in ('locador','locatario')),
  referencia text,
  activo boolean not null default true,
  pagado_mes_actual boolean not null default false,
  created_at timestamptz not null default now()
);
create index servicios_propiedad_id_idx on public.servicios(propiedad_id);

create table public.pagos_historial (
  id uuid primary key default gen_random_uuid(),
  alquiler_id uuid not null references public.alquileres(id) on delete cascade,
  mes text not null,
  estado text not null check (estado in ('pagado','pendiente','vencido')),
  created_at timestamptz not null default now()
);
create index pagos_historial_alquiler_id_idx on public.pagos_historial(alquiler_id);
```

- [ ] **Step 2: Apply the migration to the linked project**

Run: `cd "/Users/felipeganame/Desktop/PROYE TO/cuentik_CRM" && supabase db push`
Expected: CLI reports migration `0001_schema.sql` applied, no errors.

- [ ] **Step 3: Verify tables exist**

Run: `supabase db query --linked "select table_name from information_schema.tables where table_schema = 'public' order by table_name;"`
Expected output includes all 9 tables: `alquileres`, `alquiler_partes`, `contactos`, `inmobiliarias`, `pagos_historial`, `profiles`, `propiedad_fotos`, `propiedades`, `servicios`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_schema.sql
git commit -m "feat: add core database schema"
```

---

### Task 5: Row-level security policies

**Files:**
- Create: `supabase/migrations/0002_rls.sql`

- [ ] **Step 1: Create `supabase/migrations/0002_rls.sql`**

```sql
-- Helper functions: read the caller's role/tenant once, security definer so
-- they can read `profiles` even though `profiles` itself has RLS enabled.
create or replace function public.is_superadmin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'superadmin'
  );
$$;

create or replace function public.my_inmobiliaria_id()
returns uuid
language sql security definer stable
set search_path = public
as $$
  select inmobiliaria_id from public.profiles where id = auth.uid();
$$;

-- inmobiliarias
alter table public.inmobiliarias enable row level security;

create policy "inmobiliarias select own" on public.inmobiliarias
  for select using (id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "inmobiliarias update own or superadmin" on public.inmobiliarias
  for update using (id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "inmobiliarias insert superadmin" on public.inmobiliarias
  for insert with check (public.is_superadmin());
create policy "inmobiliarias delete superadmin" on public.inmobiliarias
  for delete using (public.is_superadmin());

-- profiles
alter table public.profiles enable row level security;

create policy "profiles select self or superadmin" on public.profiles
  for select using (id = auth.uid() or public.is_superadmin());
create policy "profiles update self" on public.profiles
  for update using (id = auth.uid());

-- alquileres
alter table public.alquileres enable row level security;

create policy "alquileres tenant select" on public.alquileres
  for select using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "alquileres tenant insert" on public.alquileres
  for insert with check (inmobiliaria_id = public.my_inmobiliaria_id());
create policy "alquileres tenant update" on public.alquileres
  for update using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "alquileres tenant delete" on public.alquileres
  for delete using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());

-- propiedades (scoped via alquileres)
alter table public.propiedades enable row level security;

create policy "propiedades tenant select" on public.propiedades
  for select using (exists (
    select 1 from public.alquileres a where a.id = propiedades.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "propiedades tenant insert" on public.propiedades
  for insert with check (exists (
    select 1 from public.alquileres a where a.id = propiedades.alquiler_id
      and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "propiedades tenant update" on public.propiedades
  for update using (exists (
    select 1 from public.alquileres a where a.id = propiedades.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "propiedades tenant delete" on public.propiedades
  for delete using (exists (
    select 1 from public.alquileres a where a.id = propiedades.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));

-- propiedad_fotos (scoped via propiedades -> alquileres)
alter table public.propiedad_fotos enable row level security;

create policy "propiedad_fotos tenant select" on public.propiedad_fotos
  for select using (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = propiedad_fotos.propiedad_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "propiedad_fotos tenant insert" on public.propiedad_fotos
  for insert with check (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = propiedad_fotos.propiedad_id and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "propiedad_fotos tenant delete" on public.propiedad_fotos
  for delete using (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = propiedad_fotos.propiedad_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));

-- contactos: no direct tenant column, scoped via alquiler_partes -> alquileres.
-- insert is allowed for any authenticated inmobiliaria user (the wizard creates
-- the contacto row and its alquiler_partes link in the same transaction).
alter table public.contactos enable row level security;

create policy "contactos insert authenticated" on public.contactos
  for insert with check (auth.uid() is not null);
create policy "contactos select tenant" on public.contactos
  for select using (public.is_superadmin() or exists (
    select 1 from public.alquiler_partes ap join public.alquileres a on a.id = ap.alquiler_id
      where ap.contacto_id = contactos.id and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "contactos update tenant" on public.contactos
  for update using (public.is_superadmin() or exists (
    select 1 from public.alquiler_partes ap join public.alquileres a on a.id = ap.alquiler_id
      where ap.contacto_id = contactos.id and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));

-- alquiler_partes
alter table public.alquiler_partes enable row level security;

create policy "alquiler_partes tenant select" on public.alquiler_partes
  for select using (exists (
    select 1 from public.alquileres a where a.id = alquiler_partes.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "alquiler_partes tenant insert" on public.alquiler_partes
  for insert with check (exists (
    select 1 from public.alquileres a where a.id = alquiler_partes.alquiler_id
      and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "alquiler_partes tenant delete" on public.alquiler_partes
  for delete using (exists (
    select 1 from public.alquileres a where a.id = alquiler_partes.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));

-- servicios (scoped via propiedades -> alquileres)
alter table public.servicios enable row level security;

create policy "servicios tenant select" on public.servicios
  for select using (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = servicios.propiedad_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "servicios tenant insert" on public.servicios
  for insert with check (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = servicios.propiedad_id and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "servicios tenant update" on public.servicios
  for update using (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = servicios.propiedad_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "servicios tenant delete" on public.servicios
  for delete using (exists (
    select 1 from public.propiedades p join public.alquileres a on a.id = p.alquiler_id
      where p.id = servicios.propiedad_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));

-- pagos_historial (scoped via alquileres)
alter table public.pagos_historial enable row level security;

create policy "pagos_historial tenant select" on public.pagos_historial
  for select using (exists (
    select 1 from public.alquileres a where a.id = pagos_historial.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "pagos_historial tenant insert" on public.pagos_historial
  for insert with check (exists (
    select 1 from public.alquileres a where a.id = pagos_historial.alquiler_id
      and a.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "pagos_historial tenant update" on public.pagos_historial
  for update using (exists (
    select 1 from public.alquileres a where a.id = pagos_historial.alquiler_id
      and (a.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
```

- [ ] **Step 2: Apply the migration**

Run: `supabase db push`
Expected: CLI reports migration `0002_rls.sql` applied, no errors.

- [ ] **Step 3: Verify RLS is enabled on every tenant table**

Run: `supabase db query --linked "select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by relname;"`
Expected: every row shows `relrowsecurity = t` (true) for all 9 tables.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_rls.sql
git commit -m "feat: add row-level security policies for multi-tenancy"
```

---

### Task 6: Seed script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Create `scripts/seed.ts`**

```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = 'marina@delcentro.com.ar';
const TEST_PASSWORD = 'Locaria2026!';

async function main() {
  const { data: inmobiliaria, error: inmobiliariaError } = await supabase
    .from('inmobiliarias')
    .insert({
      nombre: 'Inmobiliaria del Centro',
      email_contacto: TEST_EMAIL,
      telefono: '351 555 0000',
      limite_propiedades: 50,
      estado: 'Activo',
      fecha_vencimiento: '2027-01-01',
    })
    .select()
    .single();

  if (inmobiliariaError) throw inmobiliariaError;

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (userError) throw userError;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userData.user.id,
    role: 'inmobiliaria',
    inmobiliaria_id: inmobiliaria.id,
    nombre: 'Marina Ríos',
  });

  if (profileError) throw profileError;

  console.log('Seeded inmobiliaria:', inmobiliaria.id);
  console.log('Seeded login:', TEST_EMAIL, TEST_PASSWORD);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

- [ ] **Step 2: Run the seed script**

Run: `npm run seed`
Expected output: `Seeded inmobiliaria: <uuid>` followed by `Seeded login: marina@delcentro.com.ar Locaria2026!`

- [ ] **Step 3: Verify the seed landed correctly**

Run: `supabase db query --linked "select i.nombre, p.role, p.nombre as contacto from public.profiles p join public.inmobiliarias i on i.id = p.inmobiliaria_id;"`
Expected: one row — `Inmobiliaria del Centro | inmobiliaria | Marina Ríos`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: add seed script for test inmobiliaria account"
```

---

### Task 7: Supabase client helpers

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

- [ ] **Step 1: Create `lib/supabase/server.ts`**

```typescript
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session on the next request instead. Safe to ignore.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2: Create `lib/supabase/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard');

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/server.ts lib/supabase/middleware.ts
git commit -m "feat: add Supabase server client and session middleware helper"
```

---

### Task 8: Login page

**Files:**
- Create: `app/login/actions.ts`
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create `app/login/actions.ts`**

```typescript
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Email o contraseña incorrectos.' };
  }

  redirect('/dashboard');
}
```

- [ ] **Step 2: Create `app/login/page.tsx`**

```tsx
'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 14, padding: '36px 32px', boxShadow: '0 4px 24px rgba(20,20,30,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'oklch(55% 0.16 250)' }} />
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.01em' }}>Locaria</div>
        </div>
        <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 28 }}>CRM de alquileres · Córdoba</div>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Email</div>
            <input
              name="email"
              type="email"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 14 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Contraseña</div>
            <input
              name="password"
              type="password"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 14 }}
            />
          </div>
          {state.error && (
            <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>
          )}
          <button
            type="submit"
            disabled={pending}
            style={{ marginTop: 6, width: '100%', padding: 11, border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
          >
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/login/actions.ts app/login/page.tsx
git commit -m "feat: add login page"
```

---

### Task 9: Route protection middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create `middleware.ts`** (repo root, next to `app/`)

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect dashboard routes with auth middleware"
```

---

### Task 10: Dashboard shell

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `app/(app)/actions.ts`
- Create: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create `app/(app)/actions.ts`**

```typescript
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

- [ ] **Step 2: Create `app/(app)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from './actions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, inmobiliaria_id')
    .eq('id', user.id)
    .single();

  let inmobiliariaNombre = '';
  if (profile?.inmobiliaria_id) {
    const { data: inmobiliaria } = await supabase
      .from('inmobiliarias')
      .select('nombre')
      .eq('id', profile.inmobiliaria_id)
      .single();
    inmobiliariaNombre = inmobiliaria?.nombre ?? '';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 230, flex: 'none', background: 'oklch(19% 0.02 258)', color: 'oklch(85% 0.01 258)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px 4px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'oklch(55% 0.16 250)' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Locaria</div>
        </div>
        <div style={{ fontSize: 12, color: 'oklch(55% 0.02 258)', padding: '0 6px 22px' }}>{inmobiliariaNombre}</div>
        <div style={{ background: 'oklch(28% 0.03 255)', color: '#fff', fontSize: 13.5, fontWeight: 600, padding: '9px 10px', borderRadius: 8, marginBottom: 2 }}>
          Alquileres
        </div>
        <div style={{ flex: 1 }} />
        <form action={logout}>
          <button
            type="submit"
            style={{ border: 'none', background: 'none', borderTop: '1px solid oklch(28% 0.02 258)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'oklch(40% 0.02 258)', flex: 'none' }} />
            <div style={{ fontSize: 12.5, color: 'oklch(75% 0.01 258)' }}>{profile?.nombre ?? 'Cerrar sesión'}</div>
          </button>
        </form>
      </div>
      <div style={{ flex: 1, padding: '36px 40px', overflow: 'auto' }}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(app)/dashboard/page.tsx`**

```tsx
export default function DashboardPage() {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Tus alquileres</div>
      <div style={{ fontSize: 13.5, color: 'oklch(50% 0.01 255)', marginTop: 4 }}>
        Todavía no hay alquileres cargados.
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify the production build**

Run: `npm run build`
Expected: build succeeds with routes `/`, `/login`, `/dashboard` listed in the output, no type errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(app)"
git commit -m "feat: add authenticated dashboard shell"
```

---

### Task 11: End-to-end verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/login.spec.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

- [ ] **Step 2: Create `tests/e2e/login.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('unauthenticated visit to /dashboard redirects to /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('wrong password shows an error and stays on /login', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('wrong-password');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Email o contraseña incorrectos.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('inmobiliaria can log in and reach the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Tus alquileres')).toBeVisible();
  await expect(page.getByText('Inmobiliaria del Centro')).toBeVisible();
});
```

- [ ] **Step 3: Install the Playwright browser**

Run: `npx playwright install chromium`
Expected: downloads and installs the Chromium build, exits 0.

- [ ] **Step 4: Run the e2e suite**

Run: `npm run test:e2e`
Expected: 3 passed. (Requires `.env.local` filled in from Task 3 and the seed from Task 6 already run against the linked Supabase project.)

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/login.spec.ts
git commit -m "test: add e2e coverage for login and route protection"
```

---

### Task 12: Deployment readiness

**Files:** none created — verification only.

- [ ] **Step 1: Confirm the production build is clean**

Run: `npm run build`
Expected: exits 0, no type errors, no warnings about missing env vars (Next.js only checks usage at runtime, but confirm `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are read correctly by starting `npm run start` locally and loading `/login`).

- [ ] **Step 2: Document required Vercel env vars**

When connecting this repo to Vercel, set these in Project Settings → Environment Variables (all environments): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (only needed if a server action ever uses the service role — none do yet in this plan, but the seed script needs it locally). This step is a manual dashboard action, not a code change — no commit.

---

## What this plan does not build

The alquileres list (real data), the 5-step alquiler wizard, the alquiler detail tabs, and the configuración page are all in the next plan (Inmobiliaria Core), which builds directly on this foundation — same schema, same auth, same dashboard shell. Superadmin (agency management) is a plan after that.
