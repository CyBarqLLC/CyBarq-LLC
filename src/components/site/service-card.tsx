import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { servicePath, type ServiceContent } from "@/content/services";
import { cn } from "@/lib/utils/cn";
import { Arrow } from "./action";
import { Reveal } from "./reveal";

type ServiceCardProps = {
  service: ServiceContent;
  locale: Locale;
  /** Show the practice name at the foot of the card (for mixed lists). */
  practiceLabel?: string;
  className?: string;
};

/** One service: the pictogram, the name, what it is in a sentence, and the way in. */
export function ServiceCard({ service, locale, practiceLabel, className }: ServiceCardProps) {
  return (
    <li className={className}>
      <Link href={servicePath(service)} className="s-card">
        <div className="s-card__body">
          <Pictogram name={service.pictogram} className="mb-2 size-10 text-azure" />
          <h3 className="s-h3">{service.title[locale]}</h3>
          <p className="s-card__text">{service.summary[locale]}</p>
          <p className="s-card__foot">
            <span>{practiceLabel ?? ""}</span>
            <Arrow />
          </p>
        </div>
      </Link>
    </li>
  );
}

/** Grid of service cards; the cards arrive one after another as the grid comes into view. */
export function ServiceGrid({ children, columns = 3, className }: { children: React.ReactNode; columns?: 2 | 3 | 4; className?: string }) {
  return (
    <Reveal as="ul" stagger className={cn("s-cards", className)} data-columns={columns}>
      {children}
    </Reveal>
  );
}
