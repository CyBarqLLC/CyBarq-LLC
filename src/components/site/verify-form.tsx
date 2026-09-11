import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Normalises a typed code: trims, keeps letters, digits and hyphens, caps the length. */
export function normaliseCode(value: string): string {
  return value.trim().replace(/[^A-Za-z0-9-]/g, "").slice(0, 64);
}

type VerifyFormProps = {
  action: string;
  label: string;
  hint: string;
  submit: string;
  defaultValue?: string;
};

/**
 * Plain GET form. Submits to /[locale]/verify?code=... which redirects to
 * /[locale]/verify/[code]. Works without JavaScript. Codes are Latin letters,
 * digits and hyphens, so the field is always left to right.
 */
export function VerifyForm({ action, label, hint, submit, defaultValue }: VerifyFormProps) {
  return (
    <form action={action} method="get" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{label}</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            dir="ltr"
            required
            minLength={4}
            maxLength={64}
            pattern="[A-Za-z0-9\-]+"
            defaultValue={defaultValue}
            aria-describedby="code-hint"
            className="font-mono tracking-wide sm:max-w-sm"
          />
          <Button type="submit" size="md" className="sm:shrink-0">{submit}</Button>
        </div>
        <p id="code-hint" className="text-small text-slate">{hint}</p>
      </div>
    </form>
  );
}
