import { Bell, Briefcase, Building2, FileText, Home, ListChecks, Newspaper, Receipt, Settings, Shield, ScrollText, Users, BadgeCheck } from "lucide-react";
import type { NavEntry } from "./nav-config";

const icons: Record<NavEntry["icon"], React.ComponentType<{ className?: string }>> = {
  home: Home,
  tasks: ListChecks,
  clients: Building2,
  projects: Briefcase,
  security: Shield,
  content: Newspaper,
  finance: Receipt,
  certificates: BadgeCheck,
  employees: Users,
  users: Users,
  audit: ScrollText,
  settings: Settings,
  bell: Bell,
};

export function NavIcon({ name, className }: { name: NavEntry["icon"]; className?: string }) {
  const Icon = icons[name] ?? FileText;
  return <Icon className={className} aria-hidden />;
}
