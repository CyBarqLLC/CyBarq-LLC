import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { practices, servicesByPractice, servicePath, type PracticeSlug } from "@/content/services";
import { cn } from "@/lib/utils/cn";
import { Arrow } from "./action";
import { Reveal } from "./reveal";

type PracticeGridProps = {
  locale: Locale;
  /** "7 services", already translated, for each practice. */
  countLabel: (count: number) => string;
  /** Hide one practice (the "other practices" strip of a practice page). */
  exclude?: PracticeSlug;
  /** How many services each panel names. 0 hides the list (compact panels). */
  services?: number;
  className?: string;
};

/**
 * The practices as panels: the pictogram, the name, one line, a handful of
 * the services inside as links of their own, and the count. The whole panel
 * opens the practice; each chip opens its service.
 */
export function PracticeGrid({ locale, countLabel, exclude, services = 4, className }: PracticeGridProps) {
  const items = practices.filter((p) => p.slug !== exclude);
  return (
    <Reveal as="ul" stagger className={cn("s-cards", className)} data-columns={services === 0 ? items.length : 2}>
      {items.map((p) => {
        const list = servicesByPractice(p.slug);
        return (
          <li key={p.slug}>
            <article className="s-card s-practice">
              <div className="s-practice__top">
                <h3 className="s-practice__title">
                  <Link href={`/services/${p.slug}`}>{p.title[locale]}</Link>
                </h3>
                <Pictogram name={p.pictogram} className="size-11 shrink-0 text-azure lg:size-12" />
              </div>
              <p className="s-card__text max-w-md">{p.short[locale]}</p>
              {services > 0 ? (
                <ul className="s-practice__list">
                  {list.slice(0, services).map((s) => (
                    <li key={s.slug}>
                      <Link href={servicePath(s)} className="s-chip">
                        {s.title[locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="s-card__foot">
                <span className="tabular-nums">{countLabel(list.length)}</span>
                <Arrow />
              </p>
            </article>
          </li>
        );
      })}
    </Reveal>
  );
}
