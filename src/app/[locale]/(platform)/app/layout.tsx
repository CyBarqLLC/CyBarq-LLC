import { getLocale, getTranslations } from "next-intl/server";
import { requireEmployee } from "@/lib/auth/session";
import { signOut } from "@/lib/actions/auth";
import { Sidebar } from "@/components/platform/sidebar";
import { Topbar } from "@/components/platform/topbar";
import { AppFooter } from "@/components/platform/app-footer";
import { PLATFORM_NAV } from "@/components/platform/nav-config";
import type { CommandItem } from "@/components/ui/command-search";
import { publicUrl } from "@/lib/storage";
import type { Locale } from "@/i18n/routing";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireEmployee();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.nav");

  const sections = PLATFORM_NAV.map((s) => ({
    section: s.section,
    items: s.items.filter((i) => !i.anyOf || viewer.canAny(i.anyOf)),
  })).filter((s) => s.items.length > 0);

  const commands: CommandItem[] = sections.flatMap((s) =>
    s.items.map((i) => ({ id: i.key, label: t(i.labelKey), group: t(`sections.${s.section}`), href: `/${locale}${i.href}` })),
  );

  const name = locale === "ar" ? viewer.profile.full_name_ar || viewer.profile.full_name : viewer.profile.full_name;

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-e border-fog bg-white lg:block">
        <Sidebar sections={sections} commands={commands} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          sections={sections}
          viewer={{ name, email: viewer.email, avatarUrl: viewer.profile.avatar_path ? publicUrl("public-content", viewer.profile.avatar_path) : null }}
          unread={viewer.unreadNotifications}
          commands={commands}
          signOut={signOut}
        />
        <main id="main" className="flex-1 safe-px py-6 sm:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <div className="safe-pb">
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
