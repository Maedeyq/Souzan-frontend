import type { Metadata } from "next";
import "./globals.css";
import "./profile.css";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "سوزن | همراه خیاط و مشتری",
  description: "سوزن، راهی ساده برای ارتباط مشتریان و خیاطان",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
