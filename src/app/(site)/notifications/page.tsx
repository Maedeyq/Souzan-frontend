"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getCurrentUser,
  logout,
} from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import {
  getNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/api/workspace";

import type { Notification } from "@/types";

const typeLabel: Record<
  Notification["notification_type"],
  string
> = {
  proposal_submitted: "پیشنهاد جدید",
  proposal_accepted: "پیشنهاد پذیرفته شد",
  order_status_changed: "تغییر وضعیت سفارش",
  review_created: "نظر جدید",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function NotificationsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Notification[]>([]);
  const [selected, setSelected] =
    useState<Notification | null>(null);

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [, notifications] = await Promise.all([
        getCurrentUser(),
        getNotifications(),
      ]);

      setItems(notifications);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
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

  async function openNotification(
    item: Notification,
  ) {
    setWorking(true);
    setMessage("");

    try {
      if (!item.is_read) {
        await markNotificationRead(item.id);
      }

      const detail = await getNotification(item.id);

      setSelected(detail);

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
      setMessage(
        "به‌روزرسانی اعلان‌ها انجام نشد.",
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <PageShell headerMode="account">
        <Section tone="canvas">
          <Card className="mx-auto max-w-xl text-center">
            <p className="font-bold text-brand">
              در حال دریافت اعلان‌ها…
            </p>
          </Card>
        </Section>
      </PageShell>
    );
  }

  const unread = items.filter(
    (item) => !item.is_read,
  ).length;

  const messageIsError =
    message.includes("نشد");

  return (
    <PageShell headerMode="account">
      <Section tone="canvas">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 font-bold text-muted">
              به‌روزرسانی‌های حساب
            </p>

            <h1 className="text-3xl md:text-4xl">
              اعلان‌های من
            </h1>

            <p className="mt-2 max-w-[35em] text-muted">
              تغییرات درخواست‌ها، پیشنهادها و
              سفارش‌ها رو از اینجا دنبال کن.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              href="/dashboard"
              variant="outline"
              size="sm"
            >
              بازگشت به میزکار
            </Button>

            {unread > 0 ? (
              <Button
                type="button"
                size="sm"
                disabled={working}
                onClick={() => void readAll()}
              >
                خواندن همه
              </Button>
            ) : null}
          </div>
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
              همه اعلان‌ها
            </p>

            <strong className="mt-2 block text-3xl text-brand">
              {items.length.toLocaleString(
                "fa-IR",
              )}
            </strong>
          </Card>

          <Card>
            <p className="text-base font-bold text-muted">
              خوانده‌نشده
            </p>

            <strong className="mt-2 block text-3xl text-accent">
              {unread.toLocaleString("fa-IR")}
            </strong>
          </Card>

          <Card>
            <p className="text-base font-bold text-muted">
              وضعیت
            </p>

            <strong className="mt-2 block text-xl text-brand">
              {unread > 0
                ? "اعلان تازه داری"
                : "همه دیده شده"}
            </strong>
          </Card>
        </div>

        <Card>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="font-bold text-muted">
                فعالیت‌های اخیر
              </p>

              <h2 className="text-2xl">
                اعلان‌ها
              </h2>
            </div>

            {unread > 0 ? (
              <Badge className="bg-highlight-soft">
                {unread.toLocaleString(
                  "fa-IR",
                )}{" "}
                اعلان جدید
              </Badge>
            ) : (
              <Badge>همه خوانده شده</Badge>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-control border border-dashed border-line bg-canvas p-10 text-center">
              <strong className="block text-xl text-brand">
                هنوز اعلانی نداری
              </strong>

              <p className="mt-2 text-muted">
                اتفاق‌های مربوط به درخواست‌ها،
                پیشنهادها و سفارش‌ها اینجا نمایش
                داده می‌شن.
              </p>

              <Button
                href="/dashboard"
                variant="outline"
                className="mt-5"
              >
                رفتن به میزکار
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  disabled={working}
                  onClick={() =>
                    void openNotification(item)
                  }
                  className={
                    "min-h-20 w-full rounded-card border p-4 text-start transition-colors disabled:opacity-60 " +
                    (item.is_read
                      ? "border-line bg-surface hover:bg-canvas"
                      : "border-highlight bg-highlight-soft hover:brightness-[0.98]")
                  }
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className={
                        item.is_read
                          ? "mt-2 size-3 flex-none rounded-full bg-line"
                          : "mt-2 size-3 flex-none rounded-full bg-accent"
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <strong className="text-brand">
                          {
                            typeLabel[
                              item.notification_type
                            ]
                          }
                        </strong>

                        {!item.is_read ? (
                          <Badge className="bg-accent text-white">
                            جدید
                          </Badge>
                        ) : null}
                      </div>

                      <p className="text-ink">
                        {item.message}
                      </p>

                      <p className="mt-2 text-base text-muted">
                        {formatDate(
                          item.created_at,
                        )}
                      </p>
                    </div>

                    <span className="flex-none text-base font-bold text-brand">
                      مشاهده
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </Section>

      {selected ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-brand/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelected(null);
            }
          }}
        >
          <div className="mx-auto my-16 max-w-xl rounded-window border border-line bg-surface p-6 shadow-window">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-3 bg-highlight-soft">
                  {
                    typeLabel[
                      selected.notification_type
                    ]
                  }
                </Badge>

                <h2 className="text-2xl">
                  جزئیات اعلان
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelected(null)
                }
              >
                بستن
              </Button>
            </div>

            <div className="rounded-control bg-canvas p-5">
              <p className="leading-8 text-ink">
                {selected.message}
              </p>

              <p className="mt-4 text-base text-muted">
                {formatDate(
                  selected.created_at,
                )}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}