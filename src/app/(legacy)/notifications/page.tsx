"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import {
  getNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/api/workspace";
import type { Notification, User } from "@/types";

const typeLabel: Record<Notification["notification_type"], string> = {
  proposal_submitted: "پیشنهاد جدید",
  proposal_accepted: "پیشنهاد پذیرفته شد",
  order_status_changed: "تغییر وضعیت سفارش",
  review_created: "نظر جدید",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [currentUser, notifications] = await Promise.all([
        getCurrentUser(),
        getNotifications(),
      ]);
      setUser(currentUser);
      setItems(notifications);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        router.replace("/");
        return;
      }
      setMessage("دریافت اعلان‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function openNotification(item: Notification) {
    setWorking(true);
    setMessage("");
    try {
      if (!item.is_read) await markNotificationRead(item.id);
      setSelected(await getNotification(item.id));
      await load();
    } catch {
      setMessage("باز کردن اعلان انجام نشد.");
    } finally {
      setWorking(false);
    }
  }

  async function readAll() {
    setWorking(true);
    setMessage("");
    try {
      await markAllNotificationsRead();
      setMessage("همه‌ی اعلان‌ها خوانده شد.");
      await load();
    } catch {
      setMessage("به‌روزرسانی اعلان‌ها انجام نشد.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <main className="dashboard-state"><span className="dashboard-loader" />در حال دریافت اعلان‌ها…</main>;

  const unread = items.filter((item) => !item.is_read).length;
  const isCustomer = user?.role === "CUSTOMER";

  return <main className="feature-page">
    <header className="feature-header">
      <Link href="/dashboard" className="dashboard-brand"><span>س</span><strong>سوزن</strong></Link>
      <nav><Link href="/dashboard">میزکار</Link><Link href="/orders">سفارش‌ها و نظرها</Link>{!isCustomer && <Link href="/portfolio">نمونه‌کارها</Link>}<Link className="active" href="/notifications">اعلان‌ها</Link><Link href="/profile">پروفایل</Link></nav>
    </header>
    <section className="feature-shell notifications-shell">
      <div className="feature-title">
        <div><p>به‌روزرسانی‌های حساب</p><h1>اعلان‌های من</h1><span>{unread ? `${unread.toLocaleString("fa-IR")} اعلان خوانده‌نشده داری.` : "همه‌ی اعلان‌ها را دیده‌ای."}</span></div>
        {unread > 0 && <button disabled={working} onClick={readAll}>خواندن همه</button>}
      </div>
      {message && <p className={`dashboard-message ${message.includes("نشد") ? "error" : "success"}`}>{message}</p>}
      <section className="notifications-list">
        {items.length === 0 ? <div className="empty-state"><strong>هنوز اعلانی نداری</strong><p>رویدادهای پروژه و سفارش اینجا نمایش داده می‌شوند.</p></div> : items.map((item) =>
          <button key={item.id} disabled={working} className={`notification-card ${item.is_read ? "" : "unread"}`} onClick={() => openNotification(item)}>
            <i /><div><span>{typeLabel[item.notification_type]}</span><p>{item.message}</p><small>{formatDate(item.created_at)}</small></div><b>{item.is_read ? "مشاهده جزئیات" : "جدید"}</b>
          </button>
        )}
      </section>
    </section>
    {selected && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><div className="modal notification-modal"><button className="close-button" onClick={() => setSelected(null)}>×</button><p className="modal-kicker">{typeLabel[selected.notification_type]}</p><h2>جزئیات اعلان</h2><p className="notification-modal-message">{selected.message}</p><small>{formatDate(selected.created_at)}</small></div></div>}
  </main>;
}
