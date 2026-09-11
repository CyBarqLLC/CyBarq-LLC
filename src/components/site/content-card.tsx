import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type ContentCardProps = {
  href: string;
  title: string;
  excerpt?: string | null;
  /** Category or practice, shown with the meta under the text. */
  category?: string | null;
  meta?: string | null;
  image?: { src: string; alt: string } | null;
  className?: string;
};

/** Card for news, articles, projects and case studies. Square corners, one rule, optional cover, nothing above the title. */
export function ContentCard({ href, title, excerpt, category, meta, image, className }: ContentCardProps) {
  const footer = [category, meta].filter((part): part is string => typeof part === "string" && part.trim() !== "");
  return (
    <li className={cn("bg-white", className)}>
      <Link
        href={href}
        className="group flex h-full flex-col transition-[background-color,box-shadow] duration-(--duration-state) hover:bg-ice/60 hover:shadow-[inset_0_0_0_1px_var(--color-graphite)] focus-visible:bg-ice/60 focus-visible:-outline-offset-2"
      >
        {image ? (
          <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-fog bg-surface">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="text-h3 underline-offset-4 group-hover:underline">{title}</h3>
          {excerpt ? <p className="text-small text-slate">{excerpt}</p> : null}
          {footer.length > 0 ? (
            <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-small text-slate">
              {footer.map((part, i) => (
                <span key={i} className="flex items-center gap-3">
                  {i > 0 ? (
                    <span aria-hidden className="text-grey">
                      ·
                    </span>
                  ) : null}
                  {part}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

/** Hairline grid of cards; the cards move in one after another as the grid comes into view. */
export function ContentGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Reveal as="ul" stagger className={cn("grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </Reveal>
  );
}
