import { Link } from "@/i18n/navigation";
import { dirOf, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { HeroStream } from "./hero-stream";
import { ScrollCue } from "./scroll-cue";

type HeroProps = {
  locale: Locale;
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

/**
 * Home hero. The live Stream ("opening" preset) is the whole surface: it
 * starts under the transparent header and fills the viewport, always moving
 * and reacting to mouse and touch. A white scrim on the start side (from the
 * bottom on phones) keeps the copy fully readable while the field flows
 * through. The first paint is a static SVG file generated from the same maths
 * (mirrored for right to left), replaced by the canvas after hydration.
 */
export function Hero({ locale, title, lead, primary, secondary }: HeroProps) {
  return (
    <section className="site-hero">
      <div className="site-hero__field" aria-hidden>
        <HeroStream dir={dirOf(locale)} />
      </div>
      <div className="site-hero__scrim" aria-hidden />
      <div className="site-hero__content container-page">
        <div className="site-enter max-w-2xl">
          <h1 className="text-display">{title}</h1>
          <p className="mt-6 max-w-xl text-lg text-slate">{lead}</p>
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
      <ScrollCue />
    </section>
  );
}
