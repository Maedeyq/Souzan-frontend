import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";
import { AuthForm } from "@/features/auth/AuthForm";

export const metadata: Metadata = { title: "ورود | سوزن" };

export default function LoginPage() {
  return (
    <PageShell>
      <Section tone="canvas">
        <div className="mx-auto grid max-w-md gap-6">
          <h1 className="text-3xl">ورود به حساب</h1>
          <AuthForm mode="login" />
        </div>
      </Section>
    </PageShell>
  );
}
