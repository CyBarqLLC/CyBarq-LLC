import { Link } from "@/i18n/navigation";
import { dirOf, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { HeroStream } from "./hero-stream";

type HeroProps = {
  locale: Locale;
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  /** The four practices, printed along the hairline that closes the opening. */
  ledger?: { href: string; label: string }[];
  /** Accessible name of the ledger row. */
  ledgerLabel?: string;
};

/**
 * The opening. One field, one statement, one hairline.
 *
 * The live Stream ("opening" preset) is the whole surface: it starts under the
 * header and fills the viewport, always moving and answering the pointer. A
 * white scrim on the start side (from the bottom on phones) keeps the
 * statement fully legible while the field flows through. The first paint is a
 * static SVG generated from the same maths, mirrored for right to left, and
 * the canvas continues from it after hydration.
 *
 * The opening closes on a rule carrying the four practices, so the page has
 * said what the company does before anything is scrolled.
 */
export function Hero({ locale, title, lead, primary, secondary, ledger, ledgerLabel }: HeroProps) {
  return (
    <section className="site-hero">
      <div className="site-hero__field" aria-hidden>
        <HeroStream dir={dirOf(locale)} />
      </div>
      <div className="site-hero__scrim" aria-hidden />

      <div className="site-hero__content container-page">
        <div className="site-enter max-w-4xl">
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

      {ledger && ledger.length > 0 ? (
        <nav aria-label={ledgerLabel} className="site-hero__ledger">
          <ul className="container-page grid grid-cols-2 lg:grid-cols-4">
            {ledger.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex min-h-14 items-center gap-2.5 py-3 pe-5 text-graphite transition-colors duration-(--s-fast) ease-(--s-ease) hover:text-azure focus-visible:-outline-offset-2"
                >
                  <span aria-hidden className="s-meta text-grey transition-colors duration-(--s-fast) ease-(--s-ease) group-hover:text-azure">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-small">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
