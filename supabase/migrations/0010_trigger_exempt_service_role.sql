-- The privilege-lock triggers from 0009 correctly block the 'authenticated'
-- Postgres role (regular users, both tenant and superadmin sessions) from
-- changing profiles.role/inmobiliaria_id or the admin-only inmobiliarias
-- columns directly. They should NOT block 'service_role' (used only by
-- trusted server-side code via the service-role key, e.g. correcting a
-- profile's agency assignment) — that's a legitimate, already-privileged
-- caller, not the thing these triggers exist to stop.

create or replace function public.profiles_lock_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  new.role := old.role;
  new.inmobiliaria_id := old.inmobiliaria_id;
  return new;
end;
$$;

create or replace function public.inmobiliarias_lock_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_superadmin() then
    return new;
  end if;
  new.email_contacto := old.email_contacto;
  new.limite_alquileres := old.limite_alquileres;
  new.estado := old.estado;
  new.fecha_proximo_cobro := old.fecha_proximo_cobro;
  return new;
end;
$$;
