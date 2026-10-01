import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/layout/Section";
import { MAIN_NAV } from "@/constants/navigation";
import Link from "next/link";

/** Frosted, sticky top bar (macOS menu-bar feel). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex min-h-18 items-center gap-6">
        <Logo />
        <nav aria-label="منوی اصلی" className="hidden gap-6 font-semibold md:flex">
          {MAIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-4 font-semibold">
          <Link href="/login">ورود</Link>
          <Button href="/register" size="sm">
            ثبت‌نام
          </Button>
        </div>
      </Container>
    </header>
  );
}
