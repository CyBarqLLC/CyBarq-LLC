import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { MarqueeFrame } from "./marquee-frame";
import { Reveal } from "./reveal";

/** A logo with the name used as its alternative text and the artwork's width to height ratio. */
export type LogoItem = { name: string; logo: string; ratio: number };

/**
 * Display size for a logo: equal visual area for every mark (so a long
 * wordmark does not shout over a compact one), capped to the cell.
 */
function logoSize(ratio: number, area: number, maxWidth: number, maxHeight: number): { width: number; height: number } {
  let height = Math.sqrt(area / ratio);
  let width = height * ratio;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / ratio;
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

/** Enough copies per group that one group is wider than the widest container (8 cells of 11rem > 80rem). */
const MIN_ITEMS_PER_GROUP = 8;

type LogoMarqueeProps = {
  id: string;
  title: string;
  items: readonly LogoItem[];
  labels: { pause: string; play: string; subject: string };
  className?: string;
};

/**
 * A slow, continuous marquee of logos: pure CSS transform animation, mirrored
 * in right to left layouts, with a duplicated sequence for a seamless loop
 * (the duplicate is hidden from assistive technology). Edges fade out, motion
 * pauses on hover and focus, logos sit in fixed cells so nothing shifts, and
 * with reduced motion the list becomes a static, wrapped row.
 */
export function LogoMarquee({ id, title, items, labels, className }: LogoMarqueeProps) {
  if (items.length === 0) return null;
  const headingId = `${id}-title`;
  const repeats = Math.max(1, Math.ceil(MIN_ITEMS_PER_GROUP / items.length));
  const cells = Array.from({ length: repeats }, (_, copy) => items.map((item) => ({ item, copy }))).flat();
  // About 6 seconds per logo keeps the pace slow whatever the count.
  const duration = `${cells.length * 6}s`;

  const renderCell = ({ item, copy }: { item: LogoItem; copy: number }, hidden: boolean) => {
    const size = logoSize(item.ratio, 3200, 144, 40);
    const decorative = hidden || copy > 0;
    return (
      <li key={`${item.logo}-${copy}`} className={cn("site-marquee__item", copy > 0 && "site-marquee__repeat")} aria-hidden={!hidden && copy > 0 ? true : undefined}>
        <Image src={item.logo} alt={decorative ? "" : item.name} width={size.width} height={size.height} unoptimized className="site-logo" />
      </li>
    );
  };

  return (
    <Reveal as="section" aria-labelledby={headingId} className={cn("container-page", className)}>
      <MarqueeFrame headingId={headingId} title={title} labels={labels}>
        <div className="site-marquee">
          <div className="site-marquee__track" style={{ animationDuration: duration }}>
            <ul className="site-marquee__group">{cells.map((cell) => renderCell(cell, false))}</ul>
            <ul className="site-marquee__group" aria-hidden="true">
              {cells.map((cell) => renderCell(cell, true))}
            </ul>
          </div>
        </div>
      </MarqueeFrame>
    </Reveal>
  );
}

type LogoGridProps = {
  id: string;
  title: string;
  items: readonly LogoItem[];
  className?: string;
};

/** Calm, static grid of logos (used for certifications). Fixed cells, grey at rest, colour on hover. */
export function LogoGrid({ id, title, items, className }: LogoGridProps) {
  if (items.length === 0) return null;
  const headingId = `${id}-title`;
  return (
    <section aria-labelledby={headingId} className={cn("container-page", className)}>
      <Reveal>
        <h2 id={headingId} className="mb-6 flex min-h-11 items-center text-label text-slate">
          {title}
        </h2>
      </Reveal>
      <Reveal as="ul" stagger className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 sm:gap-x-6 lg:grid-cols-7">
        {items.map((item) => {
          const size = logoSize(item.ratio, 4200, 112, 64);
          return (
            <li key={item.logo} className="site-logo-cell flex h-20 items-center justify-center sm:h-24">
              <Image src={item.logo} alt={item.name} width={size.width} height={size.height} sizes={`${size.width}px`} className="site-logo max-w-full object-contain" />
            </li>
          );
        })}
      </Reveal>
    </section>
  );
}
