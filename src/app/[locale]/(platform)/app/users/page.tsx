import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { formatDate } from "@/lib/utils/format";
import { USER_KIND_LABELS, label, roleLabel } from "@/lib/labels";
import { searchTerm } from "@/lib/validation/projects";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { ListPagination } from "@/components/platform/list-pagination";
import { Person } from "@/components/platform/person";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.users");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requirePermission("users.manage");
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.users");
  const supabase = await createClient();

  const q = searchTerm(param(sp, "q"));
  const kindParam = param(sp, "kind");
  const kind = kindParam === "employee" || kindParam === "client" ? kindParam : undefined;
  const stateParam = param(sp, "state");
  const state = stateParam === "active" || stateParam === "inactive" ? stateParam : undefined;
  const { page, pageSize, from, to } = pagination(sp);

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, full_name_ar, kind, is_active, avatar_path, created_at, user_roles!user_roles_user_id_fkey(role_key, roles(name_en, name_ar))", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (kind) query = query.eq("kind", kind);
  if (state) query = query.eq("is_active", state === "active");
  if (q) query = query.or(`full_name.ilike.%${q}%,full_name_ar.ilike.%${q}%,email.ilike.%${q}%`);
  const { data: rows, count } = await query;
  type Row = NonNullable<typeof rows>[number];
  const users: Row[] = rows ?? [];
  const filters = { q, kind, state };

  const columns: Column<Row>[] = [
    { key: "person", header: t("columns.person"), primary: true, cell: (u) => <Person person={u} locale={locale} secondary={u.email} /> },
    { key: "kind", header: t("columns.kind"), cell: (u) => label(USER_KIND_LABELS, u.kind, locale) },
    { key: "roles", header: t("columns.roles"), cell: (u) => (
      <span className="flex flex-wrap gap-1">
        {u.user_roles.length === 0 ? <span className="text-slate">{t("form.noRoles")}</span> : null}
        {u.user_roles.map((r) => (
          <Badge key={r.role_key} variant={r.role_key === "super_admin" ? "graphite" : "outline"}>{r.roles ? pick(r.roles, "name", locale) : roleLabel(r.role_key, locale)}</Badge>
        ))}
      </span>
    ) },
    { key: "state", header: t("columns.state"), cell: (u) => <Badge variant={u.is_active ? "success" : "outline"}>{u.is_active ? t("states.active") : t("states.inactive")}</Badge> },
    { key: "created", header: t("columns.created"), cell: (u) => formatDate(u.created_at, locale) },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/app/users/roles">{t("roles")}</Link>
            </Button>
            <Button asChild>
              <Link href="/app/users/new">{t("invite")}</Link>
            </Button>
          </>
        }
      />
      <FilterBar action="/app/users" active={Boolean(q || kind || state)}>
        <FilterField label={t("filters.search")} htmlFor="q" className="sm:min-w-64">
          <Input id="q" name="q" type="search" defaultValue={q ?? ""} placeholder={t("searchPlaceholder")} />
        </FilterField>
        <FilterField label={t("filters.kind")} htmlFor="kind">
          <NativeSelect id="kind" name="kind" defaultValue={kind ?? ""}>
            <option value="">{t("filters.any")}</option>
            <option value="employee">{label(USER_KIND_LABELS, "employee", locale)}</option>
            <option value="client">{label(USER_KIND_LABELS, "client", locale)}</option>
          </NativeSelect>
        </FilterField>
        <FilterField label={t("filters.active")} htmlFor="state">
          <NativeSelect id="state" name="state" defaultValue={state ?? ""}>
            <option value="">{t("filters.any")}</option>
            <option value="active">{t("states.active")}</option>
            <option value="inactive">{t("states.inactive")}</option>
          </NativeSelect>
        </FilterField>
      </FilterBar>
      <DataTable rows={users} columns={columns} rowKey={(u) => u.id} rowHref={(u) => `/app/users/${u.id}`} emptyTitle={t("empty.title")} emptyDescription={t("empty.description")} caption={t("title")} />
      <ListPagination page={page} pageSize={pageSize} total={count ?? 0} hrefFor={(p) => withPage(`/${locale}/app/users`, filters, p)} />
    </>
  );
}
