import { isLoggedIn } from '../auth'
import { renderNav } from '../components/nav'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEcKYynihGtuUYDZ_utKip7kchfcmj08G-cvLvogpVI7c-xebl394nyToMtZz1GkiFRbyvf1S0VTU4Xf1mIrMP7RFfFGwJcB7eYJhVpJseQNjTkVw_gnY3bNvjkr8Vv_0ktZUSWXKWsLO9vDZaOWd6nsUnN2-MkVGXIH33Bmy6KoHkohqh3a-NZAiHgdLpYuL26EWHe3dVIDtHx7C71LrTm6E74pP4g9N-EPMCIlBH7Jg0A2G8r14kQ'

const bookingSteps = [
  { step: 1, icon: 'weekend', title: 'اختر القسم المناسب' },
  { step: 2, icon: 'event_seat', title: 'حدد مقاعدك المفضلة' },
  { step: 3, icon: 'edit_document', title: 'أدخل بيانات الحضور' },
  { step: 4, icon: 'payments', title: 'ادفع عبر إنستا باي' },
  { step: 5, icon: 'upload_file', title: 'ارفع إثبات الدفع' },
  { step: 6, icon: 'verified', title: 'انتظر تأكيد الحجز', wide: true },
] as const

function renderHero(): string {
  const loggedIn = isLoggedIn()
  const ctaHref = loggedIn ? '#/sections' : '#/login'
  const ctaLabel = loggedIn ? 'ابدأ الحجز الآن' : 'احجز تذكرتك الآن'

  return `
    <section class="relative min-h-[921px] flex items-center justify-center px-margin-mobile md:px-margin-desktop overflow-hidden">
      <div class="absolute inset-0 z-0">
        <div
          class="bg-cover bg-center bg-no-repeat w-full h-full opacity-40"
          style="background-image: url('${HERO_IMAGE}')"
          role="img"
          aria-label="قاعة مسرح فاخرة بإضاءة ذهبية دافئة"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
      </div>
      <div class="relative z-10 w-full max-w-container-max mx-auto text-center flex flex-col items-center gap-lg">
        <div class="glass-panel px-lg py-sm rounded-full inline-flex items-center gap-sm mb-sm animate-fadeInUp">
          <span class="material-symbols-outlined filled text-primary text-[20px]">star</span>
          <span class="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">بريميير ثياتر</span>
        </div>
        <h1 class="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface max-w-4xl mx-auto leading-tight animate-fadeInUp [animation-delay:0.2s]">
          عِش التجربة المسرحية <span class="text-gradient">الأرقى</span>
        </h1>
        <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto animate-fadeInUp [animation-delay:0.4s]">
          احجز مقعدك الآن في قلب الحدث واستمتع بعروضنا الحصرية بتجربة حجز بسيطة وسريعة.
        </p>
        <div class="mt-xl animate-fadeInUp [animation-delay:0.6s]">
          <a
            href="${ctaHref}"
            data-link
            class="bg-primary text-on-primary font-headline-md text-headline-md px-xl py-md rounded-lg inline-flex items-center justify-center gap-md hover:bg-primary-fixed-dim transition-all duration-300 glow-effect active:scale-95 group"
          >
            <span>${ctaLabel}</span>
            <span class="material-symbols-outlined group-hover:-translate-x-2 transition-transform rtl:group-hover:translate-x-2">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  `
}

function renderSteps(): string {
  const cards = bookingSteps
    .map(
      ({ step, icon, title, wide }) => `
      <div class="glass-panel p-lg rounded-xl flex flex-col items-start gap-md relative overflow-hidden group hover:border-primary/50 transition-colors duration-300 ${wide ? 'lg:col-span-1 md:col-span-2' : ''}">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
        <div class="bg-surface-container-highest p-sm rounded-lg text-primary">
          <span class="material-symbols-outlined text-[32px]">${icon}</span>
        </div>
        <div>
          <div class="font-label-md text-label-md text-primary mb-xs">الخطوة ${step}</div>
          <h3 class="font-headline-md text-body-lg md:text-headline-md text-on-surface">${title}</h3>
        </div>
      </div>
    `,
    )
    .join('')

  return `
    <section class="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-y border-outline-variant/10 relative">
      <div class="w-full max-w-container-max mx-auto">
        <div class="text-center mb-xl">
          <h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">خطوات حجز مقعدك</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-sm">تجربة سلسة وموثوقة لضمان أفضل المقاعد</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          ${cards}
        </div>
      </div>
    </section>
  `
}

export function renderHomePage(): string {
  return `
    ${renderNav({ homeActive: true })}
    <main>
      ${renderHero()}
      ${renderSteps()}
    </main>
  `
}
