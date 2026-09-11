import type { Locale } from "@/i18n/routing";
import type { ServiceSection } from "@/content/services/registry";
import { Blade } from "@/components/brand/elements";
import { cn } from "@/lib/utils/cn";

type NarrativeSectionProps = {
  id: string;
  heading: string;
  section: ServiceSection;
  locale: Locale;
  className?: string;
};

/**
 * One section of the service narrative: a heading in the start column and the
 * prose in the end column on large screens, stacked on small screens. Lists are
 * rendered only when the content carries `items`.
 */
export function NarrativeSection({ id, heading, section, locale, className }: NarrativeSectionProps) {
  const title = section.heading ? section.heading[locale] : heading;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("grid gap-4 border-t border-fog py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12", className)}>
      <h2 id={`${id}-heading`} className="text-h2 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] lg:self-start">{title}</h2>
      <div className="max-w-prose">
        <p className="text-lg leading-relaxed text-graphite">{section.body[locale]}</p>
        {section.items && section.items.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-3">
            {section.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-graphite">
                <Blade className="mt-1.5 size-3.5 shrink-0 text-blue" />
                <span>{item[locale]}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
