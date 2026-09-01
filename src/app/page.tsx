"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, registerCustomer, registerTailor } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";

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
        router.push("/dashboard");
      } else {
        const payload = { username: String(data.get("username")), email: String(data.get("email")), password: String(data.get("password")) };
        if (role === "tailor") await registerTailor(payload); else await registerCustomer(payload);
        setSuccess(true); setMessage("حساب شما با موفقیت ساخته شد. اکنون می‌توانید وارد شوید."); form.reset();
      }
    } catch (error) { setMessage(getErrorMessage(error)); } finally { setPending(false); }
  }

  return <main>
    <div className="announcement">دوخت سفارشی، با خیال آسوده و انتخاب آگاهانه</div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="سوزن، صفحه اصلی"><span className="brand-mark"><SewingIcon /></span><span>سوزن</span></a>
      <div className="public-nav" aria-label="منوی سایت"><a href="#how">مسیر سفارش</a><a href="#trust">چرا سوزن؟</a><button onClick={() => { setRole("tailor"); open("register"); }}>برای خیاطان</button></div>
      <nav aria-label="دسترسی حساب کاربری">
        <button className="button button-ghost" onClick={() => open("login")}><span className="button-icon"><UserIcon /></span>ورود</button>
        <button className="button button-primary" onClick={() => open("register")}>ساخت حساب</button>
      </nav>
    </header>

    <section className="hero" id="top">
      <div className="hero-media"><Image src="/souzan-hero-pattern.png" alt="خیاط در کارگاه در حال آماده‌کردن الگوی دوخت روی پارچه سبز" fill priority sizes="(max-width: 850px) 100vw, 55vw" /></div>
      <div className="hero-copy">
        <p className="eyebrow">هنر دست، برای زندگی امروز</p>
        <h1>هنر دوخت، برای<br /><span>لباسِ شما</span></h1>
        <p className="lead">در فضایی روشن و قابل اعتماد، درخواستت را ثبت کن، پیشنهادها را ببین و خیاط مناسب را با آرامش انتخاب کن.</p>
        <div className="hero-actions">
          <button className="button button-primary button-large" onClick={() => open("register")}>ثبت درخواست دوخت</button>
          <a className="button button-secondary button-large" href="#how">آشنایی با مسیر سفارش</a>
        </div>
        <div className="hero-assurance"><span>شفافیت قیمت</span><span>خیاط‌های حرفه‌ای</span><span>پیگیری ساده</span></div>
      </div>
    </section>

    <section className="trust-band" id="trust"><article><strong>انتخاب راحت</strong><p>پیشنهادها را کنار هم مقایسه کن</p></article><article><strong>ارتباط شفاف</strong><p>جزئیات سفارش همیشه در دسترس است</p></article><article><strong>کیفیت قابل اعتماد</strong><p>تجربه‌ی واقعی همکاری را ثبت کن</p></article></section>

    <section className="journey" id="how"><p>مسیر ساده‌ی سفارش</p><h2>از یک ایده تا لباسی برای شما</h2><div><article><span>یک</span><h3>خواسته‌ات را تعریف کن</h3><p>بدون فرم پیچیده؛ فقط مدل، بودجه و زمانی که برای شروع لازم است.</p></article><article><span>دو</span><h3>با اطمینان انتخاب کن</h3><p>قیمت، زمان و پیشنهاد خیاط‌ها را در یک فضای روشن مقایسه کن.</p></article><article><span>سه</span><h3>روند کار را دنبال کن</h3><p>وضعیت سفارش را واضح و مرحله‌به‌مرحله تا تحویل ببین.</p></article></div></section>

    <section className="role-invitation"><div><p>برای خیاطان حرفه‌ای</p><h2>هنر دستت را به مشتری درست نشان بده</h2><span>نمونه‌کارت را بساز، فرصت‌های تازه را ببین و سفارش‌هایت را ساده مدیریت کن.</span></div><button className="button button-primary" onClick={() => { setRole("tailor"); open("register"); }}>پیوستن به خیاطان سوزن</button></section>
    <footer><p>سوزن؛ هنر دست، با خیال آسوده</p><span>© ۱۴۰۵ سوزن</span></footer>

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
