import "server-only";
import { getTranslations } from "next-intl/server";

/**
 * Translated message for an action failure (messages/<locale>/errors.json),
 * in the language of the current request.
 */
export async function actionError(key: string, values?: Record<string, string | number>): Promise<string> {
  const t = await getTranslations("errors");
  return t(key, values);
}
