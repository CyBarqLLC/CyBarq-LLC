"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "./dialog";

export type CommandItem = { id: string; label: string; group: string; href: string; keywords?: string[] };

type CommandSearchProps = {
  items: CommandItem[];
  labels: { placeholder: string; empty: string; title: string; open: string };
};

/** Keyboard (Ctrl/Cmd+K) and touch friendly command palette for the platform. */
export function CommandSearch({ items, labels }: CommandSearchProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of items) map.set(item.group, [...(map.get(item.group) ?? []), item]);
    return [...map.entries()];
  }, [items]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch flex items-center gap-2 border border-fog px-3 text-small text-slate hover:border-grey sm:min-w-56"
        aria-label={labels.open}
      >
        <Search className="size-4" aria-hidden />
        <span className="hidden sm:inline">{labels.placeholder}</span>
        <kbd className="ms-auto hidden text-label sm:inline">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={labels.title} className="sm:max-w-xl">
          <Command label={labels.title} className="flex flex-col">
            <div className="flex items-center gap-2 border border-fog px-3">
              <Search className="size-4 text-slate" aria-hidden />
              <Command.Input placeholder={labels.placeholder} className="h-11 w-full bg-transparent outline-none" autoFocus />
            </div>
            <Command.List className="mt-3 max-h-80 overflow-y-auto">
              <Command.Empty className="px-3 py-6 text-center text-small text-slate">{labels.empty}</Command.Empty>
              {groups.map(([group, list]) => (
                <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:text-slate">
                  {list.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(item.href);
                      }}
                      className="flex cursor-default items-center px-3 py-2.5 text-body data-[selected=true]:bg-ice"
                    >
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
