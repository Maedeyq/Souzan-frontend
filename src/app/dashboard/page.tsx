"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, logoutFromServer } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import { acceptProposal, createOrder, createProject, createProposal, deleteProject, getWorkspaceData, markAllNotificationsRead, markNotificationRead, updateProject } from "@/services/api/workspace";
import type { Notification, Order, ProjectRequest, Proposal, User } from "@/types";

const statusLabel: Record<string, string> = { pending: "در انتظار", accepted: "پذیرفته‌شده", confirmed: "تأییدشده", in_progress: "در حال انجام", completed: "تکمیل‌شده", cancelled: "لغوشده", rejected: "ردشده", withdrawn: "پس‌گرفته‌شده" };
const money = (value: string | null) => value ? `${Number(value).toLocaleString("fa-IR")} تومان` : "توافقی";
const date = (value: string) => new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" }).format(new Date(value));

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [projectModal, setProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRequest | null>(null);
  const [proposalProject, setProposalProject] = useState<ProjectRequest | null>(null);

  const load = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const data = await getWorkspaceData();
      setUser(currentUser); setProjects(data.projects); setProposals(data.proposals); setOrders(data.orders); setNotifications(data.notifications);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { logout(); router.replace("/"); return; }
      setMessage("دریافت اطلاعات انجام نشد. اتصال بک‌اند را بررسی کنید.");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    // Loading is asynchronous; state updates happen only after the API responds.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const isCustomer = user?.role === "CUSTOMER";
  const unread = notifications.filter((item) => !item.is_read).length;
  const activeOrders = orders.filter((item) => !["completed", "cancelled"].includes(item.status)).length;
  const proposedProjectIds = useMemo(() => new Set(proposals.map((item) => item.project)), [proposals]);

  async function run(action: () => Promise<unknown>, success: string) {
    setWorking(true); setMessage("");
    try { await action(); setMessage(success); await load(); return true; }
    catch { setMessage("عملیات انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید."); return false; }
    finally { setWorking(false); }
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const body = { title: data.get("title"), description: data.get("description"), garment_type: data.get("garment_type"), fabric: data.get("fabric"), quantity: Number(data.get("quantity")), budget: data.get("budget") || null, deadline: data.get("deadline") || null };
    const ok = editingProject
      ? await run(() => updateProject(editingProject.id, body), "درخواست شما ویرایش شد.")
      : await run(() => createProject(body), "درخواست شما ثبت شد و حالا برای خیاطان نمایش داده می‌شود.");
    if (ok) { setProjectModal(false); setEditingProject(null); }
  }

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!proposalProject) return; const data = new FormData(event.currentTarget);
    const ok = await run(() => createProposal({ project: proposalProject.id, price: data.get("price"), estimated_days: Number(data.get("estimated_days")), description: data.get("description") }), "پیشنهاد شما برای مشتری ارسال شد.");
    if (ok) setProposalProject(null);
  }

  if (loading) return <main className="dashboard-state"><span className="dashboard-loader" />در حال آماده‌کردن میزکار شما…</main>;
  if (!user) return <main className="dashboard-state">ورود به حساب انجام نشد.</main>;

  return <main className="dashboard-page">
    <aside className="dashboard-sidebar">
      <Link href="/dashboard" className="dashboard-brand"><span>س</span><strong>سوزن</strong></Link>
      <nav className="dashboard-nav" aria-label="منوی اصلی">
        <a className="active" href="#overview">نمای کلی</a><a href="#projects">{isCustomer ? "درخواست‌های من" : "فرصت‌های خیاطی"}</a><Link href="/orders">سفارش‌ها و نظرها</Link>{!isCustomer && <Link href="/portfolio">نمونه‌کارها</Link>}<Link href="/notifications">اعلان‌ها {unread > 0 && <b>{unread.toLocaleString("fa-IR")}</b>}</Link>
      </nav>
      <div className="sidebar-account"><div>{user.username[0].toUpperCase()}</div><span><strong>{user.username}</strong><small>{isCustomer ? "مشتری" : "خیاط"}</small></span></div>
    </aside>

    <section className="dashboard-main">
      <header className="dashboard-topbar"><div><p>سلام {user.username}، خوش آمدی</p><h1>{isCustomer ? "سفارشت را از اینجا شروع کن" : "فرصت مناسب بعدی را پیدا کن"}</h1></div><div className="topbar-actions"><Link className="icon-action" href="/profile" aria-label="پروفایل">پروفایل</Link><button className="logout-action" onClick={async () => { await logoutFromServer(); router.replace("/"); }}>خروج</button></div></header>
      {message && <p className={`dashboard-message ${message.includes("نشد") ? "error" : "success"}`}>{message}</p>}

      <section className="welcome-card" id="overview"><div><span>{isCustomer ? "یک ایده برای دوخت داری؟" : "آماده‌ی گرفتن سفارش تازه‌ای؟"}</span><h2>{isCustomer ? "جزئیات لباس را بگو؛ خیاط‌ها پیشنهاد می‌دهند." : "درخواست‌ها را ببین و یک پیشنهاد حرفه‌ای بفرست."}</h2><p>{isCustomer ? "بودجه، زمان و مدل مدنظرت را مشخص کن و پیشنهادها را در همین میزکار مقایسه کن." : "فرصت‌های باز متناسب با مهارتت اینجا قرار می‌گیرند."}</p></div><button onClick={() => isCustomer ? setProjectModal(true) : document.querySelector("#projects")?.scrollIntoView()}>{isCustomer ? "+ ثبت درخواست جدید" : "دیدن فرصت‌ها"}</button></section>

      <section className="dashboard-stats" aria-label="خلاصه فعالیت"><article><span>درخواست‌ها</span><strong>{projects.length.toLocaleString("fa-IR")}</strong><small>{isCustomer ? "ثبت‌شده توسط شما" : "فرصت باز"}</small></article><article><span>پیشنهادها</span><strong>{proposals.length.toLocaleString("fa-IR")}</strong><small>{isCustomer ? "دریافت‌شده" : "ارسال‌شده"}</small></article><article><span>سفارش فعال</span><strong>{activeOrders.toLocaleString("fa-IR")}</strong><small>در مسیر انجام</small></article></section>

      <section className="dashboard-section" id="projects"><div className="section-heading"><div><p>{isCustomer ? "مدیریت درخواست‌ها" : "بازار کار سوزن"}</p><h2>{isCustomer ? "درخواست‌ها و پیشنهادها" : "فرصت‌های تازه"}</h2></div>{isCustomer && <button onClick={() => setProjectModal(true)}>درخواست جدید</button>}</div>
        <div className="project-list">{projects.length === 0 ? <div className="empty-state"><strong>{isCustomer ? "هنوز درخواستی نداری" : "فعلاً فرصت بازی وجود ندارد"}</strong><p>{isCustomer ? "اولین درخواست دوختت را ثبت کن." : "کمی بعد دوباره سر بزن."}</p></div> : projects.map((project) => {
          const related = proposals.filter((item) => item.project === project.id);
          return <article className="project-card" key={project.id}><div className="project-main"><div className="project-meta"><span className={`status status-${project.status}`}>{statusLabel[project.status]}</span><span>{date(project.created_at)}</span>{!isCustomer && <span>از {project.customer_username}</span>}</div><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags"><span>{project.garment_type}</span>{project.fabric && <span>پارچه: {project.fabric}</span>}<span>{project.quantity.toLocaleString("fa-IR")} عدد</span></div>{isCustomer && project.status === "pending" && <div className="project-actions"><button onClick={() => { setEditingProject(project); setProjectModal(true); }}>ویرایش</button><button className="danger-link" onClick={() => confirm("این درخواست حذف شود؟") && run(() => deleteProject(project.id), "درخواست حذف شد.")}>حذف</button></div>}</div><div className="project-side"><span>بودجه</span><strong>{money(project.budget)}</strong>{isCustomer ? <small>{related.length.toLocaleString("fa-IR")} پیشنهاد دریافت شده</small> : proposedProjectIds.has(project.id) ? <span className="sent-label">پیشنهاد ارسال شده ✓</span> : <button onClick={() => setProposalProject(project)}>ارسال پیشنهاد</button>}</div>
            {isCustomer && related.length > 0 && <div className="proposal-strip">{related.map((proposal) => <div key={proposal.id}><span><strong>{proposal.tailor_username}</strong><small>{proposal.estimated_days.toLocaleString("fa-IR")} روز · {money(proposal.price)}</small></span><span className={`status status-${proposal.status}`}>{statusLabel[proposal.status]}</span>{proposal.status === "pending" && project.status === "pending" && <button disabled={working} onClick={() => run(async () => { await acceptProposal(proposal.id); await createOrder(proposal.id); }, "پیشنهاد پذیرفته و سفارش ایجاد شد.")}>انتخاب خیاط</button>}</div>)}</div>}
          </article>;
        })}</div>
      </section>

      <div className="dashboard-columns"><section className="dashboard-section compact" id="orders"><div className="section-heading"><div><p>پیگیری کار</p><h2>سفارش‌های اخیر</h2></div><Link href="/orders">مدیریت کامل</Link></div>{orders.length ? orders.slice(0,4).map((order) => <article className="order-row" key={order.id}><div><strong>سفارش #{order.id.toLocaleString("fa-IR")}</strong><span>{isCustomer ? `خیاط: ${order.tailor_username}` : `مشتری: ${order.customer_username}`}</span></div><div><span className={`status status-${order.status}`}>{statusLabel[order.status]}</span><strong>{money(order.total_price)}</strong></div></article>) : <div className="empty-mini">هنوز سفارشی شکل نگرفته است.</div>}</section>
        <section className="dashboard-section compact" id="notifications"><div className="section-heading"><div><p>به‌روزرسانی‌ها</p><h2>اعلان‌ها</h2></div><div className="notification-heading-actions">{unread > 0 && <button onClick={() => run(markAllNotificationsRead, "همه‌ی اعلان‌ها خوانده شد.")}>خواندن همه</button>}<Link href="/notifications">مشاهده همه</Link></div></div>{notifications.length ? notifications.slice(0,5).map((item) => <button className={`notification-row notification-button ${item.is_read ? "" : "unread"}`} key={item.id} disabled={item.is_read || working} onClick={() => run(() => markNotificationRead(item.id), "اعلان خوانده شد.")}><i /><div><p>{item.message}</p><span>{date(item.created_at)}</span></div></button>) : <div className="empty-mini">اعلان تازه‌ای نداری.</div>}</section></div>
    </section>

    {projectModal && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && (setProjectModal(false), setEditingProject(null))}><div className="modal dashboard-modal"><button className="close-button" onClick={() => { setProjectModal(false); setEditingProject(null); }}>×</button><p className="modal-kicker">{editingProject ? "ویرایش درخواست" : "درخواست دوخت جدید"}</p><h2>چه چیزی می‌خواهی بدوزی؟</h2><form onSubmit={submitProject}><label>عنوان درخواست<input name="title" defaultValue={editingProject?.title} required placeholder="مثلاً دوخت مانتوی تابستانی" /></label><label>توضیحات<textarea name="description" defaultValue={editingProject?.description} required placeholder="مدل، اندازه و جزئیات مهم را بنویسید" /></label><div className="form-pair"><label>نوع لباس<input name="garment_type" defaultValue={editingProject?.garment_type} required placeholder="مانتو" /></label><label>نوع پارچه<input name="fabric" defaultValue={editingProject?.fabric} placeholder="لینن" /></label></div><div className="form-pair"><label>تعداد<input name="quantity" type="number" min="1" defaultValue={editingProject?.quantity ?? 1} required /></label><label>بودجه (تومان)<input name="budget" type="number" min="0" defaultValue={editingProject?.budget ?? ""} /></label></div><label>مهلت تحویل<input name="deadline" type="date" defaultValue={editingProject?.deadline ?? ""} /></label><button className="button button-primary" disabled={working}>{working ? "در حال ذخیره…" : editingProject ? "ذخیره تغییرات" : "ثبت و انتشار درخواست"}</button></form></div></div>}
    {proposalProject && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setProposalProject(null)}><div className="modal dashboard-modal"><button className="close-button" onClick={() => setProposalProject(null)}>×</button><p className="modal-kicker">پیشنهاد برای {proposalProject.title}</p><h2>پیشنهاد حرفه‌ای خودت را ثبت کن</h2><form onSubmit={submitProposal}><div className="form-pair"><label>قیمت پیشنهادی<input name="price" type="number" min="0" required /></label><label>زمان انجام (روز)<input name="estimated_days" type="number" min="1" required /></label></div><label>توضیح پیشنهاد<textarea name="description" placeholder="روش کار یا نکته‌ای که مشتری باید بداند" /></label><button className="button button-primary" disabled={working}>{working ? "در حال ارسال…" : "ارسال پیشنهاد برای مشتری"}</button></form></div></div>}
  </main>;
}
