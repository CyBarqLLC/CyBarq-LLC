import { Link } from "@/i18n/navigation";
import { Settle } from "./reveal";

export type PracticeColumn = {
  slug: string;
  title: string;
  short: string;
  href: string;
  services: { slug: string; title: string; href: string }[];
};

/**
 * What the company does, set as four quiet columns: the practice, one line
 * about it, and the services underneath as plain links. No numbers, no cards
 * and nothing to filter. A visitor reads the whole offering at a glance and
 * goes straight to the page they came for.
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
