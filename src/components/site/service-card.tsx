import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { servicePath, type ServiceContent } from "@/content/services";
import { cn } from "@/lib/utils/cn";

type ServiceCardProps = {
  service: ServiceContent;
  locale: Locale;
  /** Show the practice name above the title (for mixed lists). */
  practiceLabel?: string;
  className?: string;
};

export function ServiceCard({ service, locale, practiceLabel, className }: ServiceCardProps) {
  return (
    <li className={cn("bg-white", className)}>
      <Link href={servicePath(service)} className="flex h-full flex-col gap-4 p-6 transition-colors duration-(--duration-state) hover:bg-ice focus-visible:bg-ice">
        <Pictogram name={service.pictogram} className="size-10 text-graphite" />
        <div className="flex flex-col gap-1.5">
          {practiceLabel ? <span className="text-label text-slate">{practiceLabel}</span> : null}
          <h3 className="text-h3">{service.title[locale]}</h3>
          <p className="text-small text-slate">{service.summary[locale]}</p>
        </div>
      </Link>
    </li>
  );
}

/** Grid wrapper with 1px Fog rules between cards. */
export function ServiceGrid({ children, columns = 3, className }: { children: React.ReactNode; columns?: 2 | 3 | 4; className?: string }) {
  return (
    <ul className={cn("grid gap-px border border-fog bg-fog sm:grid-cols-2", columns === 3 && "lg:grid-cols-3", columns === 4 && "lg:grid-cols-4", className)}>
      {children}
    </ul>
  );
}
