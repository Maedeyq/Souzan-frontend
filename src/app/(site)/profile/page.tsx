"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { apiFetch, ApiError } from "@/services/api/client";

import type {
  CustomerProfile,
  TailorProfile,
  User,
} from "@/types";

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

        const endpoint =
          currentUser.role === "TAILOR"
            ? "/tailors/me/"
            : "/customers/me/";

        const currentProfile = await apiFetch<Profile>(endpoint);

        setUser(currentUser);
        setProfile(currentProfile);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          router.replace("/");
          return;
        }

        setMessage(
          "دریافت اطلاعات پروفایل ممکن نشد. اتصال سرور رو بررسی کن.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !profile) return;

    setSaving(true);
    setMessage("");

    const data = new FormData(event.currentTarget);

    const body =
      user.role === "TAILOR"
        ? {
            specialty: String(data.get("specialty") ?? ""),
            starting_price:
              String(data.get("starting_price") ?? "") || null,
            work_location: String(data.get("work_location") ?? ""),
            working_hours: String(data.get("working_hours") ?? ""),
          }
        : {
            phone_number: String(data.get("phone_number") ?? ""),
            address: String(data.get("address") ?? ""),
          };

    try {
      const endpoint =
        user.role === "TAILOR"
          ? "/tailors/me/"
          : "/customers/me/";

      const updatedProfile = await apiFetch<Profile>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      setProfile(updatedProfile);
      setMessage("تغییرات پروفایل با موفقیت ذخیره شد.");
    } catch {
      setMessage(
        "ذخیره تغییرات انجام نشد. اطلاعات واردشده رو بررسی کن.",
      );
    } finally {
      setSaving(false);
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
              در حال دریافت پروفایل…
            </p>
          </Card>
        </Section>
      </PageShell>
    );
  }

  if (!user || !profile) {
    return (
      <PageShell headerMode="account">
        <Section tone="canvas">
          <Card className="mx-auto grid max-w-xl gap-5 text-center">
            <h1 className="text-2xl">پروفایل در دسترس نیست</h1>

            <p className="text-muted">
              {message || "اطلاعات پروفایل دریافت نشد."}
            </p>

            <Button href="/" variant="outline">
              بازگشت به صفحه اصلی
            </Button>
          </Card>
        </Section>
      </PageShell>
    );
  }

  const customer = isCustomer(profile) ? profile : null;
  const tailor = !isCustomer(profile) ? profile : null;

  const success = message.includes("موفقیت");

  return (
    <PageShell headerMode="account">
      <Section tone="canvas">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 font-bold text-muted">
              حساب کاربری
            </p>

            <h1 className="text-3xl md:text-4xl">
              پروفایل من
            </h1>

            <p className="mt-2 max-w-[35em] text-muted">
              اطلاعات حسابت رو ببین و مشخصات قابل ویرایش رو به‌روز کن.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              href="/dashboard"
              variant="outline"
              size="sm"
            >
              رفتن به میزکار
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

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="self-start lg:col-span-1">
            <div className="flex items-center gap-4">
              <Avatar
                name={user.username}
                size="lg"
              />

              <div className="min-w-0">
                <h2 className="truncate text-2xl">
                  {user.username}
                </h2>

                <p
                  dir="ltr"
                  className="truncate text-start text-base text-muted"
                >
                  {user.email || "ایمیلی ثبت نشده"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <Badge>
                {user.role === "TAILOR"
                  ? "حساب خیاط"
                  : "حساب مشتری"}
              </Badge>
            </div>

            <div className="mt-5 rounded-control bg-canvas p-4">
              <p className="text-base text-muted">
                اطلاعات این صفحه مربوط به حساب خودته و می‌تونی
                مشخصات پروفایل رو از همین‌جا تغییر بدی.
              </p>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
              <div>
                <p className="font-bold text-muted">
                  اطلاعات حساب
                </p>

                <h2 className="text-2xl">
                  مشخصات پروفایل
                </h2>
              </div>

              <Badge>قابل ویرایش</Badge>
            </div>

            <form
              key={`${profile.id}-${profile.updated_at}`}
              onSubmit={save}
              className="grid gap-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="نام کاربری"
                  value={user.username}
                  disabled
                  dir="ltr"
                  className="text-start"
                />

                <TextField
                  label="ایمیل"
                  value={user.email}
                  disabled
                  dir="ltr"
                  className="text-start"
                />

                {customer ? (
                  <>
                    <TextField
                      label="شماره تماس"
                      name="phone_number"
                      defaultValue={customer.phone_number}
                      dir="ltr"
                      className="text-start"
                      placeholder="09123456789"
                    />

                    <div className="md:col-span-2">
                      <TextField
                        label="آدرس"
                        name="address"
                        defaultValue={customer.address}
                        placeholder="شهر و نشانی خودت رو وارد کن"
                      />
                    </div>
                  </>
                ) : null}

                {tailor ? (
                  <>
                    <TextField
                      label="تخصص"
                      name="specialty"
                      defaultValue={tailor.specialty}
                      placeholder="مثلاً لباس مجلسی"
                    />

                    <TextField
                      label="قیمت شروع خدمات"
                      name="starting_price"
                      type="number"
                      min="0"
                      defaultValue={tailor.starting_price ?? ""}
                      hint="مبلغ به تومان"
                    />

                    <TextField
                      label="محل فعالیت"
                      name="work_location"
                      defaultValue={tailor.work_location}
                      placeholder="مثلاً تهران، سعادت‌آباد"
                    />

                    <TextField
                      label="ساعات کاری"
                      name="working_hours"
                      defaultValue={tailor.working_hours}
                      placeholder="مثلاً شنبه تا پنج‌شنبه، ۹ تا ۱۸"
                    />
                  </>
                ) : null}
              </div>

              {message ? (
                <p
                  role={success ? "status" : "alert"}
                  className={
                    success
                      ? "rounded-control bg-highlight-soft p-4 font-bold text-brand"
                      : "rounded-control border-2 border-accent p-4 font-bold text-accent"
                  }
                >
                  {message}
                </p>
              ) : null}

              <div className="flex justify-start">
                <Button
                  type="submit"
                  variant="accent"
                  disabled={saving}
                >
                  {saving
                    ? "در حال ذخیره…"
                    : "ذخیره تغییرات"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </PageShell>
  );
}