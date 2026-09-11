import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/platform/section-card";
import { ProfileForm } from "@/app/[locale]/(platform)/app/settings/profile-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.settings");
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** Client portal profile settings. Same profile form as employees, scoped by RLS to the viewer's own row. */
export default async function PortalSettingsPage() {
  const viewer = await requireClientUser();
  const t = await getTranslations("platform.settings");
  const profile = viewer.profile;
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <SectionCard title={t("profile.title")}>
          <ProfileForm defaults={{ full_name: profile.full_name, full_name_ar: profile.full_name_ar, phone: profile.phone, locale: profile.locale, email: viewer.email }} />
        </SectionCard>
        <SectionCard title={t("security.title")} description={t("security.description")}>
          <Button asChild variant="outline" size="sm">
            <Link href="/forgot-password">{t("security.change")}</Link>
          </Button>
        </SectionCard>
      </div>
    </>
  );
}
