import type { Locale } from "./routing";

/**
 * Messages are split per namespace under messages/<locale>/<namespace>.json so
 * modules can own their strings. Namespaces are merged at request time.
 */
export const NAMESPACES = ["common", "errors", "site", "services", "auth", "platform", "portal", "finance", "security", "content", "certificates", "hr", "projects"] as const;
export type Namespace = (typeof NAMESPACES)[number];

type Messages = Record<string, unknown>;

export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => {
      try {
        const mod = (await import(`../../messages/${locale}/${ns}.json`)) as { default: Messages };
        return [ns, mod.default] as const;
      } catch {
        return [ns, {}] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}
