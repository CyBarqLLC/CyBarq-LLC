-- 0007 Public content system: authors, categories, tags, news, articles,
-- public projects, case studies. News and Articles are distinct tables;
-- Public Projects and Case Studies are distinct tables and are never linked
-- to private project data in any public query.

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  name_en text not null,
  name_ar text not null,
  title_en text,
  title_ar text,
  bio_en text,
  bio_ar text,
  avatar_path text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('news', 'article', 'project', 'case_study')),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  position integer not null default 0,
  unique (kind, slug)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_ar text not null
);

-- Shared editorial column set for news and articles.
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '',
  title_ar text not null default '',
  excerpt_en text,
  excerpt_ar text,
  body_en text,
  body_ar text,
  author_id uuid references public.authors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  cover_path text,
  cover_alt_en text,
  cover_alt_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  language_status public.language_status not null default 'both',
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index news_posts_published_idx on public.news_posts (status, published_at desc);

create table public.articles (
  like public.news_posts including all
);
alter table public.articles add constraint articles_author_fk foreign key (author_id) references public.authors(id) on delete set null;
alter table public.articles add constraint articles_category_fk foreign key (category_id) references public.categories(id) on delete set null;
alter table public.articles add column reading_minutes integer;

create table public.news_tags (
  news_id uuid not null references public.news_posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (news_id, tag_id)
);
create table public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table public.public_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '',
  title_ar text not null default '',
  summary_en text,
  summary_ar text,
  body_en text,
  body_ar text,
  practice public.practice not null default 'development',
  client_display_name_en text,
  client_display_name_ar text,
  year integer,
  services_en text[] not null default '{}',
  services_ar text[] not null default '{}',
  cover_path text,
  cover_alt_en text,
  cover_alt_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  language_status public.language_status not null default 'both',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  position integer not null default 0,
  -- Optional reference for editors only. Never selected by public queries.
  internal_project_id uuid references public.projects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index public_projects_published_idx on public.public_projects (status, position, published_at desc);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '',
  title_ar text not null default '',
  summary_en text,
  summary_ar text,
  challenge_en text,
  challenge_ar text,
  solution_en text,
  solution_ar text,
  implementation_en text,
  implementation_ar text,
  outcome_en text,
  outcome_ar text,
  -- [{ "label_en": "", "label_ar": "", "value": "", "verified": true }]
  impact jsonb not null default '[]'::jsonb,
  practice public.practice not null default 'mixed',
  client_display_name_en text,
  client_display_name_ar text,
  industry_en text,
  industry_ar text,
  year integer,
  cover_path text,
  cover_alt_en text,
  cover_alt_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  language_status public.language_status not null default 'both',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  position integer not null default 0,
  internal_project_id uuid references public.projects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index case_studies_published_idx on public.case_studies (status, position, published_at desc);

create trigger news_posts_updated_at before update on public.news_posts for each row execute function private.set_updated_at();
create trigger articles_updated_at before update on public.articles for each row execute function private.set_updated_at();
create trigger public_projects_updated_at before update on public.public_projects for each row execute function private.set_updated_at();
create trigger case_studies_updated_at before update on public.case_studies for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Publishing guard: moving to published or scheduled needs content.publish;
-- published_at is set on first publish; slugs are normalised.
-- ---------------------------------------------------------------------------
create or replace function private.guard_content_publish()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.slug := private.slugify(new.slug);
  if new.slug = '' then
    raise exception 'slug is required' using errcode = '22023';
  end if;
  if (select auth.role()) <> 'service_role' then
    if new.status in ('published', 'scheduled') and (tg_op = 'INSERT' or old.status is distinct from new.status) then
      if not (select private.has_permission('content.publish')) then
        raise exception 'publishing requires content.publish' using errcode = '42501';
      end if;
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if new.status = 'scheduled' and new.scheduled_for is null then
    raise exception 'scheduled content needs a scheduled_for time' using errcode = '22023';
  end if;
  return new;
end; $$;

create trigger news_posts_guard before insert or update on public.news_posts for each row execute function private.guard_content_publish();
create trigger articles_guard before insert or update on public.articles for each row execute function private.guard_content_publish();

create or replace function private.guard_showcase_publish()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.slug := private.slugify(new.slug);
  if new.slug = '' then
    raise exception 'slug is required' using errcode = '22023';
  end if;
  if (select auth.role()) <> 'service_role' then
    if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
      if not (select private.has_permission('content.publish')) then
        raise exception 'publishing requires content.publish' using errcode = '42501';
      end if;
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end; $$;
create trigger public_projects_guard before insert or update on public.public_projects for each row execute function private.guard_showcase_publish();
create trigger case_studies_guard before insert or update on public.case_studies for each row execute function private.guard_showcase_publish();

-- Scheduled content becomes published when its time arrives (called by a cron
-- or on demand by the application with the service role).
create or replace function public.publish_due_content()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare _n integer := 0; _c integer;
begin
  if (select auth.role()) <> 'service_role' and not (select private.has_permission('content.publish')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  update public.news_posts set status = 'published', published_at = coalesce(published_at, scheduled_for)
    where status = 'scheduled' and scheduled_for <= now();
  get diagnostics _c = row_count; _n := _n + _c;
  update public.articles set status = 'published', published_at = coalesce(published_at, scheduled_for)
    where status = 'scheduled' and scheduled_for <= now();
  get diagnostics _c = row_count; _n := _n + _c;
  return _n;
end; $$;
revoke all on function public.publish_due_content() from public, anon;
grant execute on function public.publish_due_content() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: published rows are public; everything else needs content.read.
-- ---------------------------------------------------------------------------
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.news_posts enable row level security;
alter table public.articles enable row level security;
alter table public.news_tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.public_projects enable row level security;
alter table public.case_studies enable row level security;

create policy authors_public_select on public.authors for select to anon, authenticated using (true);
create policy authors_write on public.authors for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy categories_public_select on public.categories for select to anon, authenticated using (true);
create policy categories_write on public.categories for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy tags_public_select on public.tags for select to anon, authenticated using (true);
create policy tags_write on public.tags for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy news_public_select on public.news_posts for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy news_editor_select on public.news_posts for select to authenticated
  using ((select private.has_permission('content.read')));
create policy news_insert on public.news_posts for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy news_update on public.news_posts for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy news_delete on public.news_posts for delete to authenticated
  using ((select private.has_permission('content.publish')));

create policy articles_public_select on public.articles for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy articles_editor_select on public.articles for select to authenticated
  using ((select private.has_permission('content.read')));
create policy articles_insert on public.articles for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy articles_update on public.articles for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy articles_delete on public.articles for delete to authenticated
  using ((select private.has_permission('content.publish')));

create policy news_tags_select on public.news_tags for select to anon, authenticated using (true);
create policy news_tags_write on public.news_tags for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));
create policy article_tags_select on public.article_tags for select to anon, authenticated using (true);
create policy article_tags_write on public.article_tags for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy public_projects_public_select on public.public_projects for select to anon, authenticated
  using (status = 'published');
create policy public_projects_editor_select on public.public_projects for select to authenticated
  using ((select private.has_permission('content.read')));
create policy public_projects_insert on public.public_projects for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy public_projects_update on public.public_projects for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy public_projects_delete on public.public_projects for delete to authenticated
  using ((select private.has_permission('content.publish')));

create policy case_studies_public_select on public.case_studies for select to anon, authenticated
  using (status = 'published');
create policy case_studies_editor_select on public.case_studies for select to authenticated
  using ((select private.has_permission('content.read')));
create policy case_studies_insert on public.case_studies for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy case_studies_update on public.case_studies for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy case_studies_delete on public.case_studies for delete to authenticated
  using ((select private.has_permission('content.publish')));

-- The public API surface never exposes internal_project_id, created_by or
-- updated_by: anon holds column level SELECT only. Public queries must list
-- their columns explicitly (select=* is refused for anon on these tables).
revoke select on public.public_projects from anon;
grant select (id, slug, title_en, title_ar, summary_en, summary_ar, body_en, body_ar, practice,
  client_display_name_en, client_display_name_ar, year, services_en, services_ar, cover_path,
  cover_alt_en, cover_alt_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar,
  language_status, status, published_at, position, created_at, updated_at)
  on public.public_projects to anon;

revoke select on public.case_studies from anon;
grant select (id, slug, title_en, title_ar, summary_en, summary_ar, challenge_en, challenge_ar,
  solution_en, solution_ar, implementation_en, implementation_ar, outcome_en, outcome_ar, impact,
  practice, client_display_name_en, client_display_name_ar, industry_en, industry_ar, year,
  cover_path, cover_alt_en, cover_alt_ar, seo_title_en, seo_title_ar, seo_description_en,
  seo_description_ar, language_status, status, published_at, position, created_at, updated_at)
  on public.case_studies to anon;
