import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سوزن | بازار خیاط‌ها",
  description: "درخواست دوخت بنویس، پیشنهاد خیاط‌ها رو ببین و بهترین رو انتخاب کن.",
};

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
