create table public.config (
  id int primary key default 1 check (id = 1),
  precio_por_alquiler numeric not null default 1000,
  updated_at timestamptz not null default now()
);
insert into public.config (id) values (1);

alter table public.config enable row level security;

create policy "config select any authenticated" on public.config
  for select using (auth.uid() is not null);
create policy "config update superadmin" on public.config
  for update using (public.is_superadmin());

grant select on public.config to authenticated;
grant update on public.config to authenticated;

alter table public.inmobiliarias rename column fecha_vencimiento to fecha_proximo_cobro;
alter table public.inmobiliarias drop column cobro_estado;
alter table public.inmobiliarias drop column monto_mensual;
