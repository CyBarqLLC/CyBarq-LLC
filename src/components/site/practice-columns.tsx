import { Link } from "@/i18n/navigation";
import { Settle } from "./reveal";

export type PracticeColumn = {
  slug: string;
  title: string;
  short: string;
  href: string;
  /** "7 services", already translated: the whole list on a phone. */
  countLabel: string;
  services: { slug: string; title: string; href: string }[];
};

/**
 * What the company does, set as four quiet columns: the practice, one line
 * about it, and the services underneath as plain links. No numbers, no cards
 * and nothing to filter.
 *
 * On a phone the lists would be thirty three links in a single stack, so they
 * stay in the markup and out of sight: each practice shows its name, its line
 * and how many services it holds, and the practice page carries the rest.
 */
export function PracticeColumns({ items }: { items: PracticeColumn[] }) {
  return (
    <Settle as="ul" stagger className="s-columns">
      {items.map((item) => (
        <li key={item.slug} className="s-column">
          <h3 className="s-column__title">
            <Link href={item.href}>{item.title}</Link>
          </h3>
          <p className="s-column__lead">{item.short}</p>
          <Link href={item.href} className="s-column__more">
            {item.countLabel}
            <span aria-hidden className="rtl:-scale-x-100">
              →
            </span>
          </Link>
          <ul className="s-column__list">
            {item.services.map((service) => (
              <li key={service.slug}>
                <Link href={service.href} className="s-column__link">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </Settle>
  );
}
