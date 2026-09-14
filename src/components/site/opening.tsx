import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/brand/globe";
import { GlobeStatic } from "@/components/brand/globe-static";

type OpeningProps = {
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  /** The four practices, printed on the hairline that closes the opening. */
  ledger: { href: string; label: string }[];
  ledgerLabel: string;
};

/**
 * The opening of the site. Not a hero with a picture behind it: the globe is
 * the company's own pattern wrapped onto the world, turning slowly, letting
 * blades go into the field around it. The statement sits beside it and says in
 * one breath what the company actually does.
 */
export function Opening({ title, lead, primary, secondary, ledger, ledgerLabel }: OpeningProps) {
  return (
    <section className="site-opening">
      <div className="site-opening__globe" aria-hidden>
        <Globe placement={{ x: 0.5, y: 0.5, size: 0.45 }}>
          <GlobeStatic width={900} height={900} size={0.45} />
        </Globe>
      </div>
      <div className="site-opening__scrim" aria-hidden />

      <div className="site-opening__content container-page">
        <div className="site-enter max-w-2xl">
          <h1 className="s-display">{title}</h1>
          <p className="s-lede mt-7 max-w-xl">{lead}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          </div>
        </div>
      </div>

      <nav aria-label={ledgerLabel} className="site-opening__ledger">
        <ul className="container-page grid grid-cols-2 lg:grid-cols-4">
          {ledger.map((item, i) => (
            <li key={item.href}>
              <Link href={item.href} className="site-opening__ledger-link">
                <span aria-hidden className="s-meta text-grey">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-small">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
