import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { practices, type PracticeSlug } from "@/content/services/registry";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type PracticeGridProps = {
  locale: Locale;
  /** Label of the link at the end of each card ("Explore"). */
  linkLabel: string;
  /** Hide one practice (used on practice pages for the "other practices" strip). */
  exclude?: PracticeSlug;
  className?: string;
};

/** The practices as a grid of calm panels separated by 1px Fog rules (the inner pages; the home page uses PracticePanels). */
export function PracticeGrid({ locale, linkLabel, exclude, className }: PracticeGridProps) {
  const items = practices.filter((p) => p.slug !== exclude);
  return (
    <Reveal as="ul" stagger className={cn("grid gap-px border border-fog bg-fog sm:grid-cols-2", items.length === 4 && "lg:grid-cols-4", items.length === 3 && "lg:grid-cols-3", className)}>
      {items.map((p) => (
        <li key={p.slug} className="bg-white">
          <Link
            href={`/services/${p.slug}`}
            className="group flex h-full flex-col gap-5 p-6 transition-[background-color,box-shadow] duration-(--duration-state) hover:bg-ice/60 hover:shadow-[inset_0_0_0_1px_var(--color-graphite)] focus-visible:bg-ice/60 focus-visible:-outline-offset-2 sm:p-8"
          >
            <Pictogram name={p.pictogram} className="size-12 text-graphite" />
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="s-h3">{p.title[locale]}</h3>
              <p className="text-slate">{p.short[locale]}</p>
            </div>
            <span className="text-small text-azure underline-offset-4 group-hover:underline">{linkLabel}</span>
          </Link>
        </li>
      ))}
    </Reveal>
  );
}
