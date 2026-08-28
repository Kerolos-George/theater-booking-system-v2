import { getCurrentUser, isLoggedIn, logout } from '../auth'

export function renderNav(options?: {
  homeActive?: boolean
  bookingsActive?: boolean
}): string {
  const homeClass = options?.homeActive
    ? 'text-primary font-semibold border-b-2 border-primary pb-1'
    : 'text-on-surface-variant hover:text-primary'
  const bookingsClass = options?.bookingsActive
    ? 'text-primary font-semibold border-b-2 border-primary pb-1'
    : 'text-on-surface-variant hover:text-primary'

  const user = getCurrentUser()
  const loggedIn = isLoggedIn()

  const accountControl = loggedIn
    ? `
        <span class="hidden sm:inline font-body-md text-body-md text-on-surface-variant max-w-[120px] truncate">${user?.name ?? ''}</span>
        <button
          type="button"
          id="logoutBtn"
          class="hover:bg-white/5 transition-all duration-300 p-sm rounded-full flex items-center gap-xs text-primary"
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
        >
          <span class="material-symbols-outlined">logout</span>
        </button>
      `
    : `
        <a href="#/login" data-link class="hover:bg-white/5 transition-all duration-300 p-sm rounded-full" aria-label="تسجيل الدخول">
          <span class="material-symbols-outlined">account_circle</span>
        </a>
      `

  return `
    <header class="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/20 shadow-md">
      <div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-md w-full max-w-container-max mx-auto">
        <a href="#/" data-link class="font-display-lg text-headline-md md:text-display-lg font-bold text-primary tracking-tighter">
          PREMIER THEATER
        </a>
        <nav class="hidden md:flex items-center gap-lg">
          <a class="${homeClass} font-body-md text-body-md hover:bg-white/5 transition-all duration-300" href="#/" data-link>الرئيسية</a>
          ${loggedIn ? `<a class="${bookingsClass} font-body-md text-body-md hover:bg-white/5 transition-all duration-300" href="#/bookings" data-link>حجوزاتي</a>` : ''}
        </nav>
        <div class="flex items-center gap-md text-primary">
          <button type="button" class="hover:bg-white/5 transition-all duration-300 p-sm rounded-full" aria-label="تغيير اللغة">
            <span class="material-symbols-outlined">language</span>
          </button>
          ${accountControl}
        </div>
      </div>
    </header>
  `
}

export function bindNav(root: HTMLElement): void {
  root.querySelector('#logoutBtn')?.addEventListener('click', () => {
    logout()
    window.location.hash = '#/'
  })
}
