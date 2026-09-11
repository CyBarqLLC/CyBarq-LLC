import Image from "next/image";
import { Stream } from "@/components/brand/stream";
import type { StreamParams } from "@/components/brand/stream-math";
import { StretchedCornerMarks } from "@/components/brand/stretched-corner-marks";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type StatementBandProps = {
  statement: string;
  body?: string;
  className?: string;
};

/**
 * Line form in White, running slowly, entering and leaving at the edges.
 * A module constant: the canvas restarts whenever it receives a new object.
 * Mirrors the job in scripts/generate-stream-svgs.ts for the first paint.
 */
const LINE_BAND: StreamParams = { flow: 0.8, alpha: 0.75, spread: 0.1, share: 0.07, fadeIn: 1.2, fadeRight: true, fadeOut: 1.2 };

/**
 * The dark statement band of the home page: Graphite ground, white type, the
 * slogan in display size, and the live Stream ("line" preset, white at low
 * opacity with CyBarq Blue accents) running through it as a thin river
 * behind the text. Carries the two stretched corner blades: the only
 * decorative marks on the public site, used here and nowhere else.
 */
export function StatementBand({ statement, body, className }: StatementBandProps) {
  return (
    <section className={cn("relative overflow-hidden bg-graphite text-white", className)}>
      <div className="absolute inset-0" aria-hidden>
        <Stream preset="line" params={LINE_BAND} ink="#FFFFFF" accent="#74C3F2" interactive className="absolute inset-0">
          <Image src="/brand/pattern/stream-line-band.svg" alt="" fill unoptimized loading="lazy" sizes="100vw" className="object-cover" />
        </Stream>
      </div>
      <StretchedCornerMarks inset="clamp(1.75rem, 4vw, 3rem)" className="text-white/80" />
      <div className="container-page pointer-events-none relative flex flex-col items-center gap-8 py-32 text-center sm:py-40 lg:py-48">
        <Reveal>
          <p className="text-display max-w-4xl">{statement}</p>
        </Reveal>
        {body ? (
          <Reveal delay={140}>
            <p className="max-w-2xl text-lg text-white/75">{body}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
