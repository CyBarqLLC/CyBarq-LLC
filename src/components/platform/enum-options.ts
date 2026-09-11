import type { Locale } from "@/i18n/routing";

export type Option = { value: string; label: string };

/** Builds select options from a label map in the order given by `keys` (or the map's keys). */
export function enumOptions<T extends string>(map: Record<T, Record<Locale, string>>, locale: Locale, keys?: readonly T[]): Option[] {
  const list = keys ?? (Object.keys(map) as T[]);
  return list.map((value) => ({ value, label: map[value][locale] }));
}
