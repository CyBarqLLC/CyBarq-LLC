import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { EmployeeRecord } from "../employee-record";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.record");
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** HR view of one employee. hr.read, or the employee themself. */
export default async function EmployeeDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const viewer = await requireEmployee();
  const { userId } = await params;
  if (!UUID.test(userId)) notFound();
  const self = userId === viewer.userId;
  if (!self && !viewer.can("hr.read")) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: "/app/forbidden", locale });
  }
  return <EmployeeRecord userId={userId} viewer={viewer} self={self} />;
}
