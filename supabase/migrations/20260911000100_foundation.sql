-- 0001 Foundation: extensions, private schema, shared helpers, enums.
-- Everything in `private` is unreachable through PostgREST and is used by RLS
-- policies and by other database functions only.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_kind as enum ('employee', 'client');
create type public.practice as enum ('cybersecurity', 'development', 'ai', 'infrastructure', 'mixed');
create type public.project_status as enum ('draft', 'planned', 'active', 'on_hold', 'completed', 'cancelled');
create type public.project_member_role as enum ('manager', 'member', 'viewer');
create type public.milestone_status as enum ('planned', 'in_progress', 'completed');
create type public.task_status as enum ('todo', 'in_progress', 'review', 'done', 'cancelled');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.employment_status as enum ('active', 'inactive', 'on_leave', 'ended');
create type public.document_kind as enum ('contract', 'id', 'certificate', 'experience_certificate', 'training_certificate', 'other');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'void');
create type public.invoice_status as enum ('draft', 'issued', 'sent', 'partially_paid', 'paid', 'overdue', 'void');
create type public.engagement_type as enum ('penetration_test', 'compromise_assessment', 'dfir', 'security_assessment', 'red_team', 'consulting', 'training');
create type public.engagement_status as enum ('scoping', 'authorised', 'active', 'reporting', 'remediation', 'retest', 'closed', 'cancelled');
create type public.asset_type as enum ('web_app', 'api', 'host', 'network', 'cloud', 'mobile_app', 'identity', 'other');
create type public.finding_severity as enum ('informational', 'low', 'medium', 'high', 'critical');
create type public.finding_status as enum ('open', 'in_remediation', 'remediated', 'retest_pending', 'verified', 'accepted_risk', 'false_positive');
create type public.report_status as enum ('draft', 'final');
create type public.content_status as enum ('draft', 'review', 'scheduled', 'published', 'archived');
create type public.language_status as enum ('en_only', 'ar_only', 'both');
create type public.certificate_type as enum ('training', 'internship', 'experience', 'appreciation', 'other');
create type public.certificate_status as enum ('draft', 'issued', 'revoked');
create type public.support_status as enum ('open', 'in_progress', 'waiting_client', 'resolved', 'closed');
create type public.locale as enum ('en', 'ar');

-- ---------------------------------------------------------------------------
-- Shared trigger helpers
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.slugify(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9؀-ۿ]+', '-', 'g'));
$$;
