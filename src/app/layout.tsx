import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Souzan",
  description: "Marketplace connecting customers with tailors",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
