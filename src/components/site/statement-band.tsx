import Image from "next/image";
import { Stream } from "@/components/brand/stream";
import type { StreamParams } from "@/components/brand/stream-math";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { FieldFrame } from "./frame";
import { Rise, Settle } from "./reveal";

/**
 * Line form in White, running slowly below the statement, entering and leaving
 * at the edges. A module constant: the canvas restarts whenever it receives a
 * new object. Mirrors the job in scripts/generate-stream-svgs.ts for the first
 * paint.
 */
const LINE_BAND: StreamParams = { flow: 0.8, alpha: 0.8, spread: 0.09, share: 0.07, cy0: 0.76, amp: 0.06, fadeIn: 1.2, fadeRight: true, fadeOut: 1.2 };

export type Figure = { value: string; label: { en: string; ar: string } };

type StatementBandProps = {
  statement: string;
  body?: string;
  /** The specification row printed under the statement. */
  figures?: readonly Figure[];
  locale: Locale;
  className?: string;
};

/**
 * The one dark chapter of the page. Graphite ground, white type, the slogan at
 * display size and the Stream running through it as a thin river behind the
 * text, with the blades of the symbol opened to the corners of the field and
 * the company's figures set underneath on hairlines, tabular, at specification
 * scale.
 *
 * It is the only dark application on the public site, kept contained and flat,
 * at about the fourteen parts of Graphite the colour ratio allows.
 */
export function StatementBand({ statement, body, figures, locale, className }: StatementBandProps) {
  return (
    <section className={cn("s-dark", className)}>
      <div className="absolute inset-0" aria-hidden>
        <Stream preset="line" params={LINE_BAND} ink="#FFFFFF" accent="#74C3F2" interactive className="absolute inset-0">
          <Image src="/brand/pattern/stream-line-band.svg" alt="" fill unoptimized loading="lazy" sizes="100vw" className="object-cover" />
        </Stream>
      </div>

      <FieldFrame inset="clamp(1.25rem, 3vw, 2.5rem)" size={16} className="text-white/70" />

      <div className="container-page relative">
        <div className="pointer-events-none flex flex-col gap-7 py-24 sm:py-28 lg:py-36">
          <Rise>
            <p className="s-display max-w-5xl">{statement}</p>
          </Rise>
          {body ? (
            <Rise delay={140}>
              <p className="s-lede max-w-2xl text-white/75">{body}</p>
            </Rise>
          ) : null}
        </div>

        {figures && figures.length > 0 ? (
          <Settle as="dl" stagger className="s-figures">
            {figures.map((figure) => (
              <div key={figure.label.en}>
                <dt className="s-meta text-white/60">{figure.label[locale]}</dt>
                <dd className="s-figure mt-4 text-white">{figure.value}</dd>
              </div>
            ))}
          </Settle>
        ) : null}
      </div>
    </section>
  );
}
