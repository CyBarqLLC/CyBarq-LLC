import { cn } from "@/lib/utils/cn";
import { Action } from "./action";
import { Reveal } from "./reveal";

type CtaPanelProps = {
  title: string;
  body?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
};

/**
 * How every page closes: one field of CyBarq Blue, one line, and the way to
 * reach us. The footer below it is night, so the blue is the last colour on
 * the page.
 */
export function CtaPanel({ title, body, primary, secondary, className }: CtaPanelProps) {
  return (
    <section className={cn("s-field-blue text-graphite", className)}>
      <Reveal className="container-page flex flex-col gap-10 py-20 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-28">
        <div className="max-w-3xl">
          <h2 className="s-title">{title}</h2>
          {body ? <p className="s-lede mt-5 max-w-2xl">{body}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Action href={primary.href} arrow>
            {primary.label}
          </Action>
          {secondary ? (
            <Action href={secondary.href} variant="line">
              {secondary.label}
            </Action>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
