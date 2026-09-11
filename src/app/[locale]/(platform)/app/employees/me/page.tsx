import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireEmployee } from "@/lib/auth/session";
import { EmployeeRecord } from "../employee-record";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.directory");
  return { title: t("myRecord"), robots: { index: false, follow: false } };
}

/** The signed in employee's own HR record and documents. */
export default async function MyEmployeeRecordPage() {
  const viewer = await requireEmployee();
  return <EmployeeRecord userId={viewer.userId} viewer={viewer} self />;
}
