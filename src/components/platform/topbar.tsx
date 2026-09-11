"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandSearch, type CommandItem } from "@/components/ui/command-search";
import { LanguageSwitch } from "@/components/site/language-switch";
import { Sidebar } from "./sidebar";
import type { NavEntry } from "./nav-config";

type TopbarProps = {
  sections: { section: string; items: NavEntry[] }[];
  viewer: { name: string; email: string; avatarUrl?: string | null };
  unread: number;
  commands: CommandItem[];
  signOut: () => Promise<void>;
  variant?: "platform" | "portal";
};

export function Topbar({ sections, viewer, unread, commands, signOut, variant = "platform" }: TopbarProps) {
  const t = useTranslations("platform.topbar");
  const [open, setOpen] = React.useState(false);
  const base = variant === "portal" ? "/portal" : "/app";
  return (
    <header className="sticky top-0 z-30 flex h-(--nav-height) items-center gap-2 border-b border-fog bg-white px-3 safe-pt sm:px-5">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("menu")}>
            <Menu className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="start" title={t("menu")} className="p-0 [&>div:last-child]:p-0">
          <Sidebar sections={sections} onNavigate={() => setOpen(false)} namespace={variant === "portal" ? "portal.nav" : "platform.nav"} homeHref={base} />
        </SheetContent>
      </Sheet>
      <div className="ms-auto flex items-center gap-1 sm:gap-2">
        <CommandSearch items={commands} labels={{ placeholder: t("searchPlaceholder"), empty: t("searchEmpty"), title: t("search"), open: t("search") }} />
        <LanguageSwitch className="hidden sm:inline-flex" />
        <Button asChild variant="ghost" size="icon" aria-label={unread > 0 ? `${t("notifications")} · ${t("unreadCount", { count: unread })}` : t("notifications")}>
          <Link href={`${base}/notifications`} className="relative">
            <Bell className="size-5" aria-hidden />
            {unread > 0 ? (
              <span aria-hidden className="absolute end-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center bg-blue px-1 text-[10px] font-medium leading-none text-graphite tabular-nums">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="touch flex items-center justify-center" aria-label={t("account")}>
              <Avatar name={viewer.name || viewer.email} src={viewer.avatarUrl} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="truncate">
              <span className="block text-body text-graphite">{viewer.name}</span>
              <span className="block text-small text-slate">{viewer.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`${base}/settings`}><UserRound /> {t("profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="sm:hidden">
              <LanguageSwitch className="h-auto px-3 py-2.5" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()} destructive>
              <LogOut /> {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
