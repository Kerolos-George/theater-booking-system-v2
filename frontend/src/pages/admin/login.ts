import { adminLogin } from '../../api/admin.api'
import { ApiError } from '../../api/http'
import { setAdminSession } from '../../admin/session'

export function renderAdminLoginPage(): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface page-radial">
      <header class="bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 py-md px-margin-mobile md:px-margin-desktop">
        <div class="max-w-container-max mx-auto flex justify-between items-center">
          <span class="font-headline-md text-headline-md text-primary">PREMIER THEATER — Admin</span>
          <a href="#/" data-link class="font-body-md text-body-md text-on-surface-variant hover:text-primary">الموقع</a>
        </div>
      </header>
      <main class="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-xl">
        <div class="w-full max-w-md glass-card rounded-xl p-lg md:p-xl">
          <h1 class="font-headline-lg text-headline-lg-mobile text-primary mb-sm text-center">لوحة الإدارة</h1>
          <p class="font-body-md text-body-md text-on-surface-variant mb-lg text-center">تسجيل دخول المسؤول</p>
          <form id="adminLoginForm" class="space-y-lg">
            <div id="adminLoginError" class="hidden bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md font-body-md"></div>
            <div class="space-y-sm">
              <label class="block font-label-md text-on-surface-variant" for="adminEmail">البريد الإلكتروني</label>
              <input id="adminEmail" type="email" required autocomplete="email" dir="ltr"
                class="input-dark w-full rounded-lg py-md px-md text-on-surface font-body-md" placeholder="admin@gmail.com" />
            </div>
            <div class="space-y-sm">
              <label class="block font-label-md text-on-surface-variant" for="adminPassword">كلمة المرور</label>
              <input id="adminPassword" type="password" required autocomplete="current-password"
                class="input-dark w-full rounded-lg py-md px-md text-on-surface font-body-md" />
            </div>
            <button type="submit" id="adminLoginBtn"
              class="w-full bg-primary text-on-primary font-headline-md py-md rounded-lg hover:bg-primary-fixed-dim transition-colors">
              دخول
            </button>
          </form>
        </div>
      </main>
    </div>
  `
}

export function bindAdminLoginPage(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('#adminLoginForm')
  const errorEl = root.querySelector<HTMLDivElement>('#adminLoginError')
  const submitBtn = root.querySelector<HTMLButtonElement>('#adminLoginBtn')

  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!form || !submitBtn) return

    const email = (form.querySelector('#adminEmail') as HTMLInputElement).value
    const password = (form.querySelector('#adminPassword') as HTMLInputElement).value

    submitBtn.disabled = true
    submitBtn.textContent = 'جاري الدخول...'
    errorEl?.classList.add('hidden')

    void adminLogin(email, password)
      .then((res) => {
        setAdminSession(res.accessToken, res.admin)
        window.location.hash = '#/admin/bookings'
      })
      .catch((err: unknown) => {
        if (errorEl) {
          errorEl.textContent = err instanceof ApiError ? err.message : 'فشل تسجيل الدخول'
          errorEl.classList.remove('hidden')
        }
        submitBtn.disabled = false
        submitBtn.textContent = 'دخول'
      })
  })
}
