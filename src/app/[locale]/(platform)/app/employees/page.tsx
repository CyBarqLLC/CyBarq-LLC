import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { searchTerm } from "@/lib/validation/projects";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { ListPagination } from "@/components/platform/list-pagination";
import { Person } from "@/components/platform/person";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.directory");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function EmployeesDirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.directory");
  const supabase = await createClient();

  const q = searchTerm(param(sp, "q"));
  const deptParam = param(sp, "department");
  const department = deptParam && /^[0-9a-f-]{36}$/i.test(deptParam) ? deptParam : undefined;
  const { page, pageSize, from, to } = pagination(sp);

  let query = supabase
    .from("employee_directory")
    .select("user_id, full_name, full_name_ar, email, avatar_path, job_title_en, job_title_ar, department_id, department_name_en, department_name_ar, work_phone", { count: "exact" })
    .order("full_name")
    .range(from, to);
  if (department) query = query.eq("department_id", department);
  if (q) query = query.or(`full_name.ilike.%${q}%,full_name_ar.ilike.%${q}%,email.ilike.%${q}%,job_title_en.ilike.%${q}%,job_title_ar.ilike.%${q}%`);

  const [{ data: rows, count }, { data: departments }] = await Promise.all([query, supabase.from("departments").select("id, name_en, name_ar").order("position").order("name_en")]);
  type Row = NonNullable<typeof rows>[number];
  const people: Row[] = rows ?? [];
  const canHr = viewer.can("hr.read");

  const columns: Column<Row>[] = [
    { key: "person", header: t("columns.person"), primary: true, cell: (r) => <Person person={r} locale={locale} /> },
    { key: "title", header: t("columns.title"), cell: (r) => pick(r, "job_title", locale) },
    { key: "department", header: t("columns.department"), cell: (r) => pick(r, "department_name", locale) || <span className="text-slate">{t("noDepartment")}</span> },
    { key: "email", header: t("columns.email"), cell: (r) => (r.email ? <a href={`mailto:${r.email}`} className="text-azure hover:underline" dir="ltr">{r.email}</a> : "") },
    { key: "phone", header: t("columns.phone"), cell: (r) => (r.work_phone ? <a href={`tel:${r.work_phone}`} className="hover:underline" dir="ltr">{r.work_phone}</a> : "") },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href="/app/employees/me">{t("myRecord")}</Link>
            </Button>
            {viewer.can("hr.write") ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/app/employees/departments">{t("departments")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/app/employees/teams">{t("teams")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/app/employees/new">{t("newRecord")}</Link>
                </Button>
              </>
            ) : null}
          </>
        }
      />
      <FilterBar action="/app/employees" active={Boolean(q || department)}>
        <FilterField label={t("search")} htmlFor="q" className="sm:min-w-64">
          <Input id="q" name="q" type="search" defaultValue={q ?? ""} placeholder={t("searchPlaceholder")} />
        </FilterField>
        <FilterField label={t("department")} htmlFor="department">
          <NativeSelect id="department" name="department" defaultValue={department ?? ""}>
            <option value="">{t("any")}</option>
            {(departments ?? []).map((d) => (
              <option key={d.id} value={d.id}>{pick(d, "name", locale)}</option>
            ))}
          </NativeSelect>
        </FilterField>
      </FilterBar>
      <DataTable
        rows={people}
        columns={columns}
        rowKey={(r) => r.user_id ?? r.email ?? ""}
        rowHref={(r) => (r.user_id && (canHr || r.user_id === viewer.userId) ? `/app/employees/${r.user_id}` : undefined)}
        emptyTitle={t("empty.title")}
        emptyDescription={t("empty.description")}
        caption={t("title")}
      />
      <ListPagination page={page} pageSize={pageSize} total={count ?? 0} hrefFor={(p) => withPage(`/${locale}/app/employees`, { q, department }, p)} />
    </>
  );
}
