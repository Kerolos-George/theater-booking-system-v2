import { adminLogout, getAdminUser } from '../admin/session'

export type AdminNavTab = 'bookings' | 'entry'

export function renderAdminNav(active: AdminNavTab): string {
  const admin = getAdminUser()
  const bookingsClass =
    active === 'bookings' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'
  const entryClass =
    active === 'entry' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'

  return `
    <header class="bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-md">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
          <div>
            <h1 class="font-headline-md text-headline-md text-primary">لوحة الإدارة</h1>
            <p class="font-caption text-caption text-on-surface-variant">${admin?.email ?? ''}</p>
          </div>
          <button type="button" id="adminLogoutBtn" class="text-primary hover:bg-white/5 p-sm rounded-lg flex items-center gap-xs self-start">
            <span class="material-symbols-outlined">logout</span>
            خروج
          </button>
        </div>
        <nav class="flex gap-lg font-body-md">
          <a href="#/admin/bookings" data-link class="${bookingsClass} pb-1 transition-colors">الحجوزات</a>
          <a href="#/admin/entry" data-link class="${entryClass} pb-1 transition-colors">التحقق من الكود</a>
        </nav>
      </div>
    </header>
  `
}

export function bindAdminNav(root: HTMLElement): void {
  root.querySelector('#adminLogoutBtn')?.addEventListener('click', () => {
    adminLogout()
    window.location.hash = '#/admin/login'
  })
}
