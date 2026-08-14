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
