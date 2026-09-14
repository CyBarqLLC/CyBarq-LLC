import Image from "next/image";
import { company } from "@/content/site/company";
import { cn } from "@/lib/utils/cn";

type RegistrationMarkProps = { alt: string; sizes: string; className?: string };

/**
 * The official registration artwork: the National Cyber Security Center and
 * the Companies Control Department marks. It appears once, in the colophon,
 * small and on its own line, with the registration number set smaller still
 * underneath. It says where the company is registered and nothing more: no
 * endorsement is implied.
 */
export function RegistrationMark({ alt, sizes, className }: RegistrationMarkProps) {
  return <Image src="/images/registration-jordan-ncsc.png" alt={alt} width={900} height={74} sizes={sizes} className={cn("h-auto", className)} />;
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

/** "Jordanian National Establishment No. …" once `company.nationalNumber` is set; nothing at all until then. */
export function RegistrationNumber({ format, className }: { format: (number: string) => string; className?: string }) {
  const number = company.nationalNumber;
  if (!number) return null;
  return <p className={className}>{format(number)}</p>;
}
