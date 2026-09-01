"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout, logoutFromServer } from "@/services/api/auth";
import { apiFetch, ApiError } from "@/services/api/client";
import type { CustomerProfile, TailorProfile, User } from "@/types";

type Profile = CustomerProfile | TailorProfile;

function isCustomer(profile: Profile): profile is CustomerProfile {
  return "phone_number" in profile;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const currentUser = await getCurrentUser();
        const endpoint = currentUser.role === "TAILOR" ? "/tailors/me/" : "/customers/me/";
        setUser(currentUser);
        setProfile(await apiFetch<Profile>(endpoint));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          router.replace("/");
          return;
        }
        setMessage("دریافت اطلاعات پروفایل ممکن نشد. اتصال سرور را بررسی کنید.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const body = user.role === "TAILOR"
      ? { specialty: String(data.get("specialty") ?? ""), starting_price: String(data.get("starting_price") ?? "") || null, work_location: String(data.get("work_location") ?? ""), working_hours: String(data.get("working_hours") ?? "") }
      : { phone_number: String(data.get("phone_number") ?? ""), address: String(data.get("address") ?? "") };
    try {
      const endpoint = user.role === "TAILOR" ? "/tailors/me/" : "/customers/me/";
      setProfile(await apiFetch<Profile>(endpoint, { method: "PATCH", body: JSON.stringify(body) }));
      setMessage("تغییرات پروفایل با موفقیت ذخیره شد.");
    } catch {
      setMessage("ذخیره تغییرات انجام نشد. اطلاعات واردشده را بررسی کنید.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() { await logoutFromServer(); router.replace("/"); }

  if (loading) return <main className="profile-state">در حال دریافت پروفایل…</main>;
  if (!user || !profile) return <main className="profile-state"><p>{message}</p><button className="button button-primary" onClick={() => router.push("/")}>بازگشت</button></main>;

  const tailor = !isCustomer(profile) ? profile : null;
  const customer = isCustomer(profile) ? profile : null;

  return <main className="profile-page">
    <header className="profile-header">
      <Link className="brand" href="/dashboard"><span className="brand-mark">س</span><span>سوزن</span></Link>
      <div className="profile-header-actions"><Link className="button button-secondary" href="/dashboard">میزکار</Link><button className="button button-ghost" onClick={signOut}>خروج از حساب</button></div>
    </header>
    <section className="profile-shell">
      <aside className="profile-summary">
        <div className="profile-avatar">{user.username.slice(0, 1).toUpperCase()}</div>
        <span className="profile-role">{user.role === "TAILOR" ? "حساب خیاط" : "حساب مشتری"}</span>
        <h1>{user.username}</h1><p>{user.email || "ایمیلی ثبت نشده است"}</p>
        <div className="profile-note">اطلاعات این صفحه فقط برای حساب شما نمایش داده می‌شود.</div>
      </aside>
      <section className="profile-card">
        <div className="profile-title"><div><p>پروفایل من</p><h2>اطلاعات حساب</h2></div><span>قابل ویرایش</span></div>
        <form className="profile-form" onSubmit={save}>
          <div className="profile-grid">
            <label>نام کاربری<input value={user.username} disabled /></label>
            <label>ایمیل<input value={user.email} disabled /></label>
            {customer && <>
              <label>شماره تماس<input name="phone_number" defaultValue={customer.phone_number} placeholder="مثلاً 09123456789" /></label>
              <label className="full-field">آدرس<input name="address" defaultValue={customer.address} placeholder="شهر و نشانی خود را وارد کنید" /></label>
            </>}
            {tailor && <>
              <label>تخصص<input name="specialty" defaultValue={tailor.specialty} placeholder="مثلاً لباس مجلسی" /></label>
              <label>قیمت شروع خدمات<input name="starting_price" type="number" min="0" defaultValue={tailor.starting_price ?? ""} placeholder="تومان" /></label>
              <label>محل فعالیت<input name="work_location" defaultValue={tailor.work_location} placeholder="مثلاً تهران، سعادت‌آباد" /></label>
              <label>ساعات کاری<input name="working_hours" defaultValue={tailor.working_hours} placeholder="مثلاً شنبه تا پنج‌شنبه، ۹ تا ۱۸" /></label>
            </>}
          </div>
          {message && <p className={`form-message ${message.includes("موفقیت") ? "success" : "error"}`}>{message}</p>}
          <button className="button button-primary profile-save" disabled={saving}>{saving ? "در حال ذخیره…" : "ذخیره تغییرات"}</button>
        </form>
      </section>
    </section>
  </main>;
}
