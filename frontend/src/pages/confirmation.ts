import html2canvas from 'html2canvas'
import { SECTION_LABELS, SEAT_PRICE } from '../constants'

interface BookingDetails {
  fullName: string
  whatsapp: string
  attendees: Record<string, string>
}

function loadBooking(): {
  details: BookingDetails | null
  seats: string[]
  sectionId: string
  bookingRef: string
} {
  let details: BookingDetails | null = null
  let seats: string[] = []
  const sectionId = sessionStorage.getItem('selectedSection') || 'ground'
  let bookingRef = sessionStorage.getItem('bookingRef') || ''

  try {
    const rawDetails = sessionStorage.getItem('bookingDetails')
    if (rawDetails) details = JSON.parse(rawDetails) as BookingDetails
  } catch {
    details = null
  }

  try {
    const rawSeats = sessionStorage.getItem('selectedSeats')
    if (rawSeats) {
      const parsed = JSON.parse(rawSeats) as unknown
      seats = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').sort() : []
    }
  } catch {
    seats = []
  }

  if (!bookingRef) {
    bookingRef = `PRM-${Math.floor(10000 + Math.random() * 89999)}`
    sessionStorage.setItem('bookingRef', bookingRef)
  }

  return { details, seats, sectionId, bookingRef }
}

function formatBookingDate(): string {
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date())
}

function renderHeader(): string {
  return `
    <header class="w-full bg-surface-container-lowest py-lg border-b border-outline-variant/10 z-50 sticky top-0">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-center items-center">
        <div class="flex items-center gap-sm">
          <span class="material-symbols-outlined text-primary filled">check_circle</span>
          <span class="font-headline-md text-headline-md text-primary tracking-tight">PREMIER THEATER</span>
        </div>
      </div>
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-lg">
        <div class="flex justify-between items-center relative max-w-xl mx-auto">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container-high rounded-full -z-10"></div>
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-full h-1 bg-primary rounded-full -z-10"></div>
          <div class="flex flex-col items-center gap-xs z-10">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span class="material-symbols-outlined text-sm">done</span>
            </div>
            <span class="font-caption text-caption text-primary">المقاعد</span>
          </div>
          <div class="flex flex-col items-center gap-xs z-10">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span class="material-symbols-outlined text-sm">done</span>
            </div>
            <span class="font-caption text-caption text-primary">البيانات</span>
          </div>
          <div class="flex flex-col items-center gap-xs z-10">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary glow-effect">
              <span class="material-symbols-outlined text-sm">done_all</span>
            </div>
            <span class="font-caption text-caption text-primary font-bold">التأكيد</span>
          </div>
        </div>
      </div>
    </header>
  `
}

function renderSeatRows(seats: string[], attendees: Record<string, string>, sectionTitle: string): string {
  return seats
    .map(
      (seat) => `
      <li class="flex justify-between items-center gap-md border-b border-outline-variant/10 pb-xs last:border-0 last:pb-0">
        <span class="font-body-md text-body-md text-on-surface">مقعد ${seat} — ${sectionTitle}</span>
        <span class="font-body-md text-body-md text-on-surface-variant shrink-0">${attendees[seat] || '—'}</span>
      </li>
    `,
    )
    .join('')
}

function renderEmptyState(): string {
  return `
    <div class="glass-card rounded-xl p-xl text-center max-w-lg mx-auto">
      <span class="material-symbols-outlined text-primary text-[48px] mb-md">receipt_long</span>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm">لا يوجد حجز</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-lg">لم يتم العثور على طلب حجز.</p>
      <a href="#/" data-link class="inline-flex bg-primary text-on-primary font-label-md text-label-md font-bold py-3 px-8 rounded-lg transition-all duration-300">
        العودة للرئيسية
      </a>
    </div>
  `
}

export function renderConfirmationPage(): string {
  const submitted = sessionStorage.getItem('paymentSubmitted') === 'true'
  const { details, seats, sectionId, bookingRef } = loadBooking()

  if (!submitted || !details || seats.length === 0) {
    return `
      <div class="min-h-screen flex flex-col bg-background text-on-background">
        ${renderHeader()}
        <main class="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop">
          ${renderEmptyState()}
        </main>
      </div>
    `
  }

  const sectionTitle = SECTION_LABELS[sectionId] ?? sectionId
  const total = seats.length * SEAT_PRICE
  const bookingDate = formatBookingDate()

  return `
    <div class="min-h-screen flex flex-col bg-background text-on-background overflow-x-hidden">
      ${renderHeader()}
      <main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center relative">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-20 pointer-events-none"></div>

        <div class="text-center mb-xl confirmation-fade-in">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-md">
            <span class="material-symbols-outlined text-5xl text-primary drop-shadow-md filled">celebration</span>
          </div>
          <h1 class="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-sm">
            تم استلام طلب الحجز بنجاح!
          </h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            شكراً لاختيارك Premier Theater. جاري مراجعة طلبك وإعداد التذاكر الخاصة بك.
          </p>
        </div>

        <div id="invoiceCard" class="glass-card confirmation-card rounded-xl w-full max-w-2xl p-lg md:p-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/10 to-transparent rounded-tr-full pointer-events-none"></div>

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant/30 pb-md mb-md gap-md relative">
            <div>
              <h2 class="font-headline-md text-headline-md text-on-surface">إيصال الحجز</h2>
              <p class="font-caption text-caption text-on-surface-variant mt-xs">
                رقم الحجز: <span class="text-primary font-mono tracking-widest">#${bookingRef}</span>
              </p>
            </div>
            <div class="bg-surface-container-high px-md py-sm rounded-lg border border-outline-variant/20 flex items-center gap-sm">
              <span class="material-symbols-outlined text-tertiary-container">pending_actions</span>
              <span class="font-label-md text-label-md text-tertiary-container">في انتظار تأكيد الدفع - مراجعة الإدارة</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg relative">
            <div class="flex items-start gap-sm">
              <span class="material-symbols-outlined text-on-surface-variant mt-1">calendar_today</span>
              <div>
                <p class="font-caption text-caption text-on-surface-variant">تاريخ الحجز</p>
                <p class="font-body-md text-body-md text-on-surface">${bookingDate}</p>
              </div>
            </div>
            <div class="flex items-start gap-sm">
              <span class="material-symbols-outlined text-on-surface-variant mt-1">person</span>
              <div>
                <p class="font-caption text-caption text-on-surface-variant">الاسم</p>
                <p class="font-body-md text-body-md text-on-surface">${details.fullName}</p>
              </div>
            </div>
            <div class="flex items-start gap-sm md:col-span-2">
              <span class="material-symbols-outlined text-on-surface-variant mt-1">chat</span>
              <div>
                <p class="font-caption text-caption text-on-surface-variant">واتساب</p>
                <p class="font-body-md text-body-md text-on-surface font-mono" dir="ltr">${details.whatsapp}</p>
              </div>
            </div>
          </div>

          <div class="bg-surface-container/50 rounded-lg p-md border border-outline-variant/10 mb-lg relative">
            <h3 class="font-label-md text-label-md text-on-surface-variant mb-sm flex items-center gap-xs">
              <span class="material-symbols-outlined text-sm">event_seat</span>
              تفاصيل المقاعد
            </h3>
            <ul class="space-y-sm">
              ${renderSeatRows(seats, details.attendees, sectionTitle)}
            </ul>
          </div>

          <div class="flex justify-between items-end pt-md border-t border-outline-variant/30 relative">
            <span class="font-headline-md text-headline-md text-on-surface">إجمالي المبلغ</span>
            <span class="font-display-lg text-display-lg text-primary">
              ${total}
              <span class="text-headline-md font-headline-md text-primary">ج.م</span>
            </span>
          </div>
        </div>

        <div class="mt-xl max-w-2xl w-full bg-surface-container-high/80 border border-primary/20 rounded-lg p-md flex items-start gap-md">
          <span class="material-symbols-outlined text-primary text-3xl shrink-0">mark_chat_unread</span>
          <p class="font-body-md text-body-md text-on-surface leading-relaxed">
            <strong class="text-primary">تنبيه هام:</strong>
            سيتم إرسال كود الدخول والتذاكر الإلكترونية إلى رقم WhatsApp المسجل أعلاه مباشرة بعد تأكيد الحجز ومراجعة البيانات من قبل الإدارة. يرجى الاحتفاظ برقم الحجز للمراجعة.
          </p>
        </div>

        <div class="mt-xl flex flex-col sm:flex-row gap-md w-full max-w-md justify-center">
          <button
            type="button"
            id="downloadInvoiceBtn"
            class="flex-1 bg-transparent border-2 border-primary text-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-xs"
          >
            <span class="material-symbols-outlined text-sm">download</span>
            تحميل الفاتورة
          </button>
          <a
            href="#/bookings"
            data-link
            class="flex-1 bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-xs font-bold"
          >
            حجوزاتي
            <span class="material-symbols-outlined text-sm">event_seat</span>
          </a>
        </div>
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
    const canvas = await html2canvas(card, {
      backgroundColor: '#131313',
      scale: 2,
      useCORS: true,
    })

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
  root.querySelector('#downloadInvoiceBtn')?.addEventListener('click', () => {
    const { bookingRef } = loadBooking()
    void downloadInvoiceAsJpg(root, bookingRef)
  })
}
