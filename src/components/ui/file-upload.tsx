"use client";

import * as React from "react";
import { Upload, FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export type UploadTicket = { signedUrl: string; token: string; path: string };

type FileUploadProps = {
  /** Server action that authorises the upload and returns a signed upload target. */
  requestTicket: (file: { name: string; size: number; type: string }) => Promise<{ ok: true; data: UploadTicket } | { ok: false; error: string }>;
  /** Called after the bytes are stored so the caller can create the metadata record. */
  onUploaded: (result: { path: string; name: string; size: number; type: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  accept?: string;
  maxSizeMb?: number;
  labels: { choose: string; drop: string; uploading: string; done: string; tooLarge: string; remove: string };
  className?: string;
};

/**
 * Upload through short lived signed URLs: the browser never holds storage
 * credentials and the server decides where each file may go.
 */
export function FileUpload({ requestTicket, onUploaded, accept, maxSizeMb = 25, labels, className }: FileUploadProps) {
  const tErrors = useTranslations("errors");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [state, setState] = React.useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const pick = (f: File | undefined) => {
    setError(null);
    setState("idle");
    if (!f) return;
    if (f.size > maxSizeMb * 1024 * 1024) {
      setError(labels.tooLarge);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setState("uploading");
    setError(null);
    const ticket = await requestTicket({ name: file.name, size: file.size, type: file.type });
    if (!ticket.ok) {
      setState("error");
      setError(ticket.error);
      return;
    }
    // PUT to the signed URL; Supabase expects the token as a header.
    const res = await fetch(ticket.data.signedUrl, {
      method: "PUT",
      headers: { "content-type": file.type || "application/octet-stream", "x-upsert": "false" },
      body: file,
    });
    if (!res.ok) {
      setState("error");
      setError(tErrors("uploadFailed"));
      return;
    }
    const saved = await onUploaded({ path: ticket.data.path, name: file.name, size: file.size, type: file.type });
    if (!saved.ok) {
      setState("error");
      setError(saved.error);
      return;
    }
    setState("done");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 border border-fog bg-white p-6 text-center text-small text-slate transition-colors hover:border-grey",
          dragging && "border-blue bg-ice",
        )}
      >
        <Upload className="size-5" aria-hidden />
        <span>{labels.drop}</span>
        <span className="underline text-graphite">{labels.choose}</span>
        <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {file ? (
        <div className="flex items-center gap-3 border border-fog px-3 py-2 text-small">
          <FileText className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <span className="text-slate">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          <button type="button" className="touch -m-2 flex items-center justify-center" onClick={() => pick(undefined)} aria-label={labels.remove}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
      {error ? <p role="alert" className="text-small text-danger">{error}</p> : null}
      {state === "done" ? <p role="status" className="text-small text-success">{labels.done}</p> : null}
      <div>
        <Button type="button" onClick={upload} disabled={!file || state === "uploading"} loading={state === "uploading"} size="sm">
          {state === "uploading" ? labels.uploading : labels.choose}
        </Button>
      </div>
    </div>
  );
}
