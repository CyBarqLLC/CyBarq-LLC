import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { publicUrl } from "@/lib/storage";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/platform/section-card";
import { personName } from "@/components/platform/person";
import { ProfileForm } from "./profile-form";
import { AvatarUploader } from "./avatar-uploader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.settings");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function SettingsPage() {
  const viewer = await requireEmployee();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.settings");
  const profile = viewer.profile;

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title={t("profile.title")}>
            <ProfileForm defaults={{ full_name: profile.full_name, full_name_ar: profile.full_name_ar, phone: profile.phone, locale: profile.locale, email: viewer.email }} />
          </SectionCard>
          <SectionCard title={t("avatar.title")} description={t("avatar.description")}>
            <AvatarUploader name={personName(profile, locale, viewer.email)} currentUrl={profile.avatar_path ? publicUrl("public-content", profile.avatar_path) : null} />
          </SectionCard>
        </div>
        <div className="flex flex-col gap-6">
          <SectionCard title={t("security.title")} description={t("security.description")}>
            <Button asChild variant="outline" size="sm">
              <Link href="/forgot-password">{t("security.change")}</Link>
            </Button>
          </SectionCard>
          {viewer.can("settings.manage") ? (
            <SectionCard title={t("platform.title")}>
              <p className="text-small text-slate">{t("platform.description")}</p>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </>
  );
}
