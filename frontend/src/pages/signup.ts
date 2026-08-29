import { signup } from '../api/auth.api'
import { ApiError } from '../api/http'
import { renderNav } from '../components/nav'

function renderAuthShell(title: string, subtitle: string, formHtml: string, footerHtml: string): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface page-radial">
      ${renderNav()}
      <main class="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-xl">
        <div class="w-full max-w-md">
          <div class="text-center mb-lg">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-md">
              <span class="material-symbols-outlined text-3xl text-primary">person_add</span>
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

export function renderSignupPage(): string {
  return renderAuthShell(
    'إنشاء حساب',
    'سجّل حسابك للبدء في حجز التذاكر',
    `
      <form id="signupForm" class="space-y-lg">
        <div id="signupError" class="hidden bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md font-body-md text-body-md"></div>
        <div class="space-y-sm group gold-glow rounded-lg transition-all">
          <label class="block font-label-md text-label-md text-on-surface-variant" for="signupName">الاسم بالكامل</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">person</span>
            <input class="input-dark w-full rounded-lg py-md pl-md pr-12 text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md" id="signupName" name="name" placeholder="أدخل اسمك الثلاثي" type="text" required autocomplete="name" />
          </div>
        </div>
        <div class="space-y-sm group gold-glow rounded-lg transition-all">
          <label class="block font-label-md text-label-md text-on-surface-variant" for="signupMobile">رقم الموبايل</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">smartphone</span>
            <input class="input-dark w-full rounded-lg py-md pl-md pr-12 text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md" dir="ltr" id="signupMobile" name="mobile" placeholder="01X XXXX XXXX" type="tel" required autocomplete="tel" />
          </div>
        </div>
        <div class="space-y-sm group gold-glow rounded-lg transition-all">
          <label class="block font-label-md text-label-md text-on-surface-variant" for="signupPassword">كلمة المرور</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">lock</span>
            <input class="input-dark w-full rounded-lg py-md pl-md pr-12 text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md" id="signupPassword" name="password" placeholder="6 أحرف على الأقل" type="password" required minlength="6" autocomplete="new-password" />
          </div>
        </div>
        <div class="space-y-sm group gold-glow rounded-lg transition-all">
          <label class="block font-label-md text-label-md text-on-surface-variant" for="signupConfirmPassword">تأكيد كلمة المرور</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">lock_reset</span>
            <input class="input-dark w-full rounded-lg py-md pl-md pr-12 text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md" id="signupConfirmPassword" name="confirmPassword" placeholder="أعد إدخال كلمة المرور" type="password" required minlength="6" autocomplete="new-password" />
          </div>
        </div>
        <button type="submit" id="signupSubmitBtn" class="w-full bg-primary text-on-primary font-headline-md text-headline-md py-md rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-[0_4px_14px_rgba(242,202,80,0.4)] btn-primary-glow active:scale-[0.98]">
          إنشاء حساب
        </button>
      </form>
    `,
    `
      <p class="text-center font-body-md text-body-md text-on-surface-variant mt-lg pt-lg border-t border-outline-variant/20">
        لديك حساب بالفعل؟
        <a href="#/login" data-link class="text-primary font-semibold hover:underline mr-1">تسجيل الدخول</a>
      </p>
    `,
  )
}

export function bindSignupPage(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('#signupForm')
  const errorEl = root.querySelector<HTMLDivElement>('#signupError')
  const submitBtn = root.querySelector<HTMLButtonElement>('#signupSubmitBtn')

  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!form || !submitBtn) return

    const name = (form.querySelector('#signupName') as HTMLInputElement).value
    const mobile = (form.querySelector('#signupMobile') as HTMLInputElement).value
    const password = (form.querySelector('#signupPassword') as HTMLInputElement).value
    const confirmPassword = (form.querySelector('#signupConfirmPassword') as HTMLInputElement).value

    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'كلمتا المرور غير متطابقتين'
        errorEl.classList.remove('hidden')
      }
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'جاري الإنشاء...'
    errorEl?.classList.add('hidden')

    void signup(name, mobile, password, confirmPassword)
      .then(() => {
        window.location.hash = '#/sections'
      })
      .catch((err: unknown) => {
        if (errorEl) {
          errorEl.textContent = err instanceof ApiError ? err.message : 'حدث خطأ'
          errorEl.classList.remove('hidden')
        }
        submitBtn.disabled = false
        submitBtn.textContent = 'إنشاء حساب'
      })
  })
}
