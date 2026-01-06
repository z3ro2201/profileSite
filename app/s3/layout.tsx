import { ReactNode } from "react";
import Season3LayoutClient from "./Season3LayoutClient";

import { resolveLocale } from "@/lib/resolveLocale";
import { getDict } from "@/lib/dict";

export default async function Season3Layout({ children }: { children: ReactNode }) {
  const locale = await resolveLocale();
  const { social } = getDict(locale);

  return <Season3LayoutClient social={social}>{children}</Season3LayoutClient>;
}
