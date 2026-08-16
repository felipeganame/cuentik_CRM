-- The two trigger functions from 0009 are only meant to fire as BEFORE
-- UPDATE triggers, never called directly. Trigger firing doesn't require
-- EXECUTE privilege on the function, so revoking direct callers (anon,
-- authenticated) removes unnecessary RPC surface without breaking the
-- triggers themselves.
revoke execute on function public.inmobiliarias_lock_admin_columns() from public, anon, authenticated;
revoke execute on function public.profiles_lock_privileged_columns() from public, anon, authenticated;

-- Pre-existing test-helper scaffolding (not part of the app; the `tests`
-- schema isn't in api.schemas so these aren't reachable via the REST API
-- anyway) — pinning search_path closes the theoretical schema-hijack gap
-- the linter flags, at no behavioral cost. Only present on the hosted
-- project (added outside migrations), not on a fresh local reset, so guard
-- on existence.
do $$
begin
  if to_regprocedure('tests.authenticate_as(uuid)') is not null then
    alter procedure tests.authenticate_as(uuid) set search_path = public;
  end if;
  if to_regprocedure('tests.clear_authentication()') is not null then
    alter procedure tests.clear_authentication() set search_path = public;
  end if;
end $$;
