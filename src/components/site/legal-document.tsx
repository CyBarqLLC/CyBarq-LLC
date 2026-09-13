import type { Locale } from "@/i18n/routing";
import type { LegalDocument } from "@/content/site/legal";
import { formatDate } from "@/lib/utils/format";
import { PageIntro } from "./page-intro";
import { Reveal } from "./reveal";
import type { Crumb } from "./breadcrumbs";

type LegalDocumentViewProps = { document: LegalDocument; locale: Locale; updatedLabel: (date: string) => string; crumbs: Crumb[] };

/** Renders a legal document: intro, then sections with a sticky heading column on large screens. */
export function LegalDocumentView({ document, locale, updatedLabel, crumbs }: LegalDocumentViewProps) {
  return (
    <>
      <PageIntro title={document.title[locale]} lead={document.intro[locale]} meta={updatedLabel(formatDate(document.updated, locale, "long"))} crumbs={crumbs} />
      <div className="container-page pb-16 sm:pb-24">
        {document.sections.map((section) => (
          <section key={section.title.en} className="grid gap-4 border-t border-fog py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <h2 className="s-sub lg:sticky lg:top-[calc(var(--site-header-offset)+1.5rem)] lg:self-start">{section.title[locale]}</h2>
            <Reveal className="flex max-w-prose flex-col gap-4 leading-relaxed">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p[locale]}</p>
              ))}
            </Reveal>
          </section>
        ))}
      </div>
    </>
  );
}
