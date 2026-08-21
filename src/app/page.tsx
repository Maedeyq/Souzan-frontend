"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login, registerCustomer, registerTailor } from "@/lib/auth";
import { ApiError } from "@/lib/api";

type View = "home" | "login" | "register";
type Role = "customer" | "tailor";

const translations: Record<string, string> = {
  "A user with this username already exists.": "این نام کاربری قبلاً استفاده شده است.",
  "A user with this email already exists.": "این ایمیل قبلاً استفاده شده است.",
  "Enter a valid email address.": "لطفاً یک ایمیل معتبر وارد کنید.",
  "This field may not be blank.": "تکمیل این فیلد الزامی است.",
  "This field is required.": "تکمیل این فیلد الزامی است.",
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "ارتباط با سرور برقرار نشد. لطفاً از روشن بودن سرور مطمئن شوید.";
  if (error.status === 401) return "نام کاربری یا رمز عبور درست نیست.";
  if (error.data && typeof error.data === "object") {
    const first = Object.values(error.data as Record<string, unknown>).flat().find((value) => typeof value === "string");
    if (typeof first === "string") return translations[first] ?? first;
  }
  return "در انجام عملیات مشکلی پیش آمد. لطفاً دوباره تلاش کنید.";
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" /></svg>;
}

function SewingIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 37 37 10M16 31l8 8M30 16l3 3M35 13l2-2a4 4 0 0 1 6 6l-2 2M9 39l-4 4 7-1 3-3" /><circle cx="11" cy="16" r="5" /><circle cx="20" cy="9" r="5" /><path d="m14 20 7 7M23 13l5 5" /></svg>;
}

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [role, setRole] = useState<Role>("customer");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (view !== "home") dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus(); }, [view]);
  function open(next: Exclude<View, "home">) { setView(next); setMessage(""); setSuccess(false); }
  function close() { if (!pending) setView("home"); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(""); setSuccess(false);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      if (view === "login") {
        await login(String(data.get("username")), String(data.get("password")));
        router.push("/profile");
      } else {
        const payload = { username: String(data.get("username")), email: String(data.get("email")), password: String(data.get("password")) };
        if (role === "tailor") await registerTailor(payload); else await registerCustomer(payload);
        setSuccess(true); setMessage("حساب شما با موفقیت ساخته شد. اکنون می‌توانید وارد شوید."); form.reset();
      }
    } catch (error) { setMessage(getErrorMessage(error)); } finally { setPending(false); }
  }

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="سوزن، صفحه اصلی"><span className="brand-mark"><SewingIcon /></span><span>سوزن</span></a>
      <nav aria-label="دسترسی حساب کاربری">
        <button className="button button-ghost" onClick={() => open("login")}><span className="button-icon"><UserIcon /></span>ورود</button>
        <button className="button button-primary" onClick={() => open("register")}>ثبت‌نام</button>
      </nav>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">ساده، روشن و در دسترس</p>
        <h1>همراه مطمئن شما<br />در دنیای <span>خیاطی</span></h1>
        <p className="lead">سوزن، راهی ساده برای ارتباط مشتریان و خیاطان است. حساب خود را بسازید و مسیرتان را آغاز کنید.</p>
        <div className="hero-actions">
          <button className="button button-primary button-large" onClick={() => open("register")}>ساخت حساب رایگان</button>
          <button className="button button-secondary button-large" onClick={() => open("login")}>قبلاً ثبت‌نام کرده‌ام</button>
        </div>
        <p className="helper">ثبت‌نام در کمتر از یک دقیقه</p>
      </div>
      <div className="role-panel" aria-label="انواع حساب در سوزن">
        <article className="role-card"><div className="role-icon customer"><UserIcon /></div><div><h2>برای مشتریان</h2><p>حساب مشتری بسازید و اطلاعات خود را برای خدمات آینده آماده کنید.</p></div></article>
        <article className="role-card featured"><div className="role-icon tailor"><SewingIcon /></div><div><h2>برای خیاطان</h2><p>به‌عنوان خیاط ثبت‌نام کنید و پروفایل حرفه‌ای خود را تکمیل کنید.</p></div></article>
        <div className="trust-note"><span aria-hidden="true">✓</span><p><strong>امن و قابل اعتماد</strong><br />اطلاعات حساب شما با خیال آسوده نگهداری می‌شود.</p></div>
      </div>
    </section>
    <footer><p>سوزن؛ پیوندی ساده میان خیاط و مشتری</p></footer>

    {view !== "home" && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={dialogRef}>
        <button className="close-button" type="button" onClick={close} aria-label="بستن">×</button>
        <p className="modal-kicker">حساب کاربری سوزن</p>
        <h2 id="dialog-title">{view === "login" ? "ورود به حساب" : "ساخت حساب جدید"}</h2>
        <p className="modal-description">{view === "login" ? "نام کاربری و رمز عبور خود را وارد کنید." : "ابتدا نوع حساب خود را انتخاب کنید."}</p>
        {view === "register" && <div className="role-switch" aria-label="انتخاب نوع حساب">
          <button type="button" className={role === "customer" ? "active" : ""} onClick={() => setRole("customer")}>مشتری هستم</button>
          <button type="button" className={role === "tailor" ? "active" : ""} onClick={() => setRole("tailor")}>خیاط هستم</button>
        </div>}
        <form onSubmit={submit}>
          <label>نام کاربری<input name="username" autoComplete="username" required placeholder="مثلاً souzan123" /></label>
          {view === "register" && <label>ایمیل<input name="email" type="email" autoComplete="email" required placeholder="name@example.com" dir="ltr" /></label>}
          <label>رمز عبور<input name="password" type="password" autoComplete={view === "login" ? "current-password" : "new-password"} minLength={view === "register" ? 8 : undefined} required placeholder={view === "register" ? "حداقل ۸ نویسه" : "رمز عبور شما"} /></label>
          {message && <p className={`form-message ${success ? "success" : "error"}`} role="status">{message}</p>}
          <button className="button button-primary submit-button" disabled={pending}>{pending ? "لطفاً صبر کنید…" : view === "login" ? "ورود به سوزن" : `ثبت‌نام به‌عنوان ${role === "tailor" ? "خیاط" : "مشتری"}`}</button>
        </form>
        <button className="text-button" type="button" onClick={() => open(view === "login" ? "register" : "login")}>{view === "login" ? "حساب ندارید؟ ثبت‌نام کنید" : "قبلاً حساب ساخته‌اید؟ وارد شوید"}</button>
      </div>
    </div>}
  </main>;
}
