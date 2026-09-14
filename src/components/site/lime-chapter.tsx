import { Stream } from "@/components/brand/stream";
import { StreamStatic } from "@/components/brand/stream-static";
import type { StreamParams } from "@/components/brand/stream-math";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { Rise, Settle } from "./reveal";

/** A line of the field running low across the chapter, in Graphite on lime. */
const LINE: StreamParams = { flow: 0.7, alpha: 0.5, spread: 0.1, share: 0, cy0: 0.82, amp: 0.05, fadeIn: 1.2, fadeRight: true, fadeOut: 1.2 };

export type Figure = { value: string; label: { en: string; ar: string } };

type LimeChapterProps = {
  statement: string;
  body?: string;
  figures?: readonly Figure[];
  locale: Locale;
  className?: string;
};

/**
 * The lime chapter. One full width field in the brand's second colour, set
 * flat, carrying the statement and the company's figures. It is the moment the
 * page changes temperature: no gradient, no mixing with the blue, just the
 * colour at full strength with Graphite type on it.
 */
export function LimeChapter({ statement, body, figures, locale, className }: LimeChapterProps) {
  return (
    <section className={cn("s-lime", className)}>
      <div className="absolute inset-0" aria-hidden>
        <Stream preset="line" params={LINE} ink="#0D0E13" accent="#0D0E13" interactive className="absolute inset-0">
          <StreamStatic preset="line" params={LINE} width={1200} height={400} ink="#0D0E13" accent="#0D0E13" />
        </Stream>
      </div>

      <div className="container-page relative">
        <div className="pointer-events-none flex flex-col gap-7 py-24 sm:py-28 lg:py-36">
          <Rise>
            <p className="s-display max-w-4xl">{statement}</p>
          </Rise>
          {body ? (
            <Rise delay={140}>
              <p className="s-lede max-w-2xl text-graphite/75">{body}</p>
            </Rise>
          ) : null}
        </div>

        {figures && figures.length > 0 ? (
          <Settle as="dl" stagger className="s-figures">
            {figures.map((figure) => (
              <div key={figure.label.en}>
                <dt className="s-meta text-graphite/60">{figure.label[locale]}</dt>
                <dd className="s-figure mt-4 text-graphite">{figure.value}</dd>
              </div>
            ))}
          </Settle>
        ) : null}
      </div>
    </section>
  );
}
