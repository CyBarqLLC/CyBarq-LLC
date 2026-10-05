import type { Locale } from "@/i18n/routing";
import type { ServiceSection } from "@/content/services/registry";
import { cn } from "@/lib/utils/cn";

type NarrativeSectionProps = {
  id: string;
  heading: string;
  section: ServiceSection;
  locale: Locale;
  className?: string;
};

/**
 * One section of the service narrative: a heading that stays in the start
 * column while the prose runs beside it on large screens, stacked on small
 * ones. Lists appear only when the content carries `items`.
 */
export function NarrativeSection({ id, heading, section, locale, className }: NarrativeSectionProps) {
  const title = section.heading ? section.heading[locale] : heading;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("s-narrative", className)}>
      <h2 id={`${id}-heading`} className="s-sub">
        {title}
      </h2>
      <div className="s-prose">
        <p>{section.body[locale]}</p>
        {section.items && section.items.length > 0 ? (
          <ul className="s-list text-body">
            {section.items.map((item, i) => (
              <li key={i}>{item[locale]}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
