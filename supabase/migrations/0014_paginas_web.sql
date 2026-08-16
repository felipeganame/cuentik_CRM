-- Página web preview feature: each inmobiliaria can fill basic content
-- (quiénes somos / dónde estamos) and publish listings (publicaciones) for
-- properties they have for sale/rent, viewable via an internal preview
-- only for now — no real public subdomain exists yet (needs a custom
-- domain + a paid Vercel plan for wildcard subdomains).

alter table public.inmobiliarias add column pagina_bio text;
alter table public.inmobiliarias add column pagina_ubicacion text;

create table public.publicaciones (
  id uuid primary key default gen_random_uuid(),
  inmobiliaria_id uuid not null references public.inmobiliarias(id) on delete cascade,
  tipo text not null,
  operacion text not null check (operacion in ('venta', 'alquiler')),
  titulo text not null,
  descripcion text,
  precio numeric,
  localidad text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.publicacion_fotos (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null references public.publicaciones(id) on delete cascade,
  storage_path text not null
);

alter table public.publicaciones enable row level security;
alter table public.publicacion_fotos enable row level security;

create policy "publicaciones tenant select" on public.publicaciones
  for select using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "publicaciones tenant insert" on public.publicaciones
  for insert with check (inmobiliaria_id = public.my_inmobiliaria_id());
create policy "publicaciones tenant update" on public.publicaciones
  for update using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());
create policy "publicaciones tenant delete" on public.publicaciones
  for delete using (inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin());

create policy "publicacion_fotos tenant select" on public.publicacion_fotos
  for select using (exists (
    select 1 from public.publicaciones p where p.id = publicacion_fotos.publicacion_id
      and (p.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));
create policy "publicacion_fotos tenant insert" on public.publicacion_fotos
  for insert with check (exists (
    select 1 from public.publicaciones p where p.id = publicacion_fotos.publicacion_id
      and p.inmobiliaria_id = public.my_inmobiliaria_id()
  ));
create policy "publicacion_fotos tenant delete" on public.publicacion_fotos
  for delete using (exists (
    select 1 from public.publicaciones p where p.id = publicacion_fotos.publicacion_id
      and (p.inmobiliaria_id = public.my_inmobiliaria_id() or public.is_superadmin())
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('publicacion-fotos', 'publicacion-fotos', false, 1048576, array['image/jpeg'])
on conflict (id) do nothing;

create policy "publicacion-fotos tenant access" on storage.objects
  for all using (
    bucket_id = 'publicacion-fotos'
    and (public.is_superadmin() or (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text)
  )
  with check (
    bucket_id = 'publicacion-fotos'
    and (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text
  );
