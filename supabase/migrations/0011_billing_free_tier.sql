-- auth.role() reads the PostgREST JWT claim and is NULL for direct DB
-- connections (migrations, SQL editor) — there's no JWT context at all.
-- Those callers require DB credentials only trusted parties have, so
-- it's correct (and necessary — migrations run as a plain Postgres
-- role, not 'service_role') to exempt them from the privilege-lock
-- triggers the same way service_role is exempted.
create or replace function public.inmobiliarias_lock_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() is null or auth.role() = 'service_role' or public.is_superadmin() then
    return new;
  end if;
  new.email_contacto := old.email_contacto;
  new.limite_alquileres := old.limite_alquileres;
  new.estado := old.estado;
  new.fecha_proximo_cobro := old.fecha_proximo_cobro;
  new.exento_cobro := old.exento_cobro;
  return new;
end;
$$;

create or replace function public.profiles_lock_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() is null or auth.role() = 'service_role' then
    return new;
  end if;
  new.role := old.role;
  new.inmobiliaria_id := old.inmobiliaria_id;
  return new;
end;
$$;

alter table public.inmobiliarias add column exento_cobro boolean not null default false;

-- Billing cycle now only starts once an agency creates its 2nd alquiler
-- (the 1st is free); reset any account that predates this rule so its
-- fecha_proximo_cobro reflects reality instead of the old
-- set-at-creation-regardless value.
update public.inmobiliarias i
set fecha_proximo_cobro = case
  when (select count(*) from public.alquileres a where a.inmobiliaria_id = i.id) >= 2
    then (current_date + interval '1 month')::date
  else null
end;
