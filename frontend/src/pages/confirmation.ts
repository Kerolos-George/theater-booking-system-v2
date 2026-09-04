import html2canvas from 'html2canvas'
import { fetchBooking } from '../api/bookings.api'
import type { Booking } from '../api/types'
import { ApiError } from '../api/http'
import { getActiveBookingId } from '../booking/session'
import { formatBookingDate } from '../booking/utils'

function renderHeader(): string {
  return `
    <header class="w-full bg-surface-container-lowest py-lg border-b border-outline-variant/10 z-50 sticky top-0">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-center items-center">
        <div class="flex items-center gap-sm">
          <span class="material-symbols-outlined text-primary filled">check_circle</span>
          <span class="font-headline-md text-headline-md text-primary tracking-tight">PREMIER THEATER</span>
        </div>
      </div>
    </header>
  `
}

function renderEmptyState(message?: string): string {
  return `
    <div class="glass-card rounded-xl p-xl text-center max-w-lg mx-auto">
      <span class="material-symbols-outlined text-primary text-[48px] mb-md">receipt_long</span>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm">لا يوجد حجز</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-lg">${message ?? 'لم يتم العثور على طلب حجز.'}</p>
      <a href="#/bookings" data-link class="inline-flex bg-primary text-on-primary font-label-md text-label-md font-bold py-3 px-8 rounded-lg transition-all duration-300">حجوزاتي</a>
    </div>
  `
}

function renderSeatRows(booking: Booking): string {
  return booking.seats
    .map(
      (seat) => `
      <li class="flex justify-between items-center gap-md border-b border-outline-variant/10 pb-xs last:border-0 last:pb-0">
        <span class="font-body-md text-body-md text-on-surface">مقعد ${seat.label} — ${booking.section.labelAr}</span>
        <span class="font-body-md text-body-md text-on-surface-variant shrink-0">${seat.attendeeName}</span>
      </li>
    `,
    )
    .join('')
}

function renderConfirmationContent(booking: Booking): string {
  return `
    <div class="text-center mb-xl confirmation-fade-in">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-md">
        <span class="material-symbols-outlined text-5xl text-primary drop-shadow-md filled">celebration</span>
      </div>
      <h1 class="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-sm">تم استلام طلب الحجز بنجاح!</h1>
      <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">شكراً لاختيارك Premier Theater. جاري مراجعة طلبك وإعداد التذاكر الخاصة بك.</p>
    </div>

    <div id="invoiceCard" class="glass-card confirmation-card rounded-xl w-full max-w-2xl p-lg md:p-xl relative overflow-hidden">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant/30 pb-md mb-md gap-md">
        <div>
          <h2 class="font-headline-md text-headline-md text-on-surface">إيصال الحجز</h2>
          <p class="font-caption text-caption text-on-surface-variant mt-xs">رقم الحجز: <span class="text-primary font-mono tracking-widest">#${booking.ref}</span></p>
        </div>
        <div class="bg-surface-container-high px-md py-sm rounded-lg border border-outline-variant/20 flex items-center gap-sm">
          <span class="material-symbols-outlined text-tertiary-container">pending_actions</span>
          <span class="font-label-md text-label-md text-tertiary-container">في انتظار تأكيد الإدارة</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
        <div class="flex items-start gap-sm">
          <span class="material-symbols-outlined text-on-surface-variant mt-1">calendar_today</span>
          <div>
            <p class="font-caption text-caption text-on-surface-variant">تاريخ الحجز</p>
            <p class="font-body-md text-body-md text-on-surface">${formatBookingDate(booking.createdAt)}</p>
          </div>
        </div>
        <div class="flex items-start gap-sm">
          <span class="material-symbols-outlined text-on-surface-variant mt-1">person</span>
          <div>
            <p class="font-caption text-caption text-on-surface-variant">الاسم</p>
            <p class="font-body-md text-body-md text-on-surface">${booking.contactName}</p>
          </div>
        </div>
        <div class="flex items-start gap-sm">
          <span class="material-symbols-outlined text-on-surface-variant mt-1">mail</span>
          <div>
            <p class="font-caption text-caption text-on-surface-variant">البريد الإلكتروني</p>
            <p class="font-body-md text-body-md text-on-surface font-mono" dir="ltr">${booking.email}</p>
          </div>
        </div>
        <div class="flex items-start gap-sm">
          <span class="material-symbols-outlined text-on-surface-variant mt-1">chat</span>
          <div>
            <p class="font-caption text-caption text-on-surface-variant">واتساب</p>
            <p class="font-body-md text-body-md text-on-surface font-mono" dir="ltr">${booking.whatsapp}</p>
          </div>
        </div>
      </div>

      <div class="bg-surface-container/50 rounded-lg p-md border border-outline-variant/10 mb-lg">
        <h3 class="font-label-md text-label-md text-on-surface-variant mb-sm flex items-center gap-xs">
          <span class="material-symbols-outlined text-sm">event_seat</span>
          تفاصيل المقاعد
        </h3>
        <ul class="space-y-sm">${renderSeatRows(booking)}</ul>
      </div>

      <div class="flex justify-between items-end pt-md border-t border-outline-variant/30">
        <span class="font-headline-md text-headline-md text-on-surface">إجمالي المبلغ</span>
        <span class="font-display-lg text-display-lg text-primary">${booking.totalAmount} <span class="text-headline-md font-headline-md text-primary">ج.م</span></span>
      </div>
    </div>

    <div class="mt-xl max-w-2xl w-full bg-surface-container-high/80 border border-primary/20 rounded-lg p-md flex items-start gap-md">
      <span class="material-symbols-outlined text-primary text-3xl shrink-0">mail</span>
      <p class="font-body-md text-body-md text-on-surface leading-relaxed">
        <strong class="text-primary">تنبيه هام:</strong>
        سيتم إرسال كود الدخول والتذاكر الإلكترونية إلى البريد الإلكتروني المسجل أعلاه بعد تأكيد الإدارة.
      </p>
    </div>

    <div class="mt-xl flex flex-col sm:flex-row gap-md w-full max-w-md justify-center">
      <button type="button" id="downloadInvoiceBtn" class="flex-1 bg-transparent border-2 border-primary text-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-xs">
        <span class="material-symbols-outlined text-sm">download</span>
        تحميل الفاتورة
      </button>
      <a href="#/bookings" data-link class="flex-1 bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-xs font-bold">
        حجوزاتي
        <span class="material-symbols-outlined text-sm">event_seat</span>
      </a>
    </div>
  `
}

export function renderConfirmationPage(): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-background overflow-x-hidden">
      ${renderHeader()}
      <main id="confirmationMain" class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center relative">
        <div class="text-center py-xl text-on-surface-variant font-body-md">جاري تحميل تأكيد الحجز...</div>
      </main>
    </div>
  `
}

async function downloadInvoiceAsJpg(root: HTMLElement, bookingRef: string): Promise<void> {
  const card = root.querySelector<HTMLElement>('#invoiceCard')
  const btn = root.querySelector<HTMLButtonElement>('#downloadInvoiceBtn')
  if (!card) return

  const originalText = btn?.innerHTML
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> جاري التحميل...'
  }

  try {
    const canvas = await html2canvas(card, { backgroundColor: '#131313', scale: 2, useCORS: true })
    await new Promise<void>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image'))
            return
          }
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `Premier-Theater-${bookingRef}.jpg`
          document.body.appendChild(link)
          link.click()
          link.remove()
          URL.revokeObjectURL(url)
          resolve()
        },
        'image/jpeg',
        0.92,
      )
    })
  } finally {
    if (btn) {
      btn.disabled = false
      if (originalText) btn.innerHTML = originalText
    }
  }
}

export function bindConfirmationPage(root: HTMLElement): void {
  const main = root.querySelector<HTMLElement>('#confirmationMain')
  const bookingId = getActiveBookingId()

  if (!bookingId) {
    if (main) main.innerHTML = renderEmptyState()
    return
  }

  void fetchBooking(bookingId)
    .then((booking) => {
      if (!main) return
      if (booking.status === 'UNPAID') {
        main.innerHTML = renderEmptyState('لم يتم رفع إثبات الدفع بعد.')
        return
      }
      main.innerHTML = renderConfirmationContent(booking)
      root.querySelector('#downloadInvoiceBtn')?.addEventListener('click', () => {
        void downloadInvoiceAsJpg(root, booking.ref)
      })
    })
    .catch((err: unknown) => {
      if (main) {
        main.innerHTML = renderEmptyState(err instanceof ApiError ? err.message : undefined)
      }
    })
}
