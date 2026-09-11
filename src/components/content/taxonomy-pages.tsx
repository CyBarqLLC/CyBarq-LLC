import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatNumber } from "@/lib/utils/format";
import { createAuthor, updateAuthor, deleteAuthor, createCategory, updateCategory, deleteCategory, createTag, updateTag, deleteTag } from "@/lib/actions/content";
import { CATEGORY_KINDS, type CategoryKind } from "@/lib/validation/content";
import { humanizeKey } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthorForm, CategoryForm, TagForm } from "./taxonomy-forms";
import { ConfirmAction } from "./confirm-action";
import { contentPublicBase, loadEmployeeOptions } from "./data";

function Crumbs({ title, section, sectionHref }: { title: string; section?: string; sectionHref?: string }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Link href="/app/content" className="hover:text-azure">{title}</Link>
      {section && sectionHref ? (
        <>
          <span aria-hidden>/</span>
          <Link href={sectionHref} className="hover:text-azure">{section}</Link>
        </>
      ) : null}
    </span>
  );
}

function isCategoryKind(value: string): value is CategoryKind {
  return (CATEGORY_KINDS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

export async function AuthorsListPage() {
  const viewer = await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const supabase = await createClient();
  const { data } = await supabase.from("authors").select("id, name_en, name_ar, title_en, title_ar, avatar_path, user_id").order("name_en");
  const rows = data ?? [];
  const publicBase = contentPublicBase();
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: t("authors.columns.name"),
      primary: true,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <Avatar name={pick(r, "name", locale)} src={r.avatar_path ? `${publicBase}${r.avatar_path}` : null} size="sm" />
          <span className="font-medium">{pick(r, "name", locale)}</span>
        </span>
      ),
    },
    { key: "title", header: t("authors.columns.title"), cell: (r) => pick(r, "title", locale) },
    { key: "linked", header: t("authors.columns.linked"), cell: (r) => (r.user_id ? <Badge variant="blue">{t("authors.linked")}</Badge> : <span className="text-slate">{t("authors.notLinked")}</span>) },
  ];
  return (
    <div>
      <PageHeader
        eyebrow={<Crumbs title={t("title")} />}
        title={t("sections.authors")}
        description={t("descriptions.authors")}
        actions={viewer.can("content.write") ? <Button asChild><Link href="/app/content/authors/new"><Plus aria-hidden /> {t("new.authors")}</Link></Button> : null}
      />
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `/app/content/authors/${r.id}`} emptyTitle={t("authors.empty")} emptyDescription={t("authors.emptyDescription")} />
    </div>
  );
}

export async function AuthorNewPage() {
  await requirePermission("content.write");
  const t = await getTranslations("content");
  const supabase = await createClient();
  const employees = await loadEmployeeOptions(supabase);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow={<Crumbs title={t("title")} section={t("sections.authors")} sectionHref="/app/content/authors" />} title={t("new.authors")} />
      <AuthorForm action={createAuthor} defaults={{}} employees={employees} publicBase={contentPublicBase()} mode="create" />
    </div>
  );
}

export async function AuthorEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const tc = await getTranslations("common");
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: author }, employees] = await Promise.all([supabase.from("authors").select("*").eq("id", id).maybeSingle(), loadEmployeeOptions(supabase)]);
  if (!author) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={<Crumbs title={t("title")} section={t("sections.authors")} sectionHref="/app/content/authors" />}
        title={pick(author, "name", locale)}
        actions={<ConfirmAction action={deleteAuthor} fields={{ id }} title={t("authors.deleteTitle")} description={t("authors.deleteDescription")} confirmLabel={tc("delete")} triggerLabel={tc("delete")} triggerVariant="ghost" />}
      />
      <AuthorForm action={updateAuthor.bind(null, id)} defaults={author} employees={employees} publicBase={contentPublicBase()} mode="edit" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function CategoriesListPage() {
  const viewer = await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, kind, slug, name_en, name_ar, position").order("kind").order("position");
  const rows = data ?? [];
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "name", header: t("categories.columns.name"), primary: true, cell: (r) => <span className="font-medium">{pick(r, "name", locale)}</span> },
    { key: "kind", header: t("categories.columns.kind"), cell: (r) => <Badge variant="outline">{isCategoryKind(r.kind) ? t(`categories.form.kinds.${r.kind}`) : humanizeKey(r.kind)}</Badge> },
    { key: "slug", header: t("categories.columns.slug"), cell: (r) => <span dir="ltr" className="font-mono text-small">{r.slug}</span> },
    { key: "position", header: t("categories.columns.position"), cell: (r) => formatNumber(r.position, locale), numeric: true },
  ];
  return (
    <div>
      <PageHeader
        eyebrow={<Crumbs title={t("title")} />}
        title={t("sections.categories")}
        description={t("descriptions.categories")}
        actions={viewer.can("content.write") ? <Button asChild><Link href="/app/content/categories/new"><Plus aria-hidden /> {t("new.categories")}</Link></Button> : null}
      />
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `/app/content/categories/${r.id}`} emptyTitle={t("categories.empty")} />
    </div>
  );
}

export async function CategoryNewPage() {
  await requirePermission("content.write");
  const t = await getTranslations("content");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={<Crumbs title={t("title")} section={t("sections.categories")} sectionHref="/app/content/categories" />} title={t("new.categories")} />
      <CategoryForm action={createCategory} defaults={{}} mode="create" />
    </div>
  );
}

export async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const tc = await getTranslations("common");
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (!category) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={<Crumbs title={t("title")} section={t("sections.categories")} sectionHref="/app/content/categories" />}
        title={pick(category, "name", locale)}
        actions={<ConfirmAction action={deleteCategory} fields={{ id }} title={t("categories.deleteTitle")} description={t("categories.deleteDescription")} confirmLabel={tc("delete")} triggerLabel={tc("delete")} triggerVariant="ghost" />}
      />
      <CategoryForm action={updateCategory.bind(null, id)} defaults={category} mode="edit" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function TagsListPage() {
  const viewer = await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id, slug, name_en, name_ar").order("name_en");
  const rows = data ?? [];
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "name", header: t("tags.columns.name"), primary: true, cell: (r) => <span className="font-medium">{pick(r, "name", locale)}</span> },
    { key: "slug", header: t("tags.columns.slug"), cell: (r) => <span dir="ltr" className="font-mono text-small">{r.slug}</span> },
  ];
  return (
    <div>
      <PageHeader
        eyebrow={<Crumbs title={t("title")} />}
        title={t("sections.tags")}
        description={t("descriptions.tags")}
        actions={viewer.can("content.write") ? <Button asChild><Link href="/app/content/tags/new"><Plus aria-hidden /> {t("new.tags")}</Link></Button> : null}
      />
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `/app/content/tags/${r.id}`} emptyTitle={t("tags.empty")} />
    </div>
  );
}

export async function TagNewPage() {
  await requirePermission("content.write");
  const t = await getTranslations("content");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={<Crumbs title={t("title")} section={t("sections.tags")} sectionHref="/app/content/tags" />} title={t("new.tags")} />
      <TagForm action={createTag} defaults={{}} mode="create" />
    </div>
  );
}

export async function TagEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const tc = await getTranslations("common");
  const { id } = await params;
  const supabase = await createClient();
  const { data: tag } = await supabase.from("tags").select("*").eq("id", id).maybeSingle();
  if (!tag) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={<Crumbs title={t("title")} section={t("sections.tags")} sectionHref="/app/content/tags" />}
        title={pick(tag, "name", locale)}
        actions={<ConfirmAction action={deleteTag} fields={{ id }} title={t("tags.deleteTitle")} description={t("tags.deleteDescription")} confirmLabel={tc("delete")} triggerLabel={tc("delete")} triggerVariant="ghost" />}
      />
      <TagForm action={updateTag.bind(null, id)} defaults={tag} mode="edit" />
    </div>
  );
}
