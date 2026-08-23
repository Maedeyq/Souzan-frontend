import { Button, FormField, Input, Select, Textarea } from "@/components/ui";

export const metadata = { title: "نمایش اجزای رابط کاربری | سوزن" };

export default function UiShowcasePage() {
  return (
    <main className="showcase-page">
      <div className="showcase-shell">
        <header className="showcase-header">
          <p className="eyebrow">سیستم طراحی سوزن</p>
          <h1>اجزای پایه رابط کاربری</h1>
          <p>این صفحه موقت برای بررسی رنگ‌ها، حالت‌ها، خوانایی فارسی و رفتار اجزا در اندازه‌های مختلف نمایشگر است.</p>
        </header>
        <div className="showcase-grid">
          <section className="showcase-card showcase-card--wide">
            <h2>رنگ‌های معنایی</h2>
            <div className="showcase-swatches">
              <div className="showcase-swatch showcase-swatch--primary">اصلی</div><div className="showcase-swatch showcase-swatch--success">موفقیت</div><div className="showcase-swatch showcase-swatch--warning">هشدار</div><div className="showcase-swatch showcase-swatch--error">خطا</div>
            </div>
          </section>
          <section className="showcase-card showcase-card--wide">
            <h2>دکمه‌ها و حالت‌ها</h2>
            <div className="showcase-row">
              <Button>دکمه اصلی</Button><Button variant="secondary">دکمه ثانویه</Button><Button variant="ghost">دکمه ساده</Button><Button variant="danger">حذف</Button><Button disabled>غیرفعال</Button><Button loading>در حال ذخیره</Button>
            </div>
          </section>
          <section className="showcase-card showcase-card--wide">
            <h2>فیلدهای فرم</h2>
            <form className="showcase-form">
              <FormField label="نام و نام خانوادگی" required hint="نام خود را به فارسی وارد کنید."><Input placeholder="مثلاً سارا احمدی" /></FormField>
              <FormField label="شماره تماس" htmlFor="showcase-phone"><Input inputMode="tel" placeholder="۰۹۱۲۱۲۳۴۵۶۷" /></FormField>
              <FormField label="شهر" htmlFor="showcase-city"><Select defaultValue=""><option value="" disabled>یک شهر انتخاب کنید</option><option value="tehran">تهران</option><option value="shiraz">شیراز</option><option value="tabriz">تبریز</option></Select></FormField>
              <FormField label="فیلد غیرفعال" htmlFor="showcase-disabled"><Input value="این مقدار قابل تغییر نیست" disabled readOnly /></FormField>
              <FormField className="showcase-span" label="توضیحات سفارش" htmlFor="showcase-description" hint="حداکثر ۵۰۰ نویسه"><Textarea placeholder="درباره مدل، پارچه و زمان موردنظر بنویسید…" maxLength={500} /></FormField>
              <FormField className="showcase-span" label="کد تخفیف" htmlFor="showcase-code" error="این کد معتبر نیست."><Input defaultValue="SOUZAN" /></FormField>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
