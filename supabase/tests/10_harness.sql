-- RLS test harness. Run as a superuser on the test database (see run.sh).
create schema if not exists tests;

create or replace function tests.login(_uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', _uid, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;

create or replace function tests.anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
end $$;

create or replace function tests.logout() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end $$;

-- Count rows returned by a query.
create or replace function tests.rows(_sql text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute 'select count(*) from (' || _sql || ') _q' into n;
  return n;
end $$;

create or replace function tests.expect_rows(_sql text, _expected bigint, _label text) returns void language plpgsql as $$
declare n bigint;
begin
  n := tests.rows(_sql);
  if n <> _expected then
    raise exception 'FAIL [%]: expected % rows, got %  (%)', _label, _expected, n, _sql;
  end if;
  raise notice 'ok  %', _label;
end $$;

-- Expect the statement to raise (permission denied, RLS violation, guard trigger).
create or replace function tests.expect_error(_sql text, _label text) returns void language plpgsql as $$
begin
  begin
    execute _sql;
  exception when others then
    raise notice 'ok  % (%: %)', _label, sqlstate, left(sqlerrm, 80);
    return;
  end;
  raise exception 'FAIL [%]: statement succeeded but should have failed (%)', _label, _sql;
end $$;

-- Expect the statement to succeed.
create or replace function tests.expect_ok(_sql text, _label text) returns void language plpgsql as $$
begin
  execute _sql;
  raise notice 'ok  %', _label;
end $$;

-- Data modifying statement that must affect zero rows (RLS silently filters).
create or replace function tests.expect_no_effect(_sql text, _label text) returns void language plpgsql as $$
declare n bigint;
begin
  execute 'with _q as (' || _sql || ' returning 1) select count(*) from _q' into n;
  if n <> 0 then
    raise exception 'FAIL [%]: statement affected % rows but should affect none (%)', _label, n, _sql;
  end if;
  raise notice 'ok  %', _label;
end $$;

grant usage on schema tests to anon, authenticated;
grant execute on all functions in schema tests to anon, authenticated;
