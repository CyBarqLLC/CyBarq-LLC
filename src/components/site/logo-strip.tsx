import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type LogoStripProps = {
  title: string;
  logos: readonly string[];
  /** Alt text shared by every logo ("Partner logo", "Certification logo"). */
  alt: string;
  className?: string;
};

/**
 * Calm, static logo grid. Grayscale at rest, colour on hover or focus; never a
 * marquee. Sizes are intrinsic to the grid cell so no layout shift occurs.
 */
export function LogoStrip({ title, logos, alt, className }: LogoStripProps) {
  return (
    <section className={cn("container-page", className)} aria-label={title}>
      <h2 className="mb-6 text-label text-slate">{title}</h2>
      <ul className="grid grid-cols-3 gap-px border border-fog bg-fog sm:grid-cols-4 lg:grid-cols-7">
        {logos.map((src) => (
          <li key={src} className="flex h-24 items-center justify-center bg-white p-5 sm:h-28">
            <Image
              src={src}
              alt={alt}
              width={160}
              height={64}
              className="h-auto max-h-12 w-auto max-w-full opacity-60 grayscale transition-[opacity,filter] duration-(--duration-state) hover:opacity-100 hover:grayscale-0"
              sizes="(min-width: 1024px) 160px, 30vw"
              unoptimized={src.endsWith(".svg")}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
