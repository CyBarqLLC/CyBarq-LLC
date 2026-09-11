import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type ContentCardProps = {
  href: string;
  title: string;
  excerpt?: string | null;
  eyebrow?: string | null;
  meta?: string | null;
  image?: { src: string; alt: string } | null;
  className?: string;
};

/** Card for news, articles, projects and case studies. Square corners, one rule, optional cover. */
export function ContentCard({ href, title, excerpt, eyebrow, meta, image, className }: ContentCardProps) {
  return (
    <li className={cn("bg-white", className)}>
      <Link href={href} className="group flex h-full flex-col transition-colors duration-(--duration-state) hover:bg-ice/60 focus-visible:bg-ice/60 focus-visible:-outline-offset-2">
        {image ? (
          <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-fog bg-surface">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {eyebrow ? <span className="text-label text-slate">{eyebrow}</span> : null}
          <h3 className="text-h3 group-hover:underline underline-offset-4">{title}</h3>
          {excerpt ? <p className="text-small text-slate">{excerpt}</p> : null}
          {meta ? <p className="mt-auto pt-2 text-small text-slate">{meta}</p> : null}
        </div>
      </Link>
    </li>
  );
}

export function ContentGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn("grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-3", className)}>{children}</ul>;
}
