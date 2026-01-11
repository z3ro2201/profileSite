import { ReactNode } from "react";
import Season3LayoutClient from "@/layout/Season3LayoutClient";
import { DEFAULT_LOCALE } from "@/lib/i18n/i18n";
import { getDict } from "@/lib/i18n/dict";

export default function Season3Layout({ children }: { children: ReactNode }) {
  const { social } = getDict(DEFAULT_LOCALE);

  return <Season3LayoutClient social={social}>{children}</Season3LayoutClient>;
}
