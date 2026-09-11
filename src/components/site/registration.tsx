import Image from "next/image";
import { company } from "@/content/site/company";
import { cn } from "@/lib/utils/cn";

type RegistrationMarkProps = { alt: string; sizes: string; className?: string };

/**
 * The official registration artwork: the Ministry of Digital Economy and
 * Entrepreneurship mark beside the emblem of the Hashemite Kingdom of Jordan.
 * Shown small and calm; it states where the company is registered and nothing
 * more (no endorsement is implied).
 */
export function RegistrationMark({ alt, sizes, className }: RegistrationMarkProps) {
  return <Image src="/images/jordan-registration.png" alt={alt} width={1127} height={666} sizes={sizes} className={cn("h-auto", className)} />;
}

/** The Jordan registered name, isolated so it reads correctly inside English text. */
export function JordanLegalName({ label, className }: { label: string; className?: string }) {
  return (
    <span className={className}>
      {label}{" "}
      <bdi lang="ar" dir="rtl">
        {company.jordanLegalName}
      </bdi>
    </span>
  );
}

/** "Registration No. …" once `company.registrationNumber` is set; nothing at all until then. */
export function RegistrationNumber({ format, className }: { format: (number: string) => string; className?: string }) {
  const number = company.registrationNumber;
  if (!number) return null;
  return <p className={className}>{format(number)}</p>;
}
