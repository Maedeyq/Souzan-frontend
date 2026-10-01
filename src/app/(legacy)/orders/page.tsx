"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import { createReview, deleteReview, getReviews, getWorkspaceData, updateOrderStatus, updateReview } from "@/services/api/workspace";
import type { Order, OrderStatus, Review, User } from "@/types";

const labels: Record<OrderStatus, string> = { pending: "در انتظار", confirmed: "تأییدشده", in_progress: "در حال انجام", completed: "تکمیل‌شده", cancelled: "لغوشده" };
const options = Object.entries(labels) as [OrderStatus, string][];
const money = (value: string) => `${Number(value).toLocaleString("fa-IR")} تومان`;

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [currentUser, workspace, reviewList] = await Promise.all([getCurrentUser(), getWorkspaceData(), getReviews()]);
      setUser(currentUser); setOrders(workspace.orders); setReviews(reviewList);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { logout(); router.replace("/"); return; }
      setMessage("دریافت سفارش‌ها ممکن نشد.");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setWorking(true); setMessage("");
    try { await action(); setMessage(success); await load(); return true; }
    catch { setMessage("عملیات انجام نشد. دوباره تلاش کنید."); return false; }
    finally { setWorking(false); }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const rating = Number(data.get("rating")); const comment = String(data.get("comment") ?? "");
    const ok = editingReview
      ? await run(() => updateReview(editingReview.id, { rating, comment }), "نظر شما ویرایش شد.")
      : reviewOrder ? await run(() => createReview({ order: reviewOrder.id, rating, comment }), "نظر شما ثبت شد.") : false;
    if (ok) { setReviewOrder(null); setEditingReview(null); }
  }

  if (loading) return <main className="dashboard-state"><span className="dashboard-loader" />در حال دریافت سفارش‌ها…</main>;
  const isCustomer = user?.role === "CUSTOMER";

  return <main className="feature-page">
    <header className="feature-header"><Link href="/dashboard" className="dashboard-brand"><span>س</span><strong>سوزن</strong></Link><nav><Link href="/dashboard">میزکار</Link><Link className="active" href="/orders">سفارش‌ها و نظرها</Link>{!isCustomer && <Link href="/portfolio">نمونه‌کارها</Link>}<Link href="/profile">پروفایل</Link></nav></header>
    <section className="feature-shell"><div className="feature-title"><div><p>مدیریت روند همکاری</p><h1>سفارش‌ها و نظرهای من</h1><span>وضعیت سفارش را تغییر بده و پس از پایان همکاری، تجربه‌ات را ثبت کن.</span></div><Link href="/dashboard">بازگشت به میزکار</Link></div>
      {message && <p className={`dashboard-message ${message.includes("نشد") ? "error" : "success"}`}>{message}</p>}
      <section className="order-grid">{orders.length === 0 ? <div className="empty-state"><strong>هنوز سفارشی وجود ندارد</strong><p>سفارش بعد از پذیرفتن پیشنهاد ساخته می‌شود.</p></div> : orders.map((order) => {
        const review = reviews.find((item) => item.order === order.id);
        return <article className="order-card" key={order.id}><div className="order-card-top"><span className={`status status-${order.status}`}>{labels[order.status]}</span><small>سفارش #{order.id.toLocaleString("fa-IR")}</small></div><h2>{isCustomer ? `همکاری با ${order.tailor_username}` : `سفارش ${order.customer_username}`}</h2><div className="order-facts"><span><small>مبلغ سفارش</small><strong>{money(order.total_price)}</strong></span><span><small>شماره پروژه</small><strong>#{order.project.toLocaleString("fa-IR")}</strong></span></div><label className="status-control">تغییر وضعیت<select value={order.status} disabled={working} onChange={(event) => run(() => updateOrderStatus(order.id, event.target.value as OrderStatus), "وضعیت سفارش به‌روز شد.")}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {order.status === "completed" && (review ? <div className="review-summary"><span>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><p>{review.comment || "بدون توضیح"}</p><div><button onClick={() => setEditingReview(review)}>ویرایش نظر</button><button className="danger-link" onClick={() => confirm("این نظر حذف شود؟") && run(() => deleteReview(review.id), "نظر حذف شد.")}>حذف</button></div></div> : <button className="review-button" onClick={() => setReviewOrder(order)}>ثبت نظر برای این همکاری</button>)}
        </article>;
      })}</section>
    </section>
    {(reviewOrder || editingReview) && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && (setReviewOrder(null), setEditingReview(null))}><div className="modal dashboard-modal"><button className="close-button" onClick={() => { setReviewOrder(null); setEditingReview(null); }}>×</button><p className="modal-kicker">بازخورد همکاری</p><h2>{editingReview ? "ویرایش نظر" : "تجربه‌ات چطور بود؟"}</h2><form onSubmit={submitReview}><label>امتیاز<select name="rating" defaultValue={editingReview?.rating ?? 5} required>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value.toLocaleString("fa-IR")} ستاره</option>)}</select></label><label>توضیحات<textarea name="comment" defaultValue={editingReview?.comment ?? ""} placeholder="از کیفیت کار و تجربه همکاری بنویس…" /></label><button className="button button-primary" disabled={working}>{working ? "در حال ذخیره…" : "ذخیره نظر"}</button></form></div></div>}
  </main>;
}
