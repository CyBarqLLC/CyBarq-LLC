import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Stream } from "@/components/brand/stream";
import { StreamStatic } from "@/components/brand/stream-static";
import { Blade } from "@/components/brand/elements";

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
 * on small screens. The Stream is decorative: the static SVG paints first and
 * the canvas takes over after hydration.
 */
export function Hero({ eyebrow, title, lead, primary, secondary }: HeroProps) {
  return (
    <section className="border-b border-fog">
      <div className="container-page grid gap-10 pt-14 pb-10 sm:pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 lg:pb-20">
        <div className="max-w-2xl">
          <p className="mb-5 flex items-center gap-2 text-small text-slate">
            <Blade className="size-3.5 text-blue" />
            {eyebrow}
          </p>
          <h1 className="text-display">{title}</h1>
          <p className="mt-6 max-w-xl text-lg text-slate">{lead}</p>
          <div className="mt-9 flex flex-wrap gap-3">
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
            <StreamStatic preset="opening" width={1200} height={520} params={{ fadeIn: 1.4 }} />
          </Stream>
        </div>
      </div>
    </section>
  );
}
