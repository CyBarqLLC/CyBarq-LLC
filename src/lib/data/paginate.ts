import { DEFAULT_PAGE_SIZE, parsePage } from "@/components/ui/pagination";

/** Server side pagination helpers shared by list pages. */
export function pagination(searchParams: Record<string, string | string[] | undefined>, pageSize = DEFAULT_PAGE_SIZE) {
  const page = parsePage(searchParams.page);
  const from = (page - 1) * pageSize;
  return { page, pageSize, from, to: from + pageSize - 1 };
}

export function withPage(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  sp.set("page", String(page));
  return `${basePath}?${sp.toString()}`;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export function param(searchParams: SearchParams, key: string): string | undefined {
  const v = searchParams[key];
  return Array.isArray(v) ? v[0] : v;
}
