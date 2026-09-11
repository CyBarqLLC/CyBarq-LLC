"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toaster";
import { ActionButton } from "@/components/platform/action-button";
import { requestAvatarUpload, saveAvatar, removeAvatar } from "@/lib/actions/settings";

export function AvatarUploader({ name, currentUrl }: { name: string; currentUrl: string | null }) {
  const t = useTranslations("platform.settings.avatar");
  const tu = useTranslations("common.upload");
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="flex flex-col items-start gap-3">
        <Avatar name={name} src={currentUrl} size="lg" />
        {currentUrl ? (
          <ActionButton action={removeAvatar} variant="ghost" size="sm" successMessage={t("removed")}>
            {t("remove")}
          </ActionButton>
        ) : null}
      </div>
      <FileUpload
        className="flex-1"
        accept="image/png,image/jpeg,image/webp"
        maxSizeMb={2}
        labels={{ choose: tu("choose"), drop: tu("drop"), uploading: tu("uploading"), done: tu("done"), tooLarge: tu("tooLarge"), remove: tu("remove") }}
        requestTicket={async (file) => {
          const result = await requestAvatarUpload(file);
          return result.ok ? { ok: true, data: result.data } : { ok: false, error: result.error };
        }}
        onUploaded={async (file) => {
          const result = await saveAvatar({ path: file.path });
          if (!result.ok) return { ok: false, error: result.error };
          toast.success(t("saved"));
          router.refresh();
          return { ok: true };
        }}
      />
    </div>
  );
}
