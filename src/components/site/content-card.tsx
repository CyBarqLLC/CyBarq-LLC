import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Arrow } from "./action";
import { Reveal } from "./reveal";

type ContentCardProps = {
  href: string;
  title: string;
  excerpt?: string | null;
  /** Category or practice, shown with the meta at the foot of the card. */
  category?: string | null;
  meta?: string | null;
  image?: { src: string; alt: string } | null;
  className?: string;
};

/** Card for news, articles, projects and case studies: optional cover, title, a line, and where it belongs. */
export function ContentCard({ href, title, excerpt, category, meta, image, className }: ContentCardProps) {
  const footer = [category, meta].filter((part): part is string => typeof part === "string" && part.trim() !== "");
  return (
    <li className={className}>
      <Link href={href} className="s-card">
        {image ? (
          <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-fog bg-surface">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
        <div className="s-card__body">
          <h3 className="s-sub">{title}</h3>
          {excerpt ? <p className="s-card__text">{excerpt}</p> : null}
          <p className="s-card__foot">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {footer.map((part, i) => (
                <span key={i} className="flex items-center gap-3">
                  {i > 0 ? <span aria-hidden>·</span> : null}
                  {part}
                </span>
              ))}
            </span>
            <Arrow />
          </p>
        </div>
      </Link>
    </li>
  );
}

/** Grid of content cards; the cards arrive one after another as the grid comes into view. */
export function ContentGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Reveal as="ul" stagger className={cn("s-cards", className)} data-columns={3}>
      {children}
    </Reveal>
  );
}
