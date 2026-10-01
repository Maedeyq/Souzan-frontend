import { PageShell } from "@/components/layout/PageShell";
import { Section, SectionTitle } from "@/components/layout/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Window } from "@/components/ui/Window";

const STEPS = [
  { title: "درخواستت رو بنویس", text: "بگو چی می‌خوای، چه پارچه‌ای و بودجه‌ات چقدره." },
  { title: "پیشنهاد خیاط‌ها رو ببین", text: "هر خیاط قیمت و زمان دوخت رو می‌گه." },
  { title: "انتخاب کن و سفارش بده", text: "بعد از دوخت، نظرت رو برای بقیه بنویس." },
] as const;

const SAMPLE_PROPOSALS = [
  { name: "مریم احمدی", info: "۱۰ روز · ۴٬۵۰۰٬۰۰۰ تومان", selected: true },
  { name: "زهرا کریمی", info: "۷ روز · ۴٬۸۰۰٬۰۰۰ تومان", selected: false },
  { name: "نرگس حسینی", info: "۱۲ روز · ۵٬۲۰۰٬۰۰۰ تومان", selected: false },
] as const;

export default function HomePage() {
  return (
    <PageShell>
      <section className="bg-linear-to-b from-canvas to-surface py-12">
        <div className="mx-auto grid w-full max-w-page items-center gap-10 px-5 md:grid-cols-[1.05fr_.95fr]">
          <div>
            <h1 className="max-w-[15em] text-4xl leading-[1.55] md:text-5xl md:leading-[1.55]">
              خیاط مورد اعتمادت، فقط یک درخواست فاصله داره
            </h1>
            <p className="mt-4 max-w-[30em] text-xl text-muted">
              درخواستت رو بنویس. خیاط‌ها قیمت و زمان دوخت رو پیشنهاد می‌دن و تو بهترین رو انتخاب می‌کنی.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <Button href="/register" variant="accent">
                ثبت درخواست دوخت
              </Button>
              <Button href="#how" variant="outline">
                روش کار رو ببین
              </Button>
            </div>
          </div>

          <Window title="نمونه‌ی صفحه‌ی پیشنهادها">
            <div className="px-4.5 pt-4.5 pb-2">
              <h2 className="text-lg">لباس مجلسی بلند</h2>
              <p className="text-[15px] text-muted">۳ پیشنهاد دریافت شد</p>
            </div>
            {SAMPLE_PROPOSALS.map((item) => (
              <div
                key={item.name}
                className={"flex items-center gap-3 border-t border-line px-4.5 py-3.5 " + (item.selected ? "bg-highlight-soft" : "")}
              >
                <Avatar name={item.name} />
                <div className="min-w-0 flex-1 leading-relaxed">
                  <b className="block">{item.name}</b>
                  <span className="text-[15px] text-muted">{item.info}</span>
                </div>
                <span className={"inline-flex min-h-11 items-center rounded-control border-2 border-brand px-4 text-base font-extrabold " + (item.selected ? "bg-brand text-white" : "text-brand")}>
                  {item.selected ? "انتخاب" : "دیدن"}
                </span>
              </div>
            ))}
          </Window>
        </div>
      </section>

      <Section tone="canvas" id="how">
        <SectionTitle>چطور کار می‌کنه؟</SectionTitle>
        <ol className="relative grid gap-7 md:grid-cols-3">
          <span aria-hidden="true" className="absolute inset-x-[12%] top-7 hidden border-t-[6px] border-highlight md:block" />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative text-center">
              <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full border-[5px] border-canvas bg-brand text-2xl font-extrabold text-white">
                {(index + 1).toLocaleString("fa-IR")}
              </span>
              <h3 className="text-xl">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="tailors">
        <div className="grid justify-items-start gap-4 rounded-3xl bg-brand p-9 text-white">
          <h2 className="text-3xl text-white">خیاط هستی؟</h2>
          <p className="max-w-[34em] text-white/80">
            نمونه‌کارهات رو بذار، درخواست‌های مشتری‌ها رو ببین و برای هر کدوم پیشنهاد بده.
          </p>
          <Button href="/register?role=tailor" variant="highlight">
            ثبت‌نام به‌عنوان خیاط
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
