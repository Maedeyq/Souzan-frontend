import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

type PageShellProps = {
  children: ReactNode;
  headerMode?: "public" | "account";
};

export function PageShell({
  children,
  headerMode = "public",
}: PageShellProps) {
  return (
    <>
      <SiteHeader mode={headerMode} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}