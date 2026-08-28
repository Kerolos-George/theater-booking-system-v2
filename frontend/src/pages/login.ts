import { login } from '../auth'
import { renderNav } from '../components/nav'

function renderAuthShell(title: string, subtitle: string, formHtml: string, footerHtml: string): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface page-radial">
      ${renderNav()}
      <main class="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-xl">
        <div class="w-full max-w-md">
          <div class="text-center mb-lg">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-md">
              <span class="material-symbols-outlined text-3xl text-primary">account_circle</span>
            </div>
            <h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-sm">${title}</h1>
            <p class="font-body-md text-body-md text-on-surface-variant">${subtitle}</p>
          </div>
          <div class="glass-card auth-card rounded-xl p-lg md:p-xl shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            ${formHtml}
            ${footerHtml}
          </div>
        </div>
      </main>
    </div>
  `
}

export function renderLoginPage(): string {
  return renderAuthShell(
    'تسجيل الدخول',
    'أدخل رقم الموبايل وكلمة المرور للمتابعة',
    `
      <form id="loginForm" class="space-y-lg">
        <div id="loginError" class="hidden bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md font-body-md text-body-md"></div>
        <div class="space-y-sm group gold-glow rounded-lg transition-all">
          <label class="block font-label-md text-label-md text-on-surface-variant" for="loginMobile">رقم الموبايل</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">smartphone</span>
            <input
              class="input-dark w-full rounded-lg py-md pl-md pr-12 text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md"
              dir="ltr"
              id="loginMobile"
              name="mobile"
              placeholder="01X XXXX XXXX"
              type="tel"
              required
              autocomplete="tel"
            />
          </div>
        </div>
        <div class="space-y-sm group gold-glow rounded-lg transition-all">
          <label class="block font-label-md text-label-md text-on-surface-variant" for="loginPassword">كلمة المرور</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">lock</span>
            <input
              class="input-dark w-full rounded-lg py-md pl-md pr-12 text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md"
              id="loginPassword"
              name="password"
              placeholder="أدخل كلمة المرور"
              type="password"
              required
              autocomplete="current-password"
            />
          </div>
        </div>
        <button
          type="submit"
          class="w-full bg-primary text-on-primary font-headline-md text-headline-md py-md rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-[0_4px_14px_rgba(242,202,80,0.4)] btn-primary-glow active:scale-[0.98]"
        >
          تسجيل الدخول
        </button>
      </form>
    `,
    `
      <p class="text-center font-body-md text-body-md text-on-surface-variant mt-lg pt-lg border-t border-outline-variant/20">
        ليس لديك حساب؟
        <a href="#/signup" data-link class="text-primary font-semibold hover:underline mr-1">إنشاء حساب جديد</a>
      </p>
    `,
  )
}

export function bindLoginPage(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('#loginForm')
  const errorEl = root.querySelector<HTMLDivElement>('#loginError')

  form?.addEventListener('submit', (event) => {
    event.preventDefault()

    const mobile = (form.querySelector('#loginMobile') as HTMLInputElement).value
    const password = (form.querySelector('#loginPassword') as HTMLInputElement).value
    const result = login(mobile, password)

    if (!result.ok) {
      if (errorEl) {
        errorEl.textContent = result.error ?? 'حدث خطأ'
        errorEl.classList.remove('hidden')
      }
      return
    }

    window.location.hash = '#/sections'
  })
}
