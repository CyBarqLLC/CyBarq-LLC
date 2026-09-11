import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type FilterOption = { value: string; label: string };

type Props = {
  basePath: string;
  search?: string;
  status?: string;
  client?: string;
  statuses: FilterOption[];
  clients: FilterOption[];
  labels: { status: string; client: string; search: string; searchPlaceholder: string; apply: string; clear: string; allStatuses: string; allClients: string };
};

/** GET form: status, client and text search. Works without JavaScript. */
export function FinanceFilters({ basePath, search, status, client, statuses, clients, labels }: Props) {
  const hasFilters = Boolean(search || status || client);
  return (
    <form method="get" className="mb-5 grid grid-cols-1 gap-3 border border-fog bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_14rem_auto] lg:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="q">{labels.search}</Label>
        <Input id="q" name="q" type="search" defaultValue={search ?? ""} placeholder={labels.searchPlaceholder} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">{labels.status}</Label>
        <NativeSelect id="status" name="status" defaultValue={status ?? ""}>
          <option value="">{labels.allStatuses}</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client">{labels.client}</Label>
        <NativeSelect id="client" name="client" defaultValue={client ?? ""}>
          <option value="">{labels.allClients}</option>
          {clients.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
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
