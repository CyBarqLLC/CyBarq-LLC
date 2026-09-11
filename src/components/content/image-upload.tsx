"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { requestAvatarUpload, requestCoverUpload } from "@/lib/actions/content";
import type { CoverKind } from "@/lib/validation/content";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";

type ImageUploadProps = {
  /** Cover kind decides the storage folder; "avatar" targets authors/. */
  target: CoverKind | "avatar";
  /** Form field that receives the stored path. */
  name: string;
  defaultPath?: string | null;
  /** Public bucket base URL (ends with a slash), computed on the server. */
  publicBase: string;
  alt?: string;
};

/**
 * Image picker for the public-content bucket. The file goes straight to storage
 * through a signed ticket; the path is submitted with the surrounding form and
 * only persisted when the editor saves.
 */
export function ImageUpload({ target, name, defaultPath, publicBase, alt }: ImageUploadProps) {
  const [path, setPath] = React.useState<string>(defaultPath ?? "");
  const t = useTranslations("content.images");
  const tu = useTranslations("common.upload");

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={path} />
      {path ? (
        <div className="flex items-start gap-3 border border-fog bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${publicBase}${path}`} alt={alt ?? ""} className={target === "avatar" ? "size-16 object-cover" : "h-24 w-40 object-cover"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-small text-slate" dir="ltr">{path}</p>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setPath("")}>
              <X aria-hidden /> {t("remove")}
            </Button>
          </div>
        </div>
      ) : null}
      <FileUpload
        requestTicket={(file) => (target === "avatar" ? requestAvatarUpload(file) : requestCoverUpload(target, file))}
        onUploaded={async (r) => {
          setPath(r.path);
          return { ok: true };
        }}
        accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
        maxSizeMb={10}
        labels={{ choose: tu("choose"), drop: tu("drop"), uploading: tu("uploading"), done: tu("done"), tooLarge: tu("tooLarge"), remove: tu("remove") }}
      />
      <p className="text-small text-slate">{t("hint")}</p>
    </div>
  );
}
