import Image from "next/image";
import type * as React from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

type PostHeaderProps = {
  crumbs: Crumb[];
  title: string;
  lead?: string | null;
  /** Meta line items (author, date, reading time). Rendered separated by a middle dot. */
  meta?: Array<string | null | undefined>;
  cover?: { src: string; alt: string } | null;
  children?: React.ReactNode;
};

/** Opening of a news post, article, project or case study. Nothing above the title; category, author and date share the meta line. */
export function PostHeader({ crumbs, title, lead, meta, cover, children }: PostHeaderProps) {
  const metaItems = (meta ?? []).filter((m): m is string => typeof m === "string" && m.trim() !== "");
  return (
    <header className="container-page pt-10 sm:pt-14">
      <Breadcrumbs items={crumbs} className="mb-8" />
      <div className="site-enter max-w-3xl">
        <h1 className="s-display">{title}</h1>
        {lead ? <p className="s-lede mt-5">{lead}</p> : null}
        {metaItems.length > 0 ? (
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-slate">
            {metaItems.map((m, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden className="text-grey">·</span> : null}
                {m}
              </span>
            ))}
          </p>
        ) : null}
        {children}
      </div>
      {cover ? (
        <div className="relative mt-10 aspect-[2/1] w-full overflow-hidden border border-fog bg-surface">
          <Image src={cover.src} alt={cover.alt} fill priority sizes="(min-width: 1280px) 1280px, 100vw" className="object-cover" />
        </div>
      ) : null}
    </header>
  );
}
