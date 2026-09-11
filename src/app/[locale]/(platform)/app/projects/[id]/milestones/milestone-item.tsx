"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";
import { MilestoneForm, type MilestoneFormValues } from "./milestone-form";

type MilestoneItemProps = {
  milestoneId: string;
  values: MilestoneFormValues;
  statuses: Option[];
  updateAction: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  /** Read only presentation rendered by the server. */
  summary: React.ReactNode;
  /** Delete control rendered by the server (already bound). */
  deleteControl?: React.ReactNode;
};

/** Read view with an inline edit form, so milestones are edited in place without leaving the tab. */
export function MilestoneItem({ milestoneId, values, statuses, updateAction, summary, deleteControl }: MilestoneItemProps) {
  const [editing, setEditing] = useState(false);
  const t = useTranslations("projects.milestones");
  return (
    <li className="border border-fog bg-white p-4 sm:p-5">
      {editing ? (
        <MilestoneForm action={updateAction} defaults={values} statuses={statuses} submitLabel={t("edit")} onDone={() => setEditing(false)} idPrefix={`m-${milestoneId}`} />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">{summary}</div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>{t("edit")}</Button>
            {deleteControl}
          </div>
        </div>
      )}
    </li>
  );
}
