import { Icon } from "@/components/brand/icon";
import type { IconName } from "@/components/brand/icon-paths";
import type { NavEntry } from "./nav-config";

/** Navigation icons come from the CyBarq set, never from a general library. */
const icons: Record<NavEntry["icon"], IconName> = {
  home: "dashboard",
  tasks: "tasks",
  clients: "clients",
  projects: "projects",
  security: "security",
  content: "content",
  finance: "finance",
  certificates: "certificates",
  employees: "employees",
  users: "users",
  audit: "audit",
  settings: "settings",
  documents: "documents",
  support: "support",
  portal: "portal",
};

export function NavIcon({ name, className }: { name: NavEntry["icon"]; className?: string }) {
  return <Icon name={icons[name] ?? "dashboard"} className={className} />;
}
