import { practices, getPractice, isPracticeSlug, practiceByEnum, type PracticeContent, type PracticeSlug, type ServiceContent, type ServiceSection } from "./registry";
import { cybersecurityServices } from "./cybersecurity";
import { digitalEngineeringServices } from "./digital-engineering";
import { artificialIntelligenceServices } from "./artificial-intelligence";
import { technologyInfrastructureServices } from "./technology-infrastructure";

/** Every service across the four practices, in display order. */
export const services: ServiceContent[] = [
  ...cybersecurityServices,
  ...digitalEngineeringServices,
  ...artificialIntelligenceServices,
  ...technologyInfrastructureServices,
];

const bySlug = new Map<string, ServiceContent>(services.map((s) => [s.slug, s]));

export function getService(practice: string, slug: string): ServiceContent | undefined {
  const service = bySlug.get(slug);
  return service && service.practice === practice ? service : undefined;
}

export function getServiceBySlug(slug: string): ServiceContent | undefined {
  return bySlug.get(slug);
}

export function servicesByPractice(practice: PracticeSlug): ServiceContent[] {
  return services.filter((s) => s.practice === practice);
}

/** Related services resolved from slugs; unknown slugs are skipped and the list is capped at 3. */
export function relatedServices(service: ServiceContent): ServiceContent[] {
  const out: ServiceContent[] = [];
  for (const slug of service.related) {
    const s = bySlug.get(slug);
    if (s && s.slug !== service.slug) out.push(s);
    if (out.length === 3) break;
  }
  if (out.length < 3) {
    for (const s of servicesByPractice(service.practice)) {
      if (s.slug !== service.slug && !out.includes(s)) out.push(s);
      if (out.length === 3) break;
    }
  }
  return out;
}

/** Services flagged for the home page strip, one or two per practice. */
export function featuredServices(): ServiceContent[] {
  return services.filter((s) => s.featured);
}

/** Path of a service page without the locale prefix. */
export function servicePath(service: Pick<ServiceContent, "practice" | "slug">): string {
  return `/services/${service.practice}/${service.slug}`;
}

export { practices, getPractice, isPracticeSlug, practiceByEnum };
export type { PracticeContent, PracticeSlug, ServiceContent, ServiceSection };
