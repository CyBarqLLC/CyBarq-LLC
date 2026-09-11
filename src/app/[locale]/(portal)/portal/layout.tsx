import { getLocale, getTranslations } from "next-intl/server";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Sidebar } from "@/components/platform/sidebar";
import { Topbar } from "@/components/platform/topbar";
import { PORTAL_NAV } from "@/components/platform/nav-config";
import type { CommandItem } from "@/components/ui/command-search";
import type { Locale } from "@/i18n/routing";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal.nav");
  const supabase = await createClient();
  const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null).eq("user_id", viewer.userId);

  const sections = [{ section: "portal", items: [...PORTAL_NAV] }];
  const commands: CommandItem[] = PORTAL_NAV.map((i) => ({ id: i.key, label: t(i.labelKey), group: t("sections.portal"), href: `/${locale}${i.href}` }));
  const name = locale === "ar" ? viewer.profile.full_name_ar || viewer.profile.full_name : viewer.profile.full_name;

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-e border-fog bg-white lg:block">
        <Sidebar sections={sections} namespace="portal.nav" homeHref="/portal" />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar sections={sections} viewer={{ name, email: viewer.email }} unread={count ?? 0} commands={commands} signOut={signOut} variant="portal" />
        <main id="main" className="flex-1 safe-px py-6 safe-pb sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
