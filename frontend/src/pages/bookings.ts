import { fetchMyBookings, uploadPaymentProof } from '../api/bookings.api'
import type { Booking } from '../api/types'
import { ApiError } from '../api/http'
import {
  compareSeatLabels,
  formatBookingDate,
  normalizeStatus,
  STATUS_LABELS,
  type BookingStatus,
} from '../booking/utils'
import { renderNav } from '../components/nav'
import { INSTAPAY } from '../constants'

function statusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case 'unpaid':
      return 'bg-error-container/30 text-on-error-container border-error-container/50'
    case 'pending':
      return 'bg-tertiary-container/20 text-tertiary-fixed border-tertiary-container/40'
    case 'confirmed':
      return 'bg-primary/15 text-primary border-primary/30'
    case 'canceled':
      return 'bg-surface-container-high/50 text-on-surface-variant border-outline-variant/30'
  }
}

function statusIcon(status: BookingStatus): string {
  switch (status) {
    case 'unpaid':
      return 'payments'
    case 'pending':
      return 'pending_actions'
    case 'confirmed':
      return 'verified'
    case 'canceled':
      return 'cancel'
  }
}

function renderInstapayBox(bookingId: string): string {
  return `
    <div class="mt-md pt-md border-t border-outline-variant/20">
      <p class="font-label-md text-label-md text-on-surface-variant mb-sm">الدفع عبر إنستا باي</p>
      <div class="bg-surface-dim rounded-lg p-md border border-outline-variant/30 mb-md">
        <div class="flex items-center justify-between gap-sm mb-xs">
          <span class="font-body-md text-body-md text-primary dir-ltr">${INSTAPAY.number}</span>
          <button type="button" class="copy-insta-btn flex items-center text-primary hover:text-primary-fixed transition-colors p-1 rounded-md hover:bg-white/5" data-copy="${INSTAPAY.number}" aria-label="نسخ رقم إنستا باي">
            <span class="material-symbols-outlined text-xl">content_copy</span>
          </button>
        </div>
        <span class="font-caption text-caption text-on-surface-variant block">${INSTAPAY.ownerName}</span>
        <span class="font-caption text-caption text-on-surface-variant/70 dir-ltr block">${INSTAPAY.address}</span>
      </div>
      <input type="file" id="proof-${bookingId}" accept="image/jpeg,image/png,image/jpg" class="hidden proof-input" data-booking-id="${bookingId}" />
      <label for="proof-${bookingId}" class="proof-upload-area border-2 border-dashed border-outline-variant rounded-lg p-md text-center bg-surface-container-highest/50 hover:bg-surface-container-highest hover:border-primary transition-all cursor-pointer flex flex-col items-center gap-sm" data-booking-id="${bookingId}">
        <span class="material-symbols-outlined text-3xl text-on-surface-variant proof-icon" data-booking-id="${bookingId}">upload_file</span>
        <span class="font-body-md text-body-md text-on-surface proof-title" data-booking-id="${bookingId}">ارفع صورة إثبات الدفع</span>
        <span class="font-caption text-caption text-outline">JPG, PNG</span>
      </label>
      <button type="button" class="submit-proof-btn w-full mt-md bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed" data-booking-id="${bookingId}" disabled>
        إرسال إثبات الدفع
      </button>
      <p class="proof-error hidden font-caption text-caption text-error mt-sm" data-booking-id="${bookingId}"></p>
    </div>
  `
}

function renderSeatsList(seats: Booking['seats']): string {
  const sorted = [...seats].sort((a, b) => compareSeatLabels(a.label, b.label))

  return sorted
    .map(
      (seat) => `
        <div class="flex items-center justify-between gap-sm bg-surface-container-high/60 rounded-lg px-sm py-xs">
          <span class="font-label-md text-label-md text-primary font-mono">${seat.label}</span>
          <span class="font-body-md text-body-md text-on-surface truncate">${seat.attendeeName}</span>
        </div>
      `,
    )
    .join('')
}

function renderBookingCard(booking: Booking): string {
  const status = normalizeStatus(booking.status)

  let statusContent = ''

  if (status === 'unpaid') {
    statusContent = booking.paymentProcessing
      ? `
      <div class="mt-md bg-tertiary-container/10 border border-tertiary-container/30 rounded-lg p-md flex items-start gap-sm">
        <span class="material-symbols-outlined text-tertiary-container shrink-0">hourglass_top</span>
        <div>
          <p class="font-body-md text-body-md text-on-surface mb-xs">جاري تفعيل إثبات الدفع</p>
          <p class="font-caption text-caption text-on-surface-variant">تم استلام الصورة وسيتم تحديث حالة الحجز تلقائياً خلال لحظات.</p>
        </div>
      </div>
    `
      : `
      <p class="font-body-md text-body-md text-on-surface-variant mb-sm">يرجى إتمام الدفع ورفع صورة إثبات التحويل لتفعيل الحجز.</p>
      ${renderInstapayBox(booking.id)}
    `
  } else if (status === 'pending') {
    statusContent = `
      <div class="mt-md bg-tertiary-container/10 border border-tertiary-container/30 rounded-lg p-md flex items-start gap-sm">
        <span class="material-symbols-outlined text-tertiary-container shrink-0">hourglass_top</span>
        <div>
          <p class="font-body-md text-body-md text-on-surface mb-xs">في انتظار تأكيد الإدارة</p>
          <p class="font-caption text-caption text-on-surface-variant">تم استلام إثبات الدفع. سيتم مراجعة طلبك وإرسال كود الدخول على بريدك الإلكتروني بعد التأكيد.</p>
        </div>
      </div>
    `
  } else if (status === 'confirmed') {
    statusContent = `
      <div class="mt-md bg-primary/10 border border-primary/30 rounded-lg p-md">
        <div class="flex items-center gap-sm mb-sm">
          <span class="material-symbols-outlined text-primary filled">mark_chat_unread</span>
          <p class="font-label-md text-label-md text-primary">كود الدخول</p>
        </div>
        <p class="font-display-lg text-display-lg text-primary font-mono tracking-widest text-center py-sm" dir="ltr">${booking.entryCode ?? '—'}</p>
        <p class="font-caption text-caption text-on-surface-variant text-center mt-xs">تم إرسال هذا الكود أيضاً إلى بريدك الإلكتروني</p>
      </div>
    `
  }

  return `
    <article class="glass-card rounded-xl p-lg md:p-xl border border-outline-variant/10" data-booking-id="${booking.id}">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md mb-md">
        <div>
          <p class="font-caption text-caption text-on-surface-variant mb-xs">رقم الحجز</p>
          <h2 class="font-headline-md text-headline-md text-primary font-mono tracking-wide">#${booking.ref}</h2>
          <p class="font-caption text-caption text-on-surface-variant mt-xs">${formatBookingDate(booking.createdAt)}</p>
        </div>
        <span class="inline-flex items-center gap-xs px-md py-xs rounded-full border font-label-md text-label-md shrink-0 ${statusBadgeClass(status)}">
          <span class="material-symbols-outlined text-sm filled">${statusIcon(status)}</span>
          ${STATUS_LABELS[status]}
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
        <div>
          <p class="font-caption text-caption text-on-surface-variant">القسم</p>
          <p class="font-body-md text-body-md text-on-surface">${booking.section.labelAr}</p>
        </div>
        <div class="sm:col-span-2">
          <p class="font-caption text-caption text-on-surface-variant mb-xs">المقاعد والحضور</p>
          <div class="flex flex-col gap-1 mt-1">${renderSeatsList(booking.seats)}</div>
        </div>
        <div>
          <p class="font-caption text-caption text-on-surface-variant">الاسم</p>
          <p class="font-body-md text-body-md text-on-surface">${booking.contactName}</p>
        </div>
        <div>
          <p class="font-caption text-caption text-on-surface-variant">البريد الإلكتروني</p>
          <p class="font-body-md text-body-md text-on-surface font-mono" dir="ltr">${booking.email}</p>
        </div>
        <div>
          <p class="font-caption text-caption text-on-surface-variant">واتساب</p>
          <p class="font-body-md text-body-md text-on-surface font-mono" dir="ltr">${booking.whatsapp}</p>
        </div>
      </div>
      <div class="flex justify-between items-center pt-md border-t border-outline-variant/20">
        <span class="font-label-md text-label-md text-on-surface-variant">الإجمالي</span>
        <span class="font-headline-md text-headline-md text-primary">${booking.totalAmount} ج.م</span>
      </div>
      ${statusContent}
    </article>
  `
}

function renderEmptyState(): string {
  return `
    <div class="glass-card rounded-xl p-xl text-center max-w-lg mx-auto">
      <span class="material-symbols-outlined text-primary text-[48px] mb-md">event_seat</span>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm">لا توجد حجوزات</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-lg">لم تقم بأي حجز بعد. ابدأ بحجز تذكرتك الآن!</p>
      <a href="#/sections" data-link class="inline-flex bg-primary text-on-primary font-label-md text-label-md font-bold py-3 px-8 rounded-lg btn-primary-glow transition-all duration-300">احجز الآن</a>
    </div>
  `
}

export function renderBookingsPage(): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface page-radial">
      ${renderNav({ bookingsActive: true })}
      <main class="flex-grow px-margin-mobile md:px-margin-desktop py-xl max-w-container-max mx-auto w-full">
        <div class="mb-xl">
          <h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-sm">حجوزاتي</h1>
          <p class="font-body-md text-body-md text-on-surface-variant">تابع حالة حجوزاتك وارفع إثبات الدفع للحجوزات غير المدفوعة.</p>
        </div>
        <div id="bookingsError" class="hidden mb-lg bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md text-center font-body-md"></div>
        <div id="bookingsList" class="space-y-lg">
          <div class="text-center py-xl text-on-surface-variant font-body-md">جاري تحميل الحجوزات...</div>
        </div>
      </main>
    </div>
  `
}

export function bindBookingsPage(root: HTMLElement): void {
  const listEl = root.querySelector<HTMLDivElement>('#bookingsList')
  const errorEl = root.querySelector<HTMLDivElement>('#bookingsError')

  void fetchMyBookings()
    .then((bookings) => {
      if (!listEl) return
      listEl.innerHTML =
        bookings.length === 0
          ? renderEmptyState()
          : bookings.map(renderBookingCard).join('')
      bindBookingsInteractions(root)
    })
    .catch((err: unknown) => {
      if (listEl) listEl.innerHTML = ''
      if (errorEl) {
        errorEl.textContent = err instanceof ApiError ? err.message : 'تعذر تحميل الحجوزات'
        errorEl.classList.remove('hidden')
      }
    })
}

function bindBookingsInteractions(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('.copy-insta-btn').forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      event.stopPropagation()
      const text = btn.dataset.copy
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        btn.innerHTML = '<span class="material-symbols-outlined text-xl">check</span>'
        window.setTimeout(() => {
          btn.innerHTML = '<span class="material-symbols-outlined text-xl">content_copy</span>'
        }, 2000)
      } catch {
        // Clipboard unavailable
      }
    })
  })

  const selectedFiles = new Map<string, File>()

  root.querySelectorAll<HTMLInputElement>('.proof-input').forEach((input) => {
    input.addEventListener('change', () => {
      const bookingId = input.dataset.bookingId
      if (!bookingId) return
      const file = input.files?.[0]
      const submitBtn = root.querySelector<HTMLButtonElement>(`.submit-proof-btn[data-booking-id="${bookingId}"]`)
      const title = root.querySelector(`.proof-title[data-booking-id="${bookingId}"]`)
      const icon = root.querySelector(`.proof-icon[data-booking-id="${bookingId}"]`)
      if (!file) {
        selectedFiles.delete(bookingId)
        submitBtn?.setAttribute('disabled', '')
        return
      }
      selectedFiles.set(bookingId, file)
      if (title) title.textContent = file.name
      if (icon) icon.textContent = 'check_circle'
      submitBtn?.removeAttribute('disabled')
    })
  })

  root.querySelectorAll<HTMLButtonElement>('.submit-proof-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bookingId = btn.dataset.bookingId
      if (!bookingId) return
      const file = selectedFiles.get(bookingId)
      const errorEl = root.querySelector<HTMLElement>(`.proof-error[data-booking-id="${bookingId}"]`)
      if (!file) return

      btn.disabled = true
      btn.textContent = 'جاري الإرسال...'

      void uploadPaymentProof(bookingId, file)
        .then(() => {
          window.location.hash = '#/bookings'
          window.dispatchEvent(new HashChangeEvent('hashchange'))
        })
        .catch((err: unknown) => {
          if (errorEl) {
            errorEl.textContent = err instanceof ApiError ? err.message : 'تعذر رفع الملف'
            errorEl.classList.remove('hidden')
          }
          btn.disabled = false
          btn.textContent = 'إرسال إثبات الدفع'
        })
    })
  })
}
