import { createBooking } from '../api/bookings.api'
import { ApiError } from '../api/http'
import { getSectionId, getSectionSlug, getSelectedSeats, setActiveBooking } from '../booking/session'
import { renderNav } from '../components/nav'
import { SECTION_LABELS, SEAT_PRICE } from '../constants'

function getSelectedSeatsList(): string[] {
  return getSelectedSeats()
}

function getSectionTitle(): string {
  const slug = getSectionSlug()
  return SECTION_LABELS[slug] ?? '—'
}

function renderProgress(): string {
  return `
    <div class="flex items-center justify-center mb-xl w-full max-w-2xl mx-auto">
      <div class="flex flex-col items-center gap-sm">
        <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
        <span class="font-label-md text-label-md text-primary">التذاكر</span>
      </div>
      <div class="flex-grow h-px bg-primary/30 mx-md"></div>
      <div class="flex flex-col items-center gap-sm">
        <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-[0_0_15px_rgba(242,202,80,0.5)]">2</div>
        <span class="font-label-md text-label-md text-primary">البيانات</span>
      </div>
      <div class="flex-grow h-px bg-outline-variant/50 mx-md"></div>
      <div class="flex flex-col items-center gap-sm opacity-50">
        <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">3</div>
        <span class="font-label-md text-label-md text-on-surface-variant">الدفع</span>
      </div>
    </div>
  `
}

function renderAttendeePreview(seats: string[]): string {
  if (seats.length === 0) {
    return `<span class="text-on-surface text-sm">—</span>`
  }
  return seats
    .map((seat) => `<span class="text-on-surface text-sm attendee-preview" data-seat-preview="${seat}">— لم يتم الإدخال بعد (${seat})</span>`)
    .join('')
}

function renderAttendeeInputs(seats: string[]): string {
  return seats
    .map(
      (seat, i) => `
      <div class="relative group gold-glow rounded-lg transition-all">
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant font-bold text-sm">${i + 1}</span>
        <input
          class="summary-input w-full bg-[#000000] border border-outline-variant rounded-lg py-md pl-md pr-10 text-on-surface focus:outline-none focus:ring-0 transition-colors text-sm"
          data-seat="${seat}"
          name="attendee-${seat}"
          placeholder="اسم الحاضر (${seat})"
          type="text"
          required
        />
      </div>
    `,
    )
    .join('')
}

function renderEmptyState(): string {
  return `
    <div class="glass-card rounded-xl p-xl text-center max-w-lg mx-auto">
      <span class="material-symbols-outlined text-primary text-[48px] mb-md">receipt_long</span>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm">لا يوجد حجز</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-lg">يرجى اختيار المقاعد أولاً.</p>
      <a href="#/seats" data-link class="inline-flex bg-primary text-on-primary font-label-md text-label-md font-bold py-3 px-8 rounded-lg btn-primary-glow transition-all duration-300">
        العودة لاختيار المقاعد
      </a>
    </div>
  `
}

export function renderSummaryPage(): string {
  const seats = getSelectedSeatsList()
  const sectionTitle = getSectionTitle()
  const total = seats.length * SEAT_PRICE
  const ticketWord = seats.length === 1 ? 'تذكرة' : 'تذاكر'

  if (seats.length === 0) {
    return `
      <div class="min-h-screen flex flex-col bg-background text-on-surface">
        ${renderNav()}
        <main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center">
          ${renderEmptyState()}
        </main>
      </div>
    `
  }

  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface selection:bg-primary/30 selection:text-primary">
      ${renderNav()}
      <main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        ${renderProgress()}
        <h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-center mb-xl">
          ملخص الحجز وبيانات العميل
        </h1>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          <div class="lg:col-span-5 order-2 lg:order-1">
            <div class="glass-card summary-card rounded-xl p-lg h-full flex flex-col sticky top-24">
              <h2 class="font-headline-md text-headline-md text-primary mb-md border-b border-outline-variant/30 pb-sm">ملخص الطلب</h2>
              <div class="flex flex-col gap-md flex-grow">
                <div class="flex justify-between items-center bg-surface-container-low p-md rounded-lg">
                  <span class="text-on-surface-variant font-body-md">القسم:</span>
                  <span class="font-semibold text-on-surface">${sectionTitle}</span>
                </div>
                <div class="flex justify-between items-center bg-surface-container-low p-md rounded-lg">
                  <span class="text-on-surface-variant font-body-md">المقاعد:</span>
                  <span class="font-semibold text-primary">${seats.join(', ')}</span>
                </div>
                <div class="flex justify-between items-center bg-surface-container-low p-md rounded-lg">
                  <span class="text-on-surface-variant font-body-md">العدد:</span>
                  <span class="font-semibold text-on-surface">${seats.length} ${ticketWord}</span>
                </div>
                <div class="bg-surface-container-low p-md rounded-lg flex flex-col gap-sm">
                  <span class="text-on-surface-variant border-b border-outline-variant/30 pb-xs mb-xs font-body-md">أسماء الحضور:</span>
                  <div id="attendeePreviewList" class="flex flex-col gap-xs">
                    ${renderAttendeePreview(seats)}
                  </div>
                </div>
              </div>
              <div class="mt-lg border-t border-outline-variant/50 pt-md space-y-sm">
                <div class="flex justify-between items-center text-on-surface-variant font-body-md">
                  <span>سعر التذكرة:</span>
                  <span>${SEAT_PRICE} ج.م</span>
                </div>
                <div class="flex justify-between items-center font-headline-md text-headline-md text-primary">
                  <span>الإجمالي:</span>
                  <span id="summaryTotal">${total} ج.م</span>
                </div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-7 order-1 lg:order-2">
            <div class="glass-card summary-card rounded-xl p-lg md:p-xl">
              <h2 class="font-headline-md text-headline-md text-primary mb-lg">بيانات التواصل</h2>
              <form id="summaryForm" class="space-y-lg">
                <div id="summaryError" class="hidden bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md font-body-md text-body-md"></div>
                <div class="space-y-sm group gold-glow rounded-lg transition-all">
                  <label class="block font-label-md text-label-md text-on-surface-variant" for="fullName">الاسم بالكامل</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">person</span>
                    <input
                      class="summary-input w-full bg-[#000000] border border-outline-variant rounded-lg py-md pl-md pr-12 text-on-surface focus:outline-none focus:ring-0 transition-colors"
                      id="fullName"
                      name="fullName"
                      placeholder="أدخل اسمك الثلاثي"
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div class="space-y-sm group gold-glow rounded-lg transition-all">
                  <label class="block font-label-md text-label-md text-on-surface-variant" for="whatsapp">
                    رقم الواتساب <span class="text-error">*</span>
                  </label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">chat</span>
                    <input
                      class="summary-input w-full bg-[#000000] border border-outline-variant rounded-lg py-md pl-md pr-12 text-on-surface focus:outline-none focus:ring-0 text-right transition-colors"
                      dir="ltr"
                      id="whatsapp"
                      name="whatsapp"
                      placeholder="01X XXXX XXXX"
                      type="tel"
                      required
                    />
                  </div>
                  <p class="font-caption text-caption text-primary/80 flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-[14px]">info</span>
                    سنقوم بإرسال كود الدخول وتفاصيل التذكرة على هذا الرقم
                  </p>
                </div>
                <div class="mt-xl pt-lg border-t border-outline-variant/30">
                  <h3 class="font-label-md text-label-md text-on-surface-variant mb-md">أسماء الحضور (لكل تذكرة)</h3>
                  <div class="space-y-md">
                    ${renderAttendeeInputs(seats)}
                  </div>
                </div>
                <div class="pt-xl mt-lg">
                  <button
                    type="submit"
                    class="w-full bg-primary text-on-primary font-headline-md text-headline-md py-md rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-[0_4px_14px_rgba(242,202,80,0.4)] active:scale-[0.98] flex items-center justify-center gap-sm"
                  >
                    متابعة للدفع
                    <span class="material-symbols-outlined rtl:-scale-x-100">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
}

function updateAttendeePreview(root: HTMLElement): void {
  const inputs = root.querySelectorAll<HTMLInputElement>('input[data-seat]')
  inputs.forEach((input) => {
    const seat = input.dataset.seat
    if (!seat) return
    const preview = root.querySelector(`[data-seat-preview="${seat}"]`)
    if (!preview) return
    const name = input.value.trim()
    preview.textContent = name ? `${name} (${seat})` : `— لم يتم الإدخال بعد (${seat})`
  })
}

export function bindSummaryPage(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('#summaryForm')
  const errorEl = root.querySelector<HTMLDivElement>('#summaryError')
  const submitBtn = form?.querySelector<HTMLButtonElement>('button[type="submit"]')
  if (!form) return

  form.querySelectorAll<HTMLInputElement>('input[data-seat]').forEach((input) => {
    input.addEventListener('input', () => updateAttendeePreview(root))
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const fullName = (form.querySelector('#fullName') as HTMLInputElement).value.trim()
    const whatsapp = (form.querySelector('#whatsapp') as HTMLInputElement).value.trim()
    const seatLabels = getSelectedSeatsList()
    const sectionId = getSectionId()

    if (!sectionId || seatLabels.length === 0) {
      window.location.hash = '#/sections'
      return
    }

    const seats = seatLabels.map((label) => {
      const input = form.querySelector<HTMLInputElement>(`input[data-seat="${label}"]`)
      return { label, attendeeName: input?.value.trim() ?? '' }
    })

    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = 'جاري إنشاء الحجز...'
    }
    errorEl?.classList.add('hidden')

    void createBooking({ sectionId, contactName: fullName, whatsapp, seats })
      .then((booking) => {
        setActiveBooking(booking.id, booking.ref)
        window.location.hash = '#/payment'
      })
      .catch((err: unknown) => {
        if (errorEl) {
          if (err instanceof ApiError && err.status === 409) {
            const body = err.body as { bookedSeats?: string[] }
            const booked = body.bookedSeats?.join(', ')
            errorEl.textContent = booked
              ? `المقاعد التالية محجوزة: ${booked}`
              : err.message
          } else {
            errorEl.textContent = err instanceof ApiError ? err.message : 'تعذر إنشاء الحجز'
          }
          errorEl.classList.remove('hidden')
        }
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = 'متابعة للدفع'
        }
      })
  })
}
