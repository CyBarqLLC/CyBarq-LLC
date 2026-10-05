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
      <div className="container-page pb-(--s-rhythm)">
        {document.sections.map((section) => (
          <section key={section.title.en} className="s-narrative">
            <h2 className="s-sub">{section.title[locale]}</h2>
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
