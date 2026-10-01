"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import {
  getCurrentUser,
  logout,
  logoutFromServer,
} from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import {
  acceptProposal,
  createOrder,
  createProject,
  createProposal,
  deleteProject,
  getWorkspaceData,
  markAllNotificationsRead,
  markNotificationRead,
  updateProject,
} from "@/services/api/workspace";

import type {
  Notification,
  Order,
  ProjectRequest,
  Proposal,
  User,
} from "@/types";

const statusLabel: Record<string, string> = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  confirmed: "تأییدشده",
  in_progress: "در حال انجام",
  completed: "تکمیل‌شده",
  cancelled: "لغوشده",
  rejected: "ردشده",
  withdrawn: "پس‌گرفته‌شده",
};

function money(value: string | null) {
  return value
    ? `${Number(value).toLocaleString("fa-IR")} تومان`
    : "توافقی";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "completed" || status === "accepted"
      ? "bg-highlight-soft"
      : status === "cancelled" ||
          status === "rejected" ||
          status === "withdrawn"
        ? "border border-accent bg-surface text-accent"
        : status === "in_progress" || status === "confirmed"
          ? "bg-brand text-white"
          : "";

  return (
    <Badge className={className}>
      {statusLabel[status] ?? status}
    </Badge>
  );
}

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
  const [editingProject, setEditingProject] =
    useState<ProjectRequest | null>(null);
  const [proposalProject, setProposalProject] =
    useState<ProjectRequest | null>(null);

  const load = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const data = await getWorkspaceData();

      setUser(currentUser);
      setProjects(data.projects);
      setProposals(data.proposals);
      setOrders(data.orders);
      setNotifications(data.notifications);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        router.replace("/");
        return;
      }

      setMessage(
        "دریافت اطلاعات انجام نشد. اتصال بک‌اند رو بررسی کن.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const isCustomer = user?.role === "CUSTOMER";

  const unread = notifications.filter(
    (item) => !item.is_read,
  ).length;

  const activeOrders = orders.filter(
    (item) =>
      !["completed", "cancelled"].includes(item.status),
  ).length;

  const proposedProjectIds = useMemo(
    () => new Set(proposals.map((item) => item.project)),
    [proposals],
  );

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ) {
    setWorking(true);
    setMessage("");

    try {
      await action();
      setMessage(success);
      await load();
      return true;
    } catch {
      setMessage(
        "عملیات انجام نشد. اطلاعات رو بررسی کن و دوباره امتحان کن.",
      );
      return false;
    } finally {
      setWorking(false);
    }
  }

  async function submitProject(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const body = {
      title: data.get("title"),
      description: data.get("description"),
      garment_type: data.get("garment_type"),
      fabric: data.get("fabric"),
      quantity: Number(data.get("quantity")),
      budget: data.get("budget") || null,
      deadline: data.get("deadline") || null,
    };

    const ok = editingProject
      ? await run(
          () => updateProject(editingProject.id, body),
          "درخواستت ویرایش شد.",
        )
      : await run(
          () => createProject(body),
          "درخواستت ثبت شد و حالا برای خیاط‌ها نمایش داده می‌شه.",
        );

    if (ok) {
      setProjectModal(false);
      setEditingProject(null);
    }
  }

  async function submitProposal(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!proposalProject) return;

    const data = new FormData(event.currentTarget);

    const ok = await run(
      () =>
        createProposal({
          project: proposalProject.id,
          price: data.get("price"),
          estimated_days: Number(
            data.get("estimated_days"),
          ),
          description: data.get("description"),
        }),
      "پیشنهادت برای مشتری ارسال شد.",
    );

    if (ok) {
      setProposalProject(null);
    }
  }

  async function signOut() {
    await logoutFromServer();
    router.replace("/");
  }

  if (loading) {
    return (
      <PageShell headerMode="account">
        <Section tone="canvas">
          <Card className="mx-auto max-w-xl text-center">
            <p className="font-bold text-brand">
              در حال آماده‌کردن میزکار…
            </p>
          </Card>
        </Section>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell headerMode="account">
        <Section tone="canvas">
          <Card className="mx-auto grid max-w-xl gap-4 text-center">
            <h1 className="text-2xl">
              ورود به حساب انجام نشد
            </h1>

            <Button href="/login">
              رفتن به صفحه ورود
            </Button>
          </Card>
        </Section>
      </PageShell>
    );
  }

  const messageIsError = message.includes("نشد");

  return (
    <PageShell headerMode="account">
      <Section tone="canvas">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Avatar name={user.username} />

              <div>
                <p className="text-base text-muted">
                  سلام {user.username}، خوش اومدی
                </p>

                <Badge>
                  {isCustomer ? "مشتری" : "خیاط"}
                </Badge>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl">
              {isCustomer
                ? "سفارشت رو از اینجا شروع کن"
                : "فرصت بعدی دوختت رو پیدا کن"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              href="/profile"
              variant="outline"
              size="sm"
            >
              پروفایل
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={signOut}
            >
              خروج از حساب
            </Button>
          </div>
        </div>

        {message ? (
          <div
            role={messageIsError ? "alert" : "status"}
            className={
              messageIsError
                ? "mb-6 rounded-control border-2 border-accent bg-surface p-4 font-bold text-accent"
                : "mb-6 rounded-control bg-highlight-soft p-4 font-bold text-brand"
            }
          >
            {message}
          </div>
        ) : null}

        <Card className="mb-5 overflow-hidden border-brand bg-brand p-0 text-white shadow-window">
          <div className="grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-2 font-bold text-highlight">
                {isCustomer
                  ? "یک ایده برای دوخت داری؟"
                  : "آماده‌ی گرفتن سفارش تازه‌ای؟"}
              </p>

              <h2 className="max-w-[23em] text-3xl leading-relaxed text-white">
                {isCustomer
                  ? "جزئیات لباس رو بگو، خیاط‌ها پیشنهاد می‌دن."
                  : "درخواست‌های مشتری‌ها رو ببین و پیشنهادت رو ثبت کن."}
              </h2>

              <p className="mt-3 max-w-[38em] text-white/80">
                {isCustomer
                  ? "بودجه، زمان و مدل مدنظرت رو مشخص کن و پیشنهادها رو همین‌جا مقایسه کن."
                  : "فرصت‌های باز رو بررسی کن و برای پروژه‌ای که مناسبته قیمت و زمان بده."}
              </p>
            </div>

            {isCustomer ? (
              <Button
                type="button"
                variant="accent"
                onClick={() => {
                  setEditingProject(null);
                  setProjectModal(true);
                }}
              >
                ثبت درخواست جدید
              </Button>
            ) : (
              <Button
                href="#projects"
                variant="highlight"
              >
                دیدن درخواست‌ها
              </Button>
            )}
          </div>
        </Card>

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-base font-bold text-muted">
              درخواست‌ها
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {projects.length.toLocaleString("fa-IR")}
            </strong>

            <p className="mt-1 text-base text-muted">
              {isCustomer
                ? "ثبت‌شده توسط شما"
                : "فرصت‌های قابل مشاهده"}
            </p>
          </Card>

          <Card>
            <p className="text-base font-bold text-muted">
              پیشنهادها
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {proposals.length.toLocaleString("fa-IR")}
            </strong>

            <p className="mt-1 text-base text-muted">
              {isCustomer
                ? "دریافت‌شده"
                : "ارسال‌شده توسط شما"}
            </p>
          </Card>

          <Card>
            <p className="text-base font-bold text-muted">
              سفارش فعال
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {activeOrders.toLocaleString("fa-IR")}
            </strong>

            <p className="mt-1 text-base text-muted">
              در مسیر انجام
            </p>
          </Card>
        </div>

        <Card
          id="projects"
          className="mb-5"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-muted">
                {isCustomer
                  ? "مدیریت درخواست‌ها"
                  : "بازار کار سوزن"}
              </p>

              <h2 className="text-2xl">
                {isCustomer
                  ? "درخواست‌ها و پیشنهادها"
                  : "درخواست‌های باز"}
              </h2>
            </div>

            {isCustomer ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingProject(null);
                  setProjectModal(true);
                }}
              >
                درخواست جدید
              </Button>
            ) : null}
          </div>

          {projects.length === 0 ? (
            <div className="rounded-control border border-dashed border-line bg-canvas p-8 text-center">
              <strong className="block text-brand">
                {isCustomer
                  ? "هنوز درخواستی نداری"
                  : "فعلاً درخواست بازی وجود نداره"}
              </strong>

              <p className="mt-1 text-muted">
                {isCustomer
                  ? "اولین درخواست دوختت رو ثبت کن."
                  : "کمی بعد دوباره سر بزن."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => {
                const related = proposals.filter(
                  (item) => item.project === project.id,
                );

                return (
                  <Card
                    key={project.id}
                    className="shadow-none"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={project.status}
                          />

                          <span className="text-base text-muted">
                            {formatDate(project.created_at)}
                          </span>

                          {!isCustomer ? (
                            <span className="text-base text-muted">
                              مشتری:{" "}
                              {project.customer_username}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="text-xl">
                          {project.title}
                        </h3>

                        <p className="mt-2 text-muted">
                          {project.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge>
                            {project.garment_type}
                          </Badge>

                          {project.fabric ? (
                            <Badge>
                              پارچه: {project.fabric}
                            </Badge>
                          ) : null}

                          <Badge>
                            {project.quantity.toLocaleString(
                              "fa-IR",
                            )}{" "}
                            عدد
                          </Badge>
                        </div>

                        {isCustomer &&
                        project.status === "pending" ? (
                          <div className="mt-5 flex flex-wrap gap-3">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingProject(project);
                                setProjectModal(true);
                              }}
                            >
                              ویرایش درخواست
                            </Button>

                            <button
                              type="button"
                              className="min-h-11 rounded-control px-4 font-bold text-accent underline underline-offset-4"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "این درخواست حذف بشه؟",
                                  )
                                ) {
                                  void run(
                                    () =>
                                      deleteProject(
                                        project.id,
                                      ),
                                    "درخواست حذف شد.",
                                  );
                                }
                              }}
                            >
                              حذف درخواست
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-48 rounded-control bg-canvas p-4">
                        <p className="text-base text-muted">
                          بودجه
                        </p>

                        <strong className="block text-xl text-brand">
                          {money(project.budget)}
                        </strong>

                        {isCustomer ? (
                          <p className="mt-2 text-base text-muted">
                            {related.length.toLocaleString(
                              "fa-IR",
                            )}{" "}
                            پیشنهاد دریافت شده
                          </p>
                        ) : proposedProjectIds.has(
                            project.id,
                          ) ? (
                          <p className="mt-3 font-bold text-brand">
                            پیشنهاد ارسال شده
                          </p>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() =>
                              setProposalProject(project)
                            }
                          >
                            ارسال پیشنهاد
                          </Button>
                        )}
                      </div>
                    </div>

                    {isCustomer &&
                    related.length > 0 ? (
                      <div className="mt-5 border-t border-line pt-5">
                        <p className="mb-3 font-bold text-brand">
                          پیشنهادهای خیاط‌ها
                        </p>

                        <div className="grid gap-3">
                          {related.map((proposal) => (
                            <div
                              key={proposal.id}
                              className="flex flex-col gap-3 rounded-control bg-canvas p-4 sm:flex-row sm:items-center"
                            >
                              <Avatar
                                name={
                                  proposal.tailor_username
                                }
                              />

                              <div className="min-w-0 flex-1">
                                <strong className="block text-brand">
                                  {
                                    proposal.tailor_username
                                  }
                                </strong>

                                <span className="text-base text-muted">
                                  {proposal.estimated_days.toLocaleString(
                                    "fa-IR",
                                  )}{" "}
                                  روز ·{" "}
                                  {money(proposal.price)}
                                </span>
                              </div>

                              <StatusBadge
                                status={proposal.status}
                              />

                              {proposal.status ===
                                "pending" &&
                              project.status ===
                                "pending" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={working}
                                  onClick={() =>
                                    void run(
                                      async () => {
                                        await acceptProposal(
                                          proposal.id,
                                        );
                                        await createOrder(
                                          proposal.id,
                                        );
                                      },
                                      "خیاط انتخاب شد و سفارش ساخته شد.",
                                    )
                                  }
                                >
                                  انتخاب این خیاط
                                </Button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-muted">
                  پیگیری کار
                </p>

                <h2 className="text-2xl">
                  سفارش‌های اخیر
                </h2>
              </div>

              <Link
                href="/orders"
                className="font-bold text-brand underline underline-offset-4"
              >
                مدیریت کامل
              </Link>
            </div>

            {orders.length ? (
              <div className="grid gap-3">
                {orders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-control bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <strong className="block text-brand">
                        سفارش #
                        {order.id.toLocaleString("fa-IR")}
                      </strong>

                      <span className="text-base text-muted">
                        {isCustomer
                          ? `خیاط: ${order.tailor_username}`
                          : `مشتری: ${order.customer_username}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge
                        status={order.status}
                      />

                      <strong className="text-brand">
                        {money(order.total_price)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-control bg-canvas p-6 text-center text-muted">
                هنوز سفارشی شکل نگرفته.
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-muted">
                  به‌روزرسانی‌ها
                </p>

                <h2 className="text-2xl">
                  اعلان‌ها
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {unread > 0 ? (
                  <button
                    type="button"
                    disabled={working}
                    className="min-h-11 rounded-control px-3 font-bold text-brand underline underline-offset-4 disabled:opacity-50"
                    onClick={() =>
                      void run(
                        markAllNotificationsRead,
                        "همه‌ی اعلان‌ها خوانده شد.",
                      )
                    }
                  >
                    خواندن همه
                  </button>
                ) : null}

                <Link
                  href="/notifications"
                  className="font-bold text-brand underline underline-offset-4"
                >
                  مشاهده همه
                </Link>
              </div>
            </div>

            {notifications.length ? (
              <div className="grid gap-3">
                {notifications
                  .slice(0, 5)
                  .map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      disabled={
                        item.is_read || working
                      }
                      onClick={() =>
                        void run(
                          () =>
                            markNotificationRead(
                              item.id,
                            ),
                          "اعلان خوانده شد.",
                        )
                      }
                      className="min-h-11 rounded-control border border-line bg-surface p-4 text-start disabled:cursor-default"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={
                            item.is_read
                              ? "mt-2 size-2 rounded-full bg-line"
                              : "mt-2 size-2 rounded-full bg-accent"
                          }
                        />

                        <div>
                          <p className="text-base text-ink">
                            {item.message}
                          </p>

                          <span className="text-base text-muted">
                            {formatDate(
                              item.created_at,
                            )}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="rounded-control bg-canvas p-6 text-center text-muted">
                اعلان تازه‌ای نداری.
              </div>
            )}
          </Card>
        </div>
      </Section>

      {projectModal ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-brand/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProjectModal(false);
              setEditingProject(null);
            }
          }}
        >
          <div className="mx-auto my-10 max-w-2xl rounded-window border border-line bg-surface p-6 shadow-window">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-muted">
                  {editingProject
                    ? "ویرایش درخواست"
                    : "درخواست دوخت جدید"}
                </p>

                <h2 className="text-2xl">
                  چه چیزی می‌خوای بدوزی؟
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setProjectModal(false);
                  setEditingProject(null);
                }}
              >
                بستن
              </Button>
            </div>

            <form
              onSubmit={submitProject}
              className="grid gap-5"
            >
              <TextField
                label="عنوان درخواست"
                name="title"
                defaultValue={editingProject?.title}
                placeholder="مثلاً دوخت مانتوی تابستانی"
                required
              />

              <label className="grid gap-1.5 font-bold text-brand">
                توضیحات
                <textarea
                  name="description"
                  defaultValue={
                    editingProject?.description
                  }
                  required
                  rows={4}
                  placeholder="مدل، اندازه و جزئیات مهم رو بنویس"
                  className="rounded-control border-2 border-line bg-surface px-4 py-3 font-normal text-ink placeholder:text-muted focus:border-brand"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="نوع لباس"
                  name="garment_type"
                  defaultValue={
                    editingProject?.garment_type
                  }
                  placeholder="مثلاً مانتو"
                  required
                />

                <TextField
                  label="نوع پارچه"
                  name="fabric"
                  defaultValue={
                    editingProject?.fabric
                  }
                  placeholder="مثلاً لینن"
                />

                <TextField
                  label="تعداد"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={
                    editingProject?.quantity ?? 1
                  }
                  required
                />

                <TextField
                  label="بودجه"
                  name="budget"
                  type="number"
                  min="0"
                  defaultValue={
                    editingProject?.budget ?? ""
                  }
                  hint="مبلغ به تومان"
                />
              </div>

              <TextField
                label="مهلت تحویل"
                name="deadline"
                type="date"
                defaultValue={
                  editingProject?.deadline ?? ""
                }
              />

              <div className="flex justify-start">
                <Button
                  type="submit"
                  variant="accent"
                  disabled={working}
                >
                  {working
                    ? "در حال ذخیره…"
                    : editingProject
                      ? "ذخیره تغییرات"
                      : "ثبت درخواست"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {proposalProject ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-brand/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProposalProject(null);
            }
          }}
        >
          <div className="mx-auto my-10 max-w-xl rounded-window border border-line bg-surface p-6 shadow-window">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-muted">
                  پیشنهاد برای{" "}
                  {proposalProject.title}
                </p>

                <h2 className="text-2xl">
                  پیشنهادت رو ثبت کن
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setProposalProject(null)
                }
              >
                بستن
              </Button>
            </div>

            <form
              onSubmit={submitProposal}
              className="grid gap-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="قیمت پیشنهادی"
                  name="price"
                  type="number"
                  min="0"
                  required
                  hint="مبلغ به تومان"
                />

                <TextField
                  label="زمان انجام"
                  name="estimated_days"
                  type="number"
                  min="1"
                  required
                  hint="تعداد روز"
                />
              </div>

              <label className="grid gap-1.5 font-bold text-brand">
                توضیح پیشنهاد
                <textarea
                  name="description"
                  rows={4}
                  placeholder="روش کار یا نکته‌ای که مشتری باید بدونه"
                  className="rounded-control border-2 border-line bg-surface px-4 py-3 font-normal text-ink placeholder:text-muted focus:border-brand"
                />
              </label>

              <div className="flex justify-start">
                <Button
                  type="submit"
                  variant="accent"
                  disabled={working}
                >
                  {working
                    ? "در حال ارسال…"
                    : "ارسال پیشنهاد"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}