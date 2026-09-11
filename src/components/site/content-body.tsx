import { sanitizeRichText } from "@/lib/sanitize";
import { cn } from "@/lib/utils/cn";

const looksLikeHtml = (value: string) => /<[a-z][^>]*>/i.test(value);

/**
 * Renders CMS rich text. The HTML is sanitised again at render time (it was
 * also sanitised on save) and placed inside the `.prose-cb` container. Plain
 * text (no tags) is split into paragraphs on blank lines so older or simpler
 * fields still read well.
 */
export function ContentBody({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html || html.trim() === "") return null;
  if (!looksLikeHtml(html)) {
    const paragraphs = html.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className={cn("prose-cb", className)}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }
  return <div className={cn("prose-cb", className)} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}
