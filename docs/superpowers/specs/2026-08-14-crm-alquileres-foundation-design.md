# CRM Alquileres — Foundation + Inmobiliaria Core

Source design: Claude Design project `55eef4f9-0abb-42d1-a46f-b9bc2ea5b111`, file `CRM Alquileres.dc.html`. That file is an interactive mockup (Locaria — CRM de alquileres, Córdoba) with in-memory mock state; this spec turns it into a real multi-tenant SaaS.

## Goals

Build the foundation (schema, auth, multi-tenancy) and the inmobiliaria-facing core (dashboard, alquiler wizard, alquiler detail, configuración) as a real app on Next.js + Supabase + Vercel. Superadmin module and billing automation are explicitly deferred (see Out of scope).

## Stack

- Next.js (App Router), deployed on Vercel.
- Supabase: Postgres (with RLS), Auth (email/password), Storage.
- Supabase project already linked (`supabase/` in repo, project-ref `dakrneqrjtwuzyrbrses`).
- Writes go through Next.js server actions (not client-side Supabase calls), so validation and RLS enforcement stay server-side and match Vercel/Next.js idioms.

## Tenancy model

One `auth.users` row = one inmobiliaria (agency-level login, matches the mockup). No multi-seat/multi-user-per-agency in this phase.

## Data model

- `profiles` — 1 row per `auth.users`. `role` (`superadmin` | `inmobiliaria`), `inmobiliaria_id` (FK, null for superadmin).
- `inmobiliarias` — nombre, email_contacto, telefono, limite_propiedades, estado, fecha_vencimiento, logo_url, cobro_estado. (Columns exist now; superadmin UI to manage them arrives in a later spec — for this phase, seeded via SQL.)
- `alquileres` — FK `inmobiliaria_id`. monto, dia_pago, metodo_pago, cuenta, frecuencia_pago, actualizacion_tipo, actualizacion_valor, frecuencia_actualizacion, fecha_inicio, fecha_fin, contrato_pdf_path.
- `propiedades` — FK `alquiler_id` (a contract can span >1 property, e.g. depto + cochera). direccion, localidad, tipo.
- `propiedad_fotos` — FK `propiedad_id`, storage path. Up to 15 per property.
- `contactos` — locador/locatario/garante people: nombre, dni, telefono, email, domicilio. Reusable across contracts (a landlord can appear on multiple alquileres).
- `alquiler_partes` — junction: alquiler_id, contacto_id, rol (`locador` | `locatario` | `garante`). Supports adding multiple locatarios/garantes per contract.
- `servicios` — FK `propiedad_id`. nombre, paga (`locador`|`locatario`), referencia, activo, pagado_mes_actual.
- `pagos_historial` — FK `alquiler_id`. mes, estado (`pagado`|`pendiente`|`vencido`).

`estado_pago` for an alquiler is derived from its current-month `pagos_historial` row at read time, not stored as a duplicate column — avoids drift between the two.

## Auth & RLS

- Supabase Auth email/password. `profiles.role` + `profiles.inmobiliaria_id` set at account creation time (seeded via SQL for the first test agency in this phase).
- RLS on every tenant table (`alquileres`, `propiedades`, `contactos` via `alquiler_partes` join, `servicios`, `pagos_historial`, `propiedad_fotos`): visible/writable only where `inmobiliaria_id` matches the caller's `profiles.inmobiliaria_id`, or caller's `profiles.role = 'superadmin'`.
- Next.js middleware reads the Supabase session: unauthenticated → redirect `/login`; wrong role → redirect to their correct home.
- Storage bucket policies scoped the same way, via `inmobiliaria_id`-prefixed paths.

## Pages & flows

- `/login` — email/password sign-in.
- `/dashboard` — alquileres list: search (dirección/locatario/locador), status filter chips (Todos/Al día/Pendiente/Deuda), KPI cards, row → detail.
- `/dashboard/alquileres/nuevo` — 5-step wizard: Propiedad(es) → Partes (locador/locatario/garante) → Pago (monto, condiciones, actualización, contrato PDF) → Servicios (por propiedad) → Confirmar. Local form state until final submit, which transactionally inserts alquiler + propiedades + contactos + alquiler_partes + servicios and uploads fotos/contrato.
- `/dashboard/alquileres/[id]` — detail page, 4 tabs: Resumen (locador/locatario/condiciones, inline-editable), Servicios (per-propiedad table, toggle activo/pagado), Pagos (mes actual + historial), Fotos y contrato.
- `/dashboard/configuracion` — perfil inmobiliaria (nombre, contacto, logo, teléfono) + cambiar contraseña.

## File storage

- Buckets, all private, access via server-generated signed URLs:
  - `propiedad-fotos`: `{inmobiliaria_id}/{propiedad_id}/{filename}`
  - `contratos`: `{inmobiliaria_id}/{alquiler_id}/{filename}`
  - `logos`: `{inmobiliaria_id}/{filename}`
- Client-side validation before upload: JPEG only, ≤1MB/file, ≤15 files per property (mockup's stated limits).
- The mockup's `image-slot.js`/`support.js` are Claude Design preview-only tooling — not used in the real app. Real uploads use a plain file input + drag-and-drop component.

## Out of scope (deferred to later specs)

- Superadmin module: agency CRUD, cobro mensual toggle, password reset for agencies, límite de propiedades enforcement UI. For this phase, one test inmobiliaria + login is seeded via SQL migration.
- Billing/payment automation — the mockup itself says cobro is tracked manually for now; stays manual.
- Multi-user-per-agency (multiple staff logins per inmobiliaria).
