import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";

export type RoleOption = { key: string; name_en: string; name_ar: string; description: string | null };

/** Plain checkbox list of roles for server rendered forms. Repeated `roles` values are parsed by the action. */
export function RoleCheckboxes({ roles, selected, locale, canGrantSuperAdmin, idPrefix = "role" }: { roles: RoleOption[]; selected: ReadonlySet<string>; locale: Locale; canGrantSuperAdmin: boolean; idPrefix?: string }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {roles.map((role) => {
        const disabled = role.key === "super_admin" && !canGrantSuperAdmin;
        const id = `${idPrefix}-${role.key}`;
        return (
          <li key={role.key} className="flex items-start gap-3 border border-fog bg-white p-3">
            <input id={id} name="roles" type="checkbox" value={role.key} defaultChecked={selected.has(role.key)} disabled={disabled} className="mt-1 size-5 shrink-0 accent-graphite disabled:opacity-50" />
            <label htmlFor={id} className="min-w-0 flex-1">
              <span className="block text-body font-medium">{pick(role, "name", locale)}</span>
              {role.description ? <span className="block text-small text-slate">{role.description}</span> : null}
              <span className="block font-mono text-label text-slate" dir="ltr">{role.key}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
