import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Blade } from "@/components/brand/elements";
import { cn } from "@/lib/utils/cn";

type CtaPanelProps = {
  title: string;
  body?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
};

/** Closing call to action: white ground, one rule above, primary and optional secondary link. */
export function CtaPanel({ title, body, primary, secondary, className }: CtaPanelProps) {
  return (
    <section className={cn("border-t border-fog", className)}>
      <div className="container-page section flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Blade className="mb-6 size-5 text-blue" />
          <h2 className="text-h1">{title}</h2>
          {body ? <p className="mt-4 text-lg text-slate">{body}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild size="lg" variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
