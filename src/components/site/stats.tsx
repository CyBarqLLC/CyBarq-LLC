import type { Locale } from "@/i18n/routing";
import { company } from "@/content/site/company";
import { cn } from "@/lib/utils/cn";

/** Company figures from company.ts. Western numerals in both languages. */
export function Stats({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-px border border-fog bg-fog lg:grid-cols-4", className)}>
      {company.stats.map((s) => (
        <div key={s.value} className="flex flex-col gap-2 bg-white p-6 sm:p-8">
          <dt className="order-2 text-small text-slate">{s.label[locale]}</dt>
          <dd className="order-1 text-h1 tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
