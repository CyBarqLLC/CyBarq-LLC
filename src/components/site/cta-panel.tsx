import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type CtaPanelProps = {
  title: string;
  body?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
};

/** Closing call to action of the inner pages: white ground, one rule above, primary and optional secondary link. */
export function CtaPanel({ title, body, primary, secondary, className }: CtaPanelProps) {
  return (
    <section className={cn("border-t border-fog", className)}>
      <Reveal className="container-page section flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <h2 className="text-h1">{title}</h2>
          {body ? <p className="mt-5 text-lg text-slate">{body}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild size="lg" variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
