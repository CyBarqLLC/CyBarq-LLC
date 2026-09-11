import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type FilterOption = { value: string; label: string };

type Props = {
  basePath: string;
  search?: string;
  type?: string;
  status?: string;
  types: FilterOption[];
  statuses: FilterOption[];
  labels: { type: string; status: string; search: string; searchPlaceholder: string; apply: string; clear: string; allTypes: string; allStatuses: string };
};

/** GET form: type, status and text search. Works without JavaScript. */
export function CertificateFilters({ basePath, search, type, status, types, statuses, labels }: Props) {
  const hasFilters = Boolean(search || type || status);
  return (
    <form method="get" className="mb-5 grid grid-cols-1 gap-3 border border-fog bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_14rem_12rem_auto] lg:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="q">{labels.search}</Label>
        <Input id="q" name="q" type="search" defaultValue={search ?? ""} placeholder={labels.searchPlaceholder} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">{labels.type}</Label>
        <NativeSelect id="type" name="type" defaultValue={type ?? ""}>
          <option value="">{labels.allTypes}</option>
          {types.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">{labels.status}</Label>
        <NativeSelect id="status" name="status" defaultValue={status ?? ""}>
          <option value="">{labels.allStatuses}</option>
          {statuses.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">{labels.apply}</Button>
        {hasFilters ? (
          <Button asChild variant="ghost">
            <Link href={basePath}>{labels.clear}</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
