-- 0010 Storage: one bucket per data category. Private buckets are never
-- public; the application serves them through short lived signed URLs after
-- checking the owning database record. The storage.objects policies below
-- mirror the database rules as defense in depth.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-brand-assets', 'public-brand-assets', true, 20971520, null),
  ('public-content', 'public-content', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/avif']),
  ('private-project-documents', 'private-project-documents', false, 52428800, null),
  ('private-security-reports', 'private-security-reports', false, 104857600, null),
  ('private-hr-documents', 'private-hr-documents', false, 26214400, null),
  ('private-finance-documents', 'private-finance-documents', false, 26214400, array['application/pdf']),
  ('private-certificates', 'private-certificates', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create or replace function private.try_uuid(_v text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return _v::uuid;
exception when others then
  return null;
end; $$;
revoke all on function private.try_uuid(text) from public, anon;
grant execute on function private.try_uuid(text) to authenticated, service_role;

-- Public buckets: anyone reads, editors write.
create policy "public brand assets read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-brand-assets');
create policy "public brand assets write" on storage.objects for all to authenticated
  using (bucket_id = 'public-brand-assets' and (select private.has_permission('settings.manage')))
  with check (bucket_id = 'public-brand-assets' and (select private.has_permission('settings.manage')));

create policy "public content read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-content');
create policy "public content write" on storage.objects for all to authenticated
  using (
    bucket_id = 'public-content'
    and ((select private.has_permission('content.write'))
      or ((storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text))
  )
  with check (
    bucket_id = 'public-content'
    and ((select private.has_permission('content.write'))
      or ((storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text))
  );

-- Project documents: <project_id>/<file>
create policy "project documents read" on storage.objects for select to authenticated
  using (
    bucket_id = 'private-project-documents'
    and exists (select 1 from public.project_documents d where d.storage_path = name)
  );
create policy "project documents insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'private-project-documents'
    and (
      (select private.has_permission('projects.write'))
      or private.try_uuid((storage.foldername(name))[1]) in (select private.my_project_ids())
      or private.try_uuid((storage.foldername(name))[1]) in (select private.my_client_project_ids())
    )
  );
create policy "project documents delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'private-project-documents'
    and ((select private.has_permission('projects.write'))
      or private.try_uuid((storage.foldername(name))[1]) in (select private.managed_project_ids()))
  );

-- Security reports and evidence: <engagement_id>/reports/<file> or <engagement_id>/evidence/<finding_id>/<file>
create policy "security files read" on storage.objects for select to authenticated
  using (
    bucket_id = 'private-security-reports'
    and (
      exists (select 1 from public.engagement_reports r where r.storage_path = name)
      or exists (select 1 from public.finding_evidence e where e.storage_path = name)
    )
  );
create policy "security files insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'private-security-reports'
    and (select private.has_permission('security.write'))
    and ((select private.has_permission('security.read_all'))
      or private.try_uuid((storage.foldername(name))[1]) in (select private.my_engagement_ids()))
  );
create policy "security files delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'private-security-reports'
    and (select private.has_permission('security.write'))
    and (select private.has_permission('security.read_all'))
  );

-- HR documents: <employee_user_id>/<file>
create policy "hr documents read" on storage.objects for select to authenticated
  using (
    bucket_id = 'private-hr-documents'
    and exists (select 1 from public.employee_documents d where d.storage_path = name)
  );
create policy "hr documents write" on storage.objects for all to authenticated
  using (bucket_id = 'private-hr-documents' and (select private.has_permission('hr.write')))
  with check (bucket_id = 'private-hr-documents' and (select private.has_permission('hr.write')));

-- Finance documents and certificates: generated by the server (service role).
-- Finance staff can read directly; clients and recipients go through the app.
create policy "finance documents read" on storage.objects for select to authenticated
  using (bucket_id = 'private-finance-documents' and (select private.has_permission('finance.read')));
create policy "certificate files read" on storage.objects for select to authenticated
  using (bucket_id = 'private-certificates' and (select private.has_permission('certificates.read')));
