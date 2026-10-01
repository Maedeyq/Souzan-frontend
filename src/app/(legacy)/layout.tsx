import type { Metadata } from "next";
import "./legacy.css";
import "./dashboard.css";

/**
 * LEGACY root layout (old green theme). Pages in this route group have not been migrated
 * to the new design system yet. A separate root layout means navigating to/from the new
 * pages does a full reload, so legacy global CSS can never leak into the new design.
 * When the last page leaves this group, delete the group, `legacy.css` and `components/legacy`.
 */
export const metadata: Metadata = {
  title: "سوزن | همراه خیاط و مشتری",
  description: "سوزن، راهی ساده برای ارتباط مشتریان و خیاطان",
};

export default function LegacyRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
