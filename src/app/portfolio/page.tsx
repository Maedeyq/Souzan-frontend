"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import { deletePortfolioImage, getPortfolio, updatePortfolioCaption, uploadPortfolioImage } from "@/services/api/workspace";
import type { PortfolioImage } from "@/types";

export default function PortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user.role !== "TAILOR") { router.replace("/dashboard"); return; }
      setItems(await getPortfolio());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { logout(); router.replace("/"); return; }
      setMessage("دریافت نمونه‌کارها ممکن نشد.");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setWorking(true); setMessage("");
    try { await action(); setMessage(success); await load(); return true; }
    catch { setMessage("عملیات انجام نشد. تصویر و اطلاعات را بررسی کنید."); return false; }
    finally { setWorking(false); }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const body = new FormData(event.currentTarget);
    const ok = await run(() => uploadPortfolioImage(body), "نمونه‌کار جدید اضافه شد.");
    if (ok) setShowUpload(false);
  }

  if (loading) return <main className="dashboard-state"><span className="dashboard-loader" />در حال دریافت گالری…</main>;
  return <main className="feature-page"><header className="feature-header"><Link href="/dashboard" className="dashboard-brand"><span>س</span><strong>سوزن</strong></Link><nav><Link href="/dashboard">میزکار</Link><Link href="/orders">سفارش‌ها و نظرها</Link><Link className="active" href="/portfolio">نمونه‌کارها</Link><Link href="/profile">پروفایل</Link></nav></header>
    <section className="feature-shell"><div className="feature-title"><div><p>ویترین حرفه‌ای تو</p><h1>نمونه‌کارهای من</h1><span>تصاویر بهترین دوخت‌هایت را اضافه کن و برای هرکدام توضیح بنویس.</span></div><button onClick={() => setShowUpload(true)}>+ افزودن نمونه‌کار</button></div>{message && <p className={`dashboard-message ${message.includes("نشد") ? "error" : "success"}`}>{message}</p>}
      <section className="portfolio-grid">{items.length === 0 ? <div className="empty-state"><strong>گالری تو هنوز خالی است</strong><p>اولین تصویر از دوخت‌هایت را اضافه کن.</p></div> : items.map((item) => <article className="portfolio-card" key={item.id}><div className="portfolio-image"><Image src={item.image} alt={item.caption || "نمونه‌کار خیاطی"} fill sizes="(max-width: 700px) 100vw, 33vw" unoptimized /></div><form onSubmit={(event) => { event.preventDefault(); const caption = String(new FormData(event.currentTarget).get("caption")); void run(() => updatePortfolioCaption(item.id, caption), "توضیح نمونه‌کار ویرایش شد."); }}><input name="caption" defaultValue={item.caption} placeholder="توضیح نمونه‌کار" /><div><button disabled={working}>ذخیره توضیح</button><button type="button" className="danger-link" onClick={() => confirm("این نمونه‌کار حذف شود؟") && run(() => deletePortfolioImage(item.id), "نمونه‌کار حذف شد.")}>حذف</button></div></form></article>)}</section>
    </section>{showUpload && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowUpload(false)}><div className="modal dashboard-modal"><button className="close-button" onClick={() => setShowUpload(false)}>×</button><p className="modal-kicker">نمونه‌کار تازه</p><h2>تصویر دوختت را اضافه کن</h2><form onSubmit={upload}><label>انتخاب تصویر<input name="image" type="file" accept="image/*" required /></label><label>توضیح<input name="caption" placeholder="مثلاً کت زنانه با دوخت دست" /></label><button className="button button-primary" disabled={working}>{working ? "در حال بارگذاری…" : "افزودن به گالری"}</button></form></div></div>}</main>;
}
