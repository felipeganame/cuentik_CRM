-- Expand publicaciones with the detail fields a real listing page shows
-- (address, rooms/surface breakdown, expensas, services, video) — modeled
-- after a real local inmobiliaria site's property-detail page.

alter table public.publicaciones add column direccion text;
alter table public.publicaciones add column dormitorios integer;
alter table public.publicaciones add column banos integer;
alter table public.publicaciones add column ambientes integer;
alter table public.publicaciones add column superficie_total numeric;
alter table public.publicaciones add column superficie_cubierta numeric;
alter table public.publicaciones add column superficie_terreno numeric;
alter table public.publicaciones add column antiguedad text;
alter table public.publicaciones add column orientacion text;
alter table public.publicaciones add column estado text;
alter table public.publicaciones add column expensas numeric;
alter table public.publicaciones add column video_url text;
alter table public.publicaciones add column servicios text[] not null default '{}';
