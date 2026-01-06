import { ReactNode } from "react";
import Season3LayoutClient from "./Season3LayoutClient";

import { resolveLocale } from "@/lib/i18n/resolveLocale";
import { getDict } from "@/lib/i18n/dict";

export default async function Season3Layout({ children }: { children: ReactNode }) {
  const locale = await resolveLocale();
  const { social } = getDict(locale);

  return <Season3LayoutClient social={social}>{children}</Season3LayoutClient>;
}
