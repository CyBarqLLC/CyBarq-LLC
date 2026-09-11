"use client";

import * as React from "react";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { changeContentStatus, deleteContent } from "@/lib/actions/content";
import { workflowActionsFor, isoToLocalDateTime, type ContentTable, type WorkflowAction } from "@/lib/validation/content";
import { CONTENT_STATUS_LABELS, label } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Status } from "@/components/ui/status";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ConfirmAction } from "./confirm-action";
import { ActionChoices } from "@/components/platform/action-choices";
import { ServerActionForm } from "@/components/ui/server-action-form";

type WorkflowActionsProps = {
  table: ContentTable;
  id: string;
  status: Enums<"content_status">;
  scheduledFor: string | null;
  publishedAt: string | null;
  canPublish: boolean;
  publicHref?: string;
};

const VARIANT: Record<WorkflowAction, "primary" | "outline" | "ghost" | "secondary"> = {
  submit_review: "outline",
  publish: "primary",
  schedule: "secondary",
  unpublish: "ghost",
  archive: "ghost",
  restore: "outline",
};

/** Explicit editorial workflow: every move is a button, publishing needs content.publish. */
export function WorkflowActions({ table, id, status, scheduledFor, publishedAt, canPublish, publicHref }: WorkflowActionsProps) {
  const [result, formAction] = useActionState(changeContentStatus, null);
  const t = useTranslations("content.workflow");
  const locale = useLocale() as Locale;
  const actions = workflowActionsFor(status, table);
  const needsPublish = (a: WorkflowAction) => a === "publish" || a === "schedule";
  const direct = actions.filter((a) => a !== "schedule" && (!needsPublish(a) || canPublish));
  const canSchedule = actions.includes("schedule") && canPublish;

  return (
    <div className="flex flex-col gap-4 border border-fog bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Status value={status} label={label(CONTENT_STATUS_LABELS, status, locale)} />
        {status === "scheduled" && scheduledFor ? <span className="text-small text-slate">{t("scheduledAt", { date: formatDateTime(scheduledFor, locale) })}</span> : null}
        {status === "published" && publishedAt ? <span className="text-small text-slate">{t("publishedAt", { date: formatDateTime(publishedAt, locale) })}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionChoices
          action={formAction}
          result={result}
          name="action"
          fields={{ table, id }}
          choices={direct.map((a) => ({ value: a, label: t(`actions.${a}`), variant: VARIANT[a] }))}
          className="contents"
        />
        {canSchedule ? <ScheduleDialog table={table} id={id} scheduledFor={scheduledFor} /> : null}
      </div>
      {!canPublish && actions.some(needsPublish) ? <p className="text-small text-slate">{t("publishNeedsPermission")}</p> : null}
      <FormMessage result={result} />
      <div className="flex flex-wrap items-center gap-3 border-t border-fog pt-4">
        {publicHref && status === "published" ? (
          <a href={publicHref} target="_blank" rel="noopener noreferrer" className="text-small text-azure hover:underline">{t("viewPublic")}</a>
        ) : null}
        {canPublish ? (
          <ConfirmAction
            action={deleteContent}
            fields={{ table, id }}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            confirmLabel={t("delete")}
            triggerLabel={t("delete")}
            triggerVariant="ghost"
            className="ms-auto text-danger"
          />
        ) : null}
      </div>
    </div>
  );
}

function ScheduleDialog({ table, id, scheduledFor }: { table: ContentTable; id: string; scheduledFor: string | null }) {
  const [result, formAction] = useActionState(changeContentStatus, null);
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("content.workflow");
  const tc = useTranslations("common");

  React.useEffect(() => {
    if (result?.ok) setOpen(false);
  }, [result]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant={VARIANT.schedule}>{t("actions.schedule")}</Button>
      </DialogTrigger>
      <DialogContent title={t("scheduleTitle")} description={t("scheduleDescription")}>
        <ServerActionForm action={formAction} result={result} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="table" value={table} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="action" value="schedule" />
          <Field label={t("scheduleAt")} htmlFor="schedule_at" error={fieldError(result, "scheduled_for")} required>
            <Input id="schedule_at" name="scheduled_for" type="datetime-local" defaultValue={isoToLocalDateTime(scheduledFor)} required dir="ltr" />
          </Field>
          <FormMessage result={result} />
          <DialogFooter className="mt-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">{tc("cancel")}</Button>
            </DialogClose>
            <SubmitButton>{t("actions.schedule")}</SubmitButton>
          </DialogFooter>
        </ServerActionForm>
      </DialogContent>
    </Dialog>
  );
}
