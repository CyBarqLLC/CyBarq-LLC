import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { loadMessages } from "./messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Asia/Amman",
    formats: {
      dateTime: {
        short: { day: "2-digit", month: "2-digit", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
      },
    },
  };
});
