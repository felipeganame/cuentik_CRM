-- Replace the loose direccion/localidad text with structured address
-- fields, add currency to precio, and add superficie_semicubierta —
-- refinements requested after using the feature: address needs to be
-- país/provincia/ciudad/calle/número (barrio optional), and covered vs.
-- semi-covered surface are distinct concepts for apartments/locals.

alter table public.publicaciones drop column direccion;
alter table public.publicaciones drop column localidad;

alter table public.publicaciones add column pais text not null default 'Argentina';
alter table public.publicaciones add column provincia text not null default 'Córdoba';
alter table public.publicaciones add column ciudad text not null default '';
alter table public.publicaciones add column calle text not null default '';
alter table public.publicaciones add column numero text not null default '';
alter table public.publicaciones add column barrio text;

alter table public.publicaciones add column moneda text not null default 'ARS' check (moneda in ('ARS', 'USD'));
alter table public.publicaciones add column superficie_semicubierta numeric;
