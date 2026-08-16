-- ============================================================
-- CRITICAL: column-level privilege escalation via direct client calls.
-- RLS policies for UPDATE only gate which ROWS are visible/writable
-- (via the primary key or a foreign-key chain); they do not restrict
-- which COLUMNS get changed on an otherwise-writable row. Any
-- authenticated tenant user, using the public anon key + their own
-- valid session (both already exposed to the browser by design),
-- could call the Supabase client directly from devtools and update
-- columns the app's own UI never exposes:
--   - profiles.role: escalate themselves to 'superadmin'.
--   - inmobiliarias.estado / limite_alquileres / fecha_proximo_cobro /
--     email_contacto: un-suspend themselves, remove their plan limit,
--     or mark themselves permanently paid.
-- These triggers pin those columns to their prior value for anyone
-- who isn't superadmin, regardless of what the UPDATE statement asks
-- for. INSERT is unaffected (profile/inmobiliaria creation goes
-- through the service-role admin client in superadmin actions).
-- ============================================================

create or replace function public.profiles_lock_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.role := old.role;
  new.inmobiliaria_id := old.inmobiliaria_id;
  return new;
end;
$$;

create trigger profiles_lock_privileged_columns
  before update on public.profiles
  for each row
  execute function public.profiles_lock_privileged_columns();

create or replace function public.inmobiliarias_lock_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_superadmin() then
    return new;
  end if;
  new.email_contacto := old.email_contacto;
  new.limite_alquileres := old.limite_alquileres;
  new.estado := old.estado;
  new.fecha_proximo_cobro := old.fecha_proximo_cobro;
  return new;
end;
$$;

create trigger inmobiliarias_lock_admin_columns
  before update on public.inmobiliarias
  for each row
  execute function public.inmobiliarias_lock_admin_columns();

-- ============================================================
-- MEDIUM: contactos cross-tenant data leak.
-- The old "orphan" SELECT clause (needed to work around Postgres
-- re-checking the SELECT policy during INSERT ... RETURNING before
-- the alquiler_partes link exists) made ANY not-yet-linked contacto
-- readable by ANY authenticated user of ANY tenant — permanently, if
-- the wizard ever failed between creating the contacto and linking
-- it. Adding an inmobiliaria_id captured at insert time removes the
-- need for that workaround entirely: ownership no longer depends on
-- a second row existing yet.
-- ============================================================

alter table public.contactos add column inmobiliaria_id uuid references public.inmobiliarias(id) on delete cascade;

update public.contactos c
set inmobiliaria_id = a.inmobiliaria_id
from public.alquiler_partes ap
join public.alquileres a on a.id = ap.alquiler_id
where ap.contacto_id = c.id and c.inmobiliaria_id is null;

drop policy "contactos insert authenticated" on public.contactos;
drop policy "contactos select tenant" on public.contactos;
drop policy "contactos update tenant" on public.contactos;

create policy "contactos tenant insert" on public.contactos
  for insert with check (inmobiliaria_id = public.my_inmobiliaria_id());
create policy "contactos tenant select" on public.contactos
  for select using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "contactos tenant update" on public.contactos
  for update using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());

-- ============================================================
-- MEDIUM: storage uploads were only validated client-side (JS file
-- picker accept/size checks), trivially bypassed by calling the
-- Storage API directly with a valid session. Enforce type/size at
-- the bucket level so the API itself rejects non-conforming uploads.
-- ============================================================

update storage.buckets set file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'] where id = 'propiedad-fotos';
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['application/pdf'] where id = 'contratos';
update storage.buckets set file_size_limit = 1048576, allowed_mime_types = array['image/jpeg', 'image/png', 'image/svg+xml'] where id = 'logos';
