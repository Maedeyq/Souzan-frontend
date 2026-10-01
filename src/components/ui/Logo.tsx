import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="سوزن، صفحه‌ی اصلی" className="flex items-center gap-2.5 text-3xl font-extrabold text-brand">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path d="M27 4 9 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="26" cy="6" rx="1.8" ry="4" transform="rotate(34 26 6)" stroke="currentColor" strokeWidth="2" />
        <path d="M10 28c-6 2-8-4-3-6s7 4 12 1" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      سوزن
    </Link>
  );
}
