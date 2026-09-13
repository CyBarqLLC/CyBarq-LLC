import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { servicePath, type ServiceContent } from "@/content/services";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type ServiceCardProps = {
  service: ServiceContent;
  locale: Locale;
  /** Show the practice name under the summary (for mixed lists). */
  practiceLabel?: string;
  className?: string;
};

/** Card in a hairline grid: Ice tint and a Graphite rule on hover. */
export function ServiceCard({ service, locale, practiceLabel, className }: ServiceCardProps) {
  return (
    <li className={cn("bg-white", className)}>
      <Link
        href={servicePath(service)}
        className="flex h-full flex-col gap-4 p-6 transition-[background-color,box-shadow] duration-(--duration-state) hover:bg-ice/60 hover:shadow-[inset_0_0_0_1px_var(--color-graphite)] focus-visible:bg-ice/60 focus-visible:-outline-offset-2"
      >
        <Pictogram name={service.pictogram} className="size-10 text-graphite" />
        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="s-sub">{service.title[locale]}</h3>
          <p className="text-small text-slate">{service.summary[locale]}</p>
          {practiceLabel ? <span className="mt-auto pt-3 text-label text-slate">{practiceLabel}</span> : null}
        </div>
      </Link>
    </li>
  );
}

/** Grid wrapper with 1px Fog rules between cards; the cards move in one after another as the grid comes into view. */
export function ServiceGrid({ children, columns = 3, className }: { children: React.ReactNode; columns?: 2 | 3 | 4; className?: string }) {
  return (
    <Reveal as="ul" stagger className={cn("grid gap-px border border-fog bg-fog sm:grid-cols-2", columns === 3 && "lg:grid-cols-3", columns === 4 && "lg:grid-cols-4", className)}>
      {children}
    </Reveal>
  );
}

/**
 * Card for the horizontal services strip: fixed width so the row snaps card
 * by card, its own hairline (Graphite on hover) and a slight lift.
 */
export function ServiceStripCard({ service, locale, practiceLabel, className }: ServiceCardProps) {
  return (
    <li className={cn("site-card w-[min(78vw,20rem)] border border-fog bg-white sm:w-80", className)}>
      <Link href={servicePath(service)} className="flex h-full flex-col gap-5 p-6 focus-visible:-outline-offset-2 sm:p-7">
        <Pictogram name={service.pictogram} className="size-10 text-graphite" />
        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="s-h3">{service.title[locale]}</h3>
          <p className="text-small text-slate">{service.summary[locale]}</p>
          {practiceLabel ? <span className="mt-auto pt-4 text-label text-slate">{practiceLabel}</span> : null}
        </div>
      </Link>
    </li>
  );
}
