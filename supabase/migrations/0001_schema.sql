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
