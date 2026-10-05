import type { Locale } from "./routing";

/**
 * Messages are split per namespace under messages/<locale>/<namespace>.json so
 * modules can own their strings. Namespaces are merged at request time.
 */
export const NAMESPACES = ["common", "errors", "site", "services", "auth", "platform", "portal", "finance", "security", "content", "certificates", "hr", "projects"] as const;
export type Namespace = (typeof NAMESPACES)[number];

/**
 * The namespaces a public or sign in page can need in the browser. Only these
 * are sent with those pages; the platform and the portal add the rest in
 * their own layouts, so internal wording never ships in public page source.
 */
export const PUBLIC_NAMESPACES = ["common", "errors", "site", "services", "auth"] as const satisfies readonly Namespace[];

type Messages = Record<string, unknown>;

/** The subset of a loaded catalogue that public pages send to the browser. */
export function publicMessages(messages: Messages): Messages {
  return Object.fromEntries(PUBLIC_NAMESPACES.map((ns) => [ns, messages[ns] ?? {}]));
}

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
