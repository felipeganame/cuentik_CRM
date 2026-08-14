insert into storage.buckets (id, name, public)
values
  ('propiedad-fotos', 'propiedad-fotos', false),
  ('contratos', 'contratos', false),
  ('logos', 'logos', false)
on conflict (id) do nothing;

-- Objects are stored under a path prefixed with the inmobiliaria_id:
-- {inmobiliaria_id}/{propiedad_id or alquiler_id}/{filename}. Scope access
-- by checking the first path segment against the caller's tenant.
create policy "propiedad-fotos tenant access" on storage.objects
  for all using (
    bucket_id = 'propiedad-fotos'
    and (public.is_superadmin() or (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text)
  )
  with check (
    bucket_id = 'propiedad-fotos'
    and (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text
  );

create policy "contratos tenant access" on storage.objects
  for all using (
    bucket_id = 'contratos'
    and (public.is_superadmin() or (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text)
  )
  with check (
    bucket_id = 'contratos'
    and (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text
  );

create policy "logos tenant access" on storage.objects
  for all using (
    bucket_id = 'logos'
    and (public.is_superadmin() or (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text)
  )
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = public.my_inmobiliaria_id()::text
  );
