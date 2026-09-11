"use client";

import * as React from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabDefinition = { value: string; label: string; count?: number; content: React.ReactNode };

/** Tab strip whose active tab is mirrored into `?tab=` so links and reloads land on the right panel. */
export function EngagementTabs({ tabs, current, label }: { tabs: TabDefinition[]; current: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const fallback = tabs[0]?.value ?? "overview";
  const initial = tabs.some((t) => t.value === current) ? current : fallback;

  return (
    <Tabs defaultValue={initial} onValueChange={(value) => router.replace(`${pathname}?tab=${value}`, { scroll: false })}>
      <TabsList aria-label={label}>
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
            {typeof t.count === "number" ? <span className="ms-1.5 text-label text-slate">{t.count}</span> : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
