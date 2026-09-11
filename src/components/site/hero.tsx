import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Stream } from "@/components/brand/stream";

type HeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

/**
 * Home hero. Text on the start side; the animated Stream ("opening" preset) as
 * a wide panel on the end side on large screens, and a low band under the text
 * on small screens. The Stream is decorative: its first paint is a static SVG
 * file (public/brand/pattern/stream-opening-hero.svg, generated from the same
 * maths and preloaded), and the canvas takes over after hydration. Serving it
 * as a file keeps about 20 KB of path data out of every home page response.
 */
export function Hero({ eyebrow, title, lead, primary, secondary }: HeroProps) {
  return (
    <section className="border-b border-fog">
      <div className="container-page grid gap-10 pt-14 pb-10 sm:pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 lg:pb-20">
        <div className="max-w-2xl">
          <p className="mb-6 text-small text-slate">{eyebrow}</p>
          <h1 className="text-display">{title}</h1>
          <p className="mt-6 max-w-xl text-lg text-slate">{lead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-40 w-full sm:h-56 lg:h-[26rem]" aria-hidden>
          <Stream preset="opening" className="absolute inset-0" interactive>
            <Image src="/brand/pattern/stream-opening-hero.svg" alt="" fill priority unoptimized sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </Stream>
        </div>
      </div>
    </section>
  );
}
