"use client";

import {
  useCallback,
  useEffect,
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
import { getCurrentUser, logout } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import {
  createReview,
  deleteReview,
  getReviews,
  getWorkspaceData,
  updateOrderStatus,
  updateReview,
} from "@/services/api/workspace";

import type {
  Order,
  OrderStatus,
  Review,
  User,
} from "@/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "در انتظار",
  confirmed: "تأییدشده",
  in_progress: "در حال انجام",
  completed: "تکمیل‌شده",
  cancelled: "لغوشده",
};

const STATUS_OPTIONS = Object.entries(
  STATUS_LABEL,
) as [OrderStatus, string][];

function money(value: string) {
  return `${Number(value).toLocaleString("fa-IR")} تومان`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  let className = "";

  if (status === "completed") {
    className = "bg-highlight-soft";
  }

  if (
    status === "confirmed" ||
    status === "in_progress"
  ) {
    className = "bg-brand text-white";
  }

  if (status === "cancelled") {
    className =
      "border border-accent bg-surface text-accent";
  }

  return (
    <Badge className={className}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export default function OrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [reviewOrder, setReviewOrder] =
    useState<Order | null>(null);

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [currentUser, workspace, reviewList] =
        await Promise.all([
          getCurrentUser(),
          getWorkspaceData(),
          getReviews(),
        ]);

      setUser(currentUser);
      setOrders(workspace.orders);
      setReviews(reviewList);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        logout();
        router.replace("/");
        return;
      }

      setMessage("دریافت سفارش‌ها ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

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
        "عملیات انجام نشد. دوباره امتحان کن.",
      );
      return false;
    } finally {
      setWorking(false);
    }
  }

  async function submitReview(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const rating = Number(data.get("rating"));
    const comment = String(
      data.get("comment") ?? "",
    );

    const ok = editingReview
      ? await run(
          () =>
            updateReview(editingReview.id, {
              rating,
              comment,
            }),
          "نظرت ویرایش شد.",
        )
      : reviewOrder
        ? await run(
            () =>
              createReview({
                order: reviewOrder.id,
                rating,
                comment,
              }),
            "نظرت ثبت شد.",
          )
        : false;

    if (ok) {
      setReviewOrder(null);
      setEditingReview(null);
    }
  }

  if (loading) {
    return (
      <PageShell headerMode="account">
        <Section tone="canvas">
          <Card className="mx-auto max-w-xl text-center">
            <p className="font-bold text-brand">
              در حال دریافت سفارش‌ها…
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
              سفارش‌ها در دسترس نیست
            </h1>

            <p className="text-muted">
              اطلاعات حساب دریافت نشد.
            </p>

            <Button href="/login">
              ورود به حساب
            </Button>
          </Card>
        </Section>
      </PageShell>
    );
  }

  const isCustomer = user.role === "CUSTOMER";

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;

  const activeOrders = orders.filter(
    (order) =>
      !["completed", "cancelled"].includes(
        order.status,
      ),
  ).length;

  const messageIsError =
    message.includes("نشد");

  return (
    <PageShell headerMode="account">
      <Section tone="canvas">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 font-bold text-muted">
              مدیریت روند همکاری
            </p>

            <h1 className="text-3xl md:text-4xl">
              سفارش‌ها و نظرهای من
            </h1>

            <p className="mt-2 max-w-[35em] text-muted">
              وضعیت سفارش‌هات رو دنبال کن و بعد از
              پایان همکاری، تجربه‌ات رو ثبت کن.
            </p>
          </div>

          <Button
            href="/dashboard"
            variant="outline"
            size="sm"
          >
            بازگشت به میزکار
          </Button>
        </div>

        {message ? (
          <div
            role={
              messageIsError
                ? "alert"
                : "status"
            }
            className={
              messageIsError
                ? "mb-5 rounded-control border-2 border-accent bg-surface p-4 font-bold text-accent"
                : "mb-5 rounded-control bg-highlight-soft p-4 font-bold text-brand"
            }
          >
            {message}
          </div>
        ) : null}

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-base font-bold text-muted">
              همه سفارش‌ها
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {orders.length.toLocaleString("fa-IR")}
            </strong>
          </Card>

          <Card>
            <p className="text-base font-bold text-muted">
              سفارش فعال
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {activeOrders.toLocaleString("fa-IR")}
            </strong>
          </Card>

          <Card>
            <p className="text-base font-bold text-muted">
              تکمیل‌شده
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {completedOrders.toLocaleString(
                "fa-IR",
              )}
            </strong>
          </Card>
        </div>

        {orders.length === 0 ? (
          <Card>
            <div className="rounded-control border border-dashed border-line bg-canvas p-10 text-center">
              <strong className="block text-xl text-brand">
                هنوز سفارشی نداری
              </strong>

              <p className="mx-auto mt-2 max-w-[32em] text-muted">
                سفارش بعد از پذیرفته‌شدن یک پیشنهاد
                ساخته می‌شه.
              </p>

              <Button
                href="/dashboard"
                variant="outline"
                className="mt-5"
              >
                رفتن به میزکار
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => {
              const review = reviews.find(
                (item) =>
                  item.order === order.id,
              );

              const personName = isCustomer
                ? order.tailor_username
                : order.customer_username;

              return (
                <Card key={order.id}>
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={personName}
                      />

                      <div>
                        <p className="text-base text-muted">
                          سفارش #
                          {order.id.toLocaleString(
                            "fa-IR",
                          )}
                        </p>

                        <h2 className="text-2xl">
                          {isCustomer
                            ? `همکاری با ${order.tailor_username}`
                            : `سفارش ${order.customer_username}`}
                        </h2>
                      </div>
                    </div>

                    <StatusBadge
                      status={order.status}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="rounded-control bg-canvas p-4">
                      <p className="text-base text-muted">
                        مبلغ سفارش
                      </p>

                      <strong className="mt-1 block text-xl text-brand">
                        {money(
                          order.total_price,
                        )}
                      </strong>
                    </div>

                    <div className="rounded-control bg-canvas p-4">
                      <p className="text-base text-muted">
                        شماره درخواست
                      </p>

                      <strong className="mt-1 block text-xl text-brand">
                        #
                        {order.project.toLocaleString(
                          "fa-IR",
                        )}
                      </strong>
                    </div>

                    <div className="rounded-control bg-canvas p-4">
                      <label className="grid gap-1.5 font-bold text-brand">
                        وضعیت سفارش

                        <select
                          value={order.status}
                          disabled={working}
                          onChange={(event) =>
                            void run(
                              () =>
                                updateOrderStatus(
                                  order.id,
                                  event.target
                                    .value as OrderStatus,
                                ),
                              "وضعیت سفارش به‌روز شد.",
                            )
                          }
                          className="min-h-13 rounded-control border-2 border-line bg-surface px-4 text-ink focus:border-brand disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map(
                            ([value, label]) => (
                              <option
                                key={value}
                                value={value}
                              >
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                  </div>

                  {order.status ===
                  "completed" ? (
                    <div className="mt-5 border-t border-line pt-5">
                      {review ? (
                        <div className="rounded-card bg-highlight-soft p-5">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-base font-bold text-muted">
                                نظر ثبت‌شده
                              </p>

                              <p
                                aria-label={`${review.rating} از ۵ ستاره`}
                                className="text-xl font-bold text-brand"
                              >
                                {"★".repeat(
                                  review.rating,
                                )}
                                {"☆".repeat(
                                  5 -
                                    review.rating,
                                )}
                              </p>
                            </div>

                            <Badge>
                              {review.rating.toLocaleString(
                                "fa-IR",
                              )}{" "}
                              از ۵
                            </Badge>
                          </div>

                          <p className="text-ink">
                            {review.comment ||
                              "بدون توضیح"}
                          </p>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditingReview(
                                  review,
                                )
                              }
                            >
                              ویرایش نظر
                            </Button>

                            <button
                              type="button"
                              className="min-h-11 rounded-control px-4 font-bold text-accent underline underline-offset-4"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "این نظر حذف بشه؟",
                                  )
                                ) {
                                  void run(
                                    () =>
                                      deleteReview(
                                        review.id,
                                      ),
                                    "نظر حذف شد.",
                                  );
                                }
                              }}
                            >
                              حذف نظر
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 rounded-card bg-canvas p-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <strong className="block text-brand">
                              همکاری تموم شده
                            </strong>

                            <p className="mt-1 text-base text-muted">
                              تجربه‌ات از این همکاری رو
                              برای بقیه بنویس.
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="accent"
                            size="sm"
                            onClick={() =>
                              setReviewOrder(order)
                            }
                          >
                            ثبت نظر
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {reviewOrder || editingReview ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-brand/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setReviewOrder(null);
              setEditingReview(null);
            }
          }}
        >
          <div className="mx-auto my-16 max-w-xl rounded-window border border-line bg-surface p-6 shadow-window">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-muted">
                  بازخورد همکاری
                </p>

                <h2 className="text-2xl">
                  {editingReview
                    ? "ویرایش نظر"
                    : "تجربه‌ات چطور بود؟"}
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setReviewOrder(null);
                  setEditingReview(null);
                }}
              >
                بستن
              </Button>
            </div>

            <form
              onSubmit={submitReview}
              className="grid gap-5"
            >
              <label className="grid gap-1.5 font-bold text-brand">
                امتیاز

                <select
                  name="rating"
                  defaultValue={
                    editingReview?.rating ?? 5
                  }
                  required
                  className="min-h-13 rounded-control border-2 border-line bg-surface px-4 text-ink focus:border-brand"
                >
                  {[5, 4, 3, 2, 1].map(
                    (value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        ستاره
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="grid gap-1.5 font-bold text-brand">
                توضیحات

                <textarea
                  name="comment"
                  defaultValue={
                    editingReview?.comment ?? ""
                  }
                  rows={5}
                  placeholder="از کیفیت کار و تجربه همکاری بنویس"
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
                    ? "در حال ذخیره…"
                    : editingReview
                      ? "ذخیره تغییرات نظر"
                      : "ثبت نظر"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}