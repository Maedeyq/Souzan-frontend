import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";
import { AuthForm } from "@/features/auth/AuthForm";

export const metadata: Metadata = { title: "ثبت‌نام | سوزن" };

type RegisterPageProps = { searchParams: Promise<{ role?: string }> };

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { role } = await searchParams;
  return (
    <PageShell>
      <Section tone="canvas">
        <div className="mx-auto grid max-w-md gap-6">
          <h1 className="text-3xl">ساخت حساب جدید</h1>
          <AuthForm mode="register" defaultRole={role === "tailor" ? "tailor" : "customer"} />
        </div>
      </Section>
    </PageShell>
  );
}
