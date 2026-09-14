"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type IndexItem = {
  slug: string;
  practice: string;
  practiceLabel: string;
  title: string;
  summary: string;
  href: string;
};

type ServiceIndexProps = {
  items: IndexItem[];
  practices: { slug: string; label: string }[];
  labels: {
    /** Accessible name of the whole index. */
    region: string;
    search: string;
    searchLabel: string;
    all: string;
    empty: string;
    filterLabel: string;
  };
};

/** Folds the Arabic definite article and diacritics away so search is forgiving. */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[يى]/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Everything the company does, as one working index rather than a wall of
 * cards. A visitor can read all of it at once, narrow it by practice, or type
 * a word and watch the list answer. Every row is a link to the service page.
 */
export function ServiceIndex({ items, practices, labels }: ServiceIndexProps) {
  const t = useTranslations("site.home.index");
  const [query, setQuery] = React.useState("");
  const [practice, setPractice] = React.useState<string | null>(null);

  const prepared = React.useMemo(() => items.map((item) => ({ item, haystack: fold(`${item.title} ${item.summary} ${item.practiceLabel}`) })), [items]);

  const shown = React.useMemo(() => {
    const q = fold(query);
    const terms = q ? q.split(" ").filter(Boolean) : [];
    return prepared
      .filter(({ item, haystack }) => (!practice || item.practice === practice) && terms.every((term) => haystack.includes(term)))
      .map(({ item }) => item);
  }, [prepared, query, practice]);

  return (
    <section className="s-index" aria-label={labels.region}>
      <div className="s-index__controls">
        <div className="s-index__filters" role="group" aria-label={labels.filterLabel}>
          <button type="button" className="s-chip" data-on={practice === null ? "" : undefined} onClick={() => setPractice(null)} aria-pressed={practice === null}>
            {labels.all}
          </button>
          {practices.map((p) => (
            <button
              key={p.slug}
              type="button"
              className="s-chip"
              data-on={practice === p.slug ? "" : undefined}
              onClick={() => setPractice(practice === p.slug ? null : p.slug)}
              aria-pressed={practice === p.slug}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="s-index__search">
          <label htmlFor="service-index-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <input
            id="service-index-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            autoComplete="off"
            className="s-index__field"
          />
          <span className="s-meta s-index__count" aria-live="polite">
            {t("count", { shown: shown.length, total: items.length })}
          </span>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="s-index__empty">{labels.empty}</p>
      ) : (
        <ul className="s-index__list">
          {shown.map((item, i) => (
            <li key={item.slug} className="s-index__row">
              <Link href={item.href} className="s-index__link">
                <span aria-hidden className="s-meta s-index__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="s-index__title">{item.title}</span>
                <span className="s-index__summary">{item.summary}</span>
                <span className="s-meta s-index__practice">{item.practiceLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
