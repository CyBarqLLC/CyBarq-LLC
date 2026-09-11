import { describe, expect, it } from "vitest";
import { sanitizeRichText, stripHtml } from "@/lib/sanitize";

describe("rich text sanitiser", () => {
  it("removes scripts, handlers and unsafe URLs", () => {
    const dirty = `<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">bad</a><img src="http://evil/x.png"><a href="https://cybarq.com">ok</a>`;
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("javascript:");
    expect(clean).not.toContain("http://evil");
    expect(clean).toContain('href="https://cybarq.com"');
    expect(clean).toContain('rel="noopener noreferrer"');
  });
  it("keeps editorial structure", () => {
    const clean = sanitizeRichText("<h2>Title</h2><ul><li>one</li></ul><blockquote>q</blockquote>");
    expect(clean).toBe("<h2>Title</h2><ul><li>one</li></ul><blockquote>q</blockquote>");
  });
  it("strips to plain text", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});
