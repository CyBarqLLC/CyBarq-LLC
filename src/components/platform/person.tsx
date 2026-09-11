import { Avatar } from "@/components/ui/avatar";
import { publicUrl } from "@/lib/storage";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export type PersonLike = { full_name: string | null; full_name_ar?: string | null; email?: string | null; avatar_path?: string | null } | null | undefined;

/** Localized display name with a fallback to the other language, then the email. */
export function personName(person: PersonLike, locale: Locale, fallback = ""): string {
  if (!person) return fallback;
  const primary = locale === "ar" ? person.full_name_ar : person.full_name;
  const secondary = locale === "ar" ? person.full_name : person.full_name_ar;
  return (primary && primary.trim()) || (secondary && secondary.trim()) || person.email || fallback;
}

/** True for a "name" that is really an email local part ("info", "m.alnajjar"): ASCII, lowercase, no spaces. */
export function looksLikeEmailLocalPart(name: string): boolean {
  const n = name.trim();
  return n !== "" && /^[a-z0-9][a-z0-9._+-]*$/.test(n);
}

/** Name for sentences and lists: like `personName`, but an email local part is capitalised so it reads as a word. */
export function displayName(person: PersonLike, locale: Locale, fallback = ""): string {
  const name = personName(person, locale, fallback);
  if (name === fallback || name.includes("@")) return name;
  return looksLikeEmailLocalPart(name) ? name.charAt(0).toUpperCase() + name.slice(1) : name;
}

/**
 * First name for greetings, or null when the profile has no real name yet
 * (empty, an email address or an email local part such as "info").
 */
export function greetingName(person: PersonLike, locale: Locale): string | null {
  const name = personName(person, locale, "");
  if (!name || name.includes("@") || looksLikeEmailLocalPart(name)) return null;
  const first = name.split(/\s+/).find((part) => part.length > 1);
  return first ?? null;
}

/** Avatar and name, optionally with a secondary line. Server component friendly. */
export function Person({ person, locale, secondary, size = "sm", className, fallback = "" }: { person: PersonLike; locale: Locale; secondary?: string | null; size?: "sm" | "md"; className?: string; fallback?: string }) {
  const name = personName(person, locale, fallback);
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <Avatar name={name || "?"} src={person?.avatar_path ? publicUrl("public-content", person.avatar_path) : null} size={size} />
      <span className="min-w-0">
        <span className="block truncate">{name || fallback}</span>
        {secondary ? <span className="block truncate text-small text-slate">{secondary}</span> : null}
      </span>
    </span>
  );
}
