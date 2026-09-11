"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import { addTaskComment, updateTaskComment } from "@/lib/actions/tasks";
import type { ActionResult } from "@/lib/actions/result";
import { ServerActionForm } from "@/components/ui/server-action-form";

type CommentFormProps = { projectId: string; taskId: string };

/** New comment. The list refreshes from the server after posting. */
export function CommentForm({ projectId, taskId }: CommentFormProps) {
  const [result, formAction] = useActionState(addTaskComment.bind(null, projectId, taskId), null);
  const t = useTranslations("projects.tasks.comments");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("posted"));
      setFormKey((k) => k + 1);
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <ServerActionForm key={formKey} action={formAction} result={result} className="flex flex-col gap-3" noValidate>
      <label htmlFor="comment-body" className="text-label text-graphite">{t("add")}</label>
      <Textarea id="comment-body" name="body" placeholder={t("placeholder")} required maxLength={5000} className="min-h-24" aria-invalid={!!fieldError(result, "body")} />
      {fieldError(result, "body") ? <p role="alert" className="text-small text-danger">{fieldError(result, "body")}</p> : null}
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("post")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}

type EditableCommentProps = {
  projectId: string;
  taskId: string;
  commentId: string;
  body: string;
  /** Rendered by the server: author, timestamps. */
  header: React.ReactNode;
  /** Rendered by the server when deletion is allowed. */
  deleteControl?: React.ReactNode;
  canEdit: boolean;
};

/** Comment with an inline edit form for the author. */
export function EditableComment({ projectId, taskId, commentId, body, header, deleteControl, canEdit }: EditableCommentProps) {
  const [editing, setEditing] = useState(false);
  const [result, formAction] = useActionState(updateTaskComment.bind(null, projectId, taskId, commentId), null);
  const t = useTranslations("projects.tasks.comments");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("saved"));
      setEditing(false);
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <li className="border border-fog bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">{header}</div>
        {canEdit || deleteControl ? (
          <div className="flex shrink-0 gap-1">
            {canEdit && !editing ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>{t("edit")}</Button>
            ) : null}
            {deleteControl}
          </div>
        ) : null}
      </div>
      {editing ? (
        <ServerActionForm action={formAction} result={result} className="mt-3 flex flex-col gap-3" noValidate>
          <Textarea name="body" defaultValue={body} required maxLength={5000} className="min-h-24" aria-label={t("edit")} />
          <FormMessage result={result} />
          <div className="flex gap-2">
            <SubmitButton size="sm">{t("save")}</SubmitButton>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>{t("cancel")}</Button>
          </div>
        </ServerActionForm>
      ) : (
        <p className="mt-2 whitespace-pre-line text-body">{body}</p>
      )}
    </li>
  );
}
