import { notFound } from "next/navigation";

/** Catch all for unknown localized paths so the localized not-found page renders. */
export default function CatchAll() {
  notFound();
}
