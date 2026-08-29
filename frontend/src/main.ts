import './style.css'
import { isLoggedIn } from './auth'
import { isAdminLoggedIn } from './admin/session'
import { bindNav } from './components/nav'
import { bindBookingsPage, renderBookingsPage } from './pages/bookings'
import { bindConfirmationPage, renderConfirmationPage } from './pages/confirmation'
import { renderHomePage } from './pages/home'
import { bindLoginPage, renderLoginPage } from './pages/login'
import { bindPaymentPage, renderPaymentPage } from './pages/payment'
import { bindSectionsPage, renderSectionsPage } from './pages/sections'
import { bindSeatsPage, renderSeatsPage } from './pages/seats'
import { bindSignupPage, renderSignupPage } from './pages/signup'
import { bindSummaryPage, renderSummaryPage } from './pages/summary'
import { bindAdminLoginPage, renderAdminLoginPage } from './pages/admin/login'
import { bindAdminBookingsPage, renderAdminBookingsPage } from './pages/admin/bookings'
import { bindAdminEntryPage, renderAdminEntryPage } from './pages/admin/entry'

const app = document.querySelector<HTMLDivElement>('#app')!

const PROTECTED_ROUTES = ['/sections', '/seats', '/summary', '/payment', '/confirmation', '/bookings']

function getRoute(): string {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  return hash.startsWith('/') ? hash : `/${hash}`
}

function requiresAuth(route: string): boolean {
  return PROTECTED_ROUTES.some((r) => route.startsWith(r))
}

function isAdminRoute(route: string): boolean {
  return route.startsWith('/admin')
}

function render(): void {
  let route = getRoute()

  if (isAdminRoute(route)) {
    if (!route.startsWith('/admin/login') && !isAdminLoggedIn()) {
      window.location.hash = '#/admin/login'
      route = '/admin/login'
    } else if (route.startsWith('/admin/login') && isAdminLoggedIn()) {
      window.location.hash = '#/admin/bookings'
      route = '/admin/bookings'
    }

    if (route.startsWith('/admin/login')) {
      document.title = 'بريميير ثياتر - دخول الإدارة'
      app.innerHTML = renderAdminLoginPage()
      bindAdminLoginPage(app)
      return
    }

    if (route.startsWith('/admin/bookings')) {
      document.title = 'بريميير ثياتر - إدارة الحجوزات'
      app.innerHTML = renderAdminBookingsPage()
      bindAdminBookingsPage(app)
      return
    }

    if (route.startsWith('/admin/entry')) {
      document.title = 'بريميير ثياتر - التحقق من الكود'
      app.innerHTML = renderAdminEntryPage()
      bindAdminEntryPage(app)
      return
    }

    window.location.hash = '#/admin/bookings'
    return
  }

  if (requiresAuth(route) && !isLoggedIn()) {
    window.location.hash = '#/login'
    route = '/login'
  } else if ((route.startsWith('/login') || route.startsWith('/signup')) && isLoggedIn()) {
    window.location.hash = '#/sections'
    route = '/sections'
  }

  if (route.startsWith('/signup')) {
    document.title = 'بريميير ثياتر - إنشاء حساب'
    app.innerHTML = renderSignupPage()
    bindSignupPage(app)
  } else if (route.startsWith('/login')) {
    document.title = 'بريميير ثياتر - تسجيل الدخول'
    app.innerHTML = renderLoginPage()
    bindLoginPage(app)
  } else if (route.startsWith('/bookings')) {
    document.title = 'بريميير ثياتر - حجوزاتي'
    app.innerHTML = renderBookingsPage()
    bindBookingsPage(app)
  } else if (route.startsWith('/confirmation')) {
    document.title = 'بريميير ثياتر - تأكيد الحجز'
    app.innerHTML = renderConfirmationPage()
    bindConfirmationPage(app)
  } else if (route.startsWith('/payment')) {
    document.title = 'بريميير ثياتر - الدفع'
    app.innerHTML = renderPaymentPage()
    bindPaymentPage(app)
  } else if (route.startsWith('/summary')) {
    document.title = 'بريميير ثياتر - ملخص الحجز'
    app.innerHTML = renderSummaryPage()
    bindSummaryPage(app)
  } else if (route.startsWith('/seats')) {
    document.title = 'بريميير ثياتر - اختيار المقاعد'
    app.innerHTML = renderSeatsPage()
    bindSeatsPage(app)
  } else if (route.startsWith('/sections')) {
    document.title = 'بريميير ثياتر - اختر القسم'
    app.innerHTML = renderSectionsPage()
    bindSectionsPage(app)
  } else {
    document.title = 'بريميير ثياتر - عِش التجربة المسرحية الأرقى'
    app.innerHTML = renderHomePage()
  }

  bindNav(app)
}

window.addEventListener('hashchange', render)
render()
