"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type TaskFormValues = {
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_user_id: string | null;
  milestone_id: string | null;
  due_date: string | null;
};

type TaskFormProps = {
  mode: "create" | "edit";
  projectId: string;
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: TaskFormValues;
  assignees: Option[];
  milestones: Option[];
  statuses: Option[];
  priorities: Option[];
};

export function TaskForm({ mode, projectId, action, defaults, assignees, milestones, statuses, priorities }: TaskFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("projects.tasks");
  const router = useRouter();
  const handled = useRef<ActionResult<{ id: string }> | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(mode === "create" ? t("created") : t("saved"));
      router.push(`/app/projects/${projectId}/tasks/${result.data.id}`);
    }
  }, [result, mode, projectId, router, t]);

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-5" noValidate>
      <Field label={t("fields.title")} htmlFor="title" error={fieldError(result, "title")} required>
        <Input id="title" name="title" defaultValue={defaults.title} required maxLength={200} aria-invalid={!!fieldError(result, "title")} />
      </Field>
      <Field label={t("fields.description")} htmlFor="description" error={fieldError(result, "description")}>
        <Textarea id="description" name="description" defaultValue={defaults.description ?? ""} maxLength={5000} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("fields.status")} htmlFor="status" error={fieldError(result, "status")} required>
          <NativeSelect id="status" name="status" defaultValue={defaults.status}>
            {statuses.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t("fields.priority")} htmlFor="priority" error={fieldError(result, "priority")} required>
          <NativeSelect id="priority" name="priority" defaultValue={defaults.priority}>
            {priorities.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t("fields.assignee")} htmlFor="assignee_user_id" hint={t("assigneeHint")} error={fieldError(result, "assignee_user_id")}>
          <NativeSelect id="assignee_user_id" name="assignee_user_id" defaultValue={defaults.assignee_user_id ?? ""} aria-invalid={!!fieldError(result, "assignee_user_id")}>
            <option value="">{t("fields.unassigned")}</option>
            {assignees.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t("fields.milestone")} htmlFor="milestone_id" error={fieldError(result, "milestone_id")}>
          <NativeSelect id="milestone_id" name="milestone_id" defaultValue={defaults.milestone_id ?? ""}>
            <option value="">{t("fields.noMilestone")}</option>
            {milestones.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t("fields.dueDate")} htmlFor="due_date" error={fieldError(result, "due_date")}>
          <Input id="due_date" name="due_date" type="date" defaultValue={defaults.due_date ?? ""} />
        </Field>
      </div>
      <FormMessage result={result} />
      <div>
        <SubmitButton>{mode === "create" ? t("new") : t("edit")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}
