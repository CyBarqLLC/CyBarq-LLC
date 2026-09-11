import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type ClosingCtaProps = {
  title: string;
  body?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
};

/** The bold close of the home page: one display line and the two calls to action on a white ground, with plenty of air (the footer below is Ice). */
export function ClosingCta({ title, body, primary, secondary, className }: ClosingCtaProps) {
  return (
    <section className={cn("border-t border-fog bg-white", className)}>
      <div className="container-page flex flex-col gap-10 py-28 sm:py-36 lg:py-44">
        <Reveal className="max-w-4xl">
          <h2 className="text-display">{title}</h2>
          {body ? <p className="mt-6 max-w-2xl text-lg text-slate">{body}</p> : null}
        </Reveal>
        <Reveal delay={120} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild size="lg" variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
