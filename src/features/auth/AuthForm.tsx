"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { login, registerCustomer, registerTailor } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";

export type AuthMode = "login" | "register";
export type AccountRole = "customer" | "tailor";

const SERVER_MESSAGES: Record<string, string> = {
  "A user with this username already exists.": "این نام کاربری قبلاً استفاده شده.",
  "A user with this email already exists.": "این ایمیل قبلاً استفاده شده.",
  "Enter a valid email address.": "ایمیل رو درست وارد کن.",
  "This field may not be blank.": "این بخش رو پر کن.",
  "This field is required.": "این بخش رو پر کن.",
};

function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "به سرور وصل نشدیم. چند لحظه بعد دوباره امتحان کن.";
  if (error.status === 401) return "نام کاربری یا رمز عبور درست نیست.";
  if (error.data && typeof error.data === "object") {
    const first = Object.values(error.data as Record<string, unknown>)
      .flat()
      .find((value) => typeof value === "string");
    if (typeof first === "string") return SERVER_MESSAGES[first] ?? first;
  }
  return "مشکلی پیش اومد. دوباره امتحان کن.";
}

const ROLE_LABEL: Record<AccountRole, string> = { customer: "مشتری", tailor: "خیاط" };

type AuthFormProps = { mode: AuthMode; defaultRole?: AccountRole };

export function AuthForm({ mode, defaultRole = "customer" }: AuthFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>(defaultRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const username = String(data.get("username"));
    const password = String(data.get("password"));

    try {
      if (mode === "login") {
        await login(username, password);
        router.push("/dashboard");
      } else {
        const payload = { username, email: String(data.get("email")), password };
        if (role === "tailor") await registerTailor(payload);
        else await registerCustomer(payload);
        setRegistered(true);
        form.reset();
      }
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  if (registered) {
    return (
      <Card className="grid gap-4">
        <p role="status" className="rounded-control bg-highlight-soft p-4 font-bold text-brand">
          حساب {ROLE_LABEL[role]} ساخته شد. حالا می‌تونی وارد بشی.
        </p>
        <Button href="/login" variant="accent">
          ورود به سوزن
        </Button>
      </Card>
    );
  }

  return (
    <Card className="grid gap-5">
      {mode === "register" ? (
        <div role="group" aria-label="نوع حساب" className="grid grid-cols-2 gap-1 rounded-control bg-canvas p-1">
          {(["customer", "tailor"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={role === value}
              onClick={() => setRole(value)}
              className={cn(
                "min-h-12 rounded-control font-bold",
                role === value ? "bg-surface text-brand shadow-card" : "text-muted",
              )}
            >
              {ROLE_LABEL[value]} هستم
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-5">
        <TextField label="نام کاربری" name="username" autoComplete="username" required dir="ltr" className="text-start" />
        {mode === "register" ? (
          <TextField label="ایمیل" name="email" type="email" autoComplete="email" required dir="ltr" className="text-start" />
        ) : null}
        <TextField
          label="رمز عبور"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "register" ? 8 : undefined}
          hint={mode === "register" ? "حداقل ۸ نویسه" : undefined}
          required
          dir="ltr"
          className="text-start"
        />
        {error ? (
          <p role="alert" className="rounded-control border-2 border-accent p-3 font-bold text-accent">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "کمی صبر کن…" : mode === "login" ? "ورود به سوزن" : "ساخت حساب " + ROLE_LABEL[role]}
        </Button>
      </form>

      <p className="text-center text-base text-muted">
        {mode === "login" ? "حساب نداری؟ " : "قبلاً حساب ساختی؟ "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-bold text-brand underline underline-offset-4">
          {mode === "login" ? "ثبت‌نام کن" : "وارد شو"}
        </Link>
      </p>
    </Card>
  );
}
