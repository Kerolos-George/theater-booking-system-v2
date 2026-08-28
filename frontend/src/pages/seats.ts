import { renderNav } from '../components/nav'
import { MAX_SEATS, SEAT_PRICE } from '../constants'

export type SeatStatus = 'available' | 'selected' | 'booked' | 'unavailable'
export type SeatSide = 'L' | 'R'

export interface Seat {
  id: string
  rowCode: string
  letter: string
  side: SeatSide
  number: number
  status: SeatStatus
}

interface RowConfig {
  letter: string
  leftCount: number
  rightCount: number
}

const THEATER_ROWS: RowConfig[] = [
  { letter: 'A', leftCount: 11, rightCount: 11 },
  { letter: 'B', leftCount: 12, rightCount: 12 },
  { letter: 'C', leftCount: 7, rightCount: 7 },
  { letter: 'D', leftCount: 7, rightCount: 7 },
  { letter: 'E', leftCount: 8, rightCount: 8 },
  { letter: 'F', leftCount: 8, rightCount: 9 },
  { letter: 'G', leftCount: 9, rightCount: 9 },
  { letter: 'H', leftCount: 7, rightCount: 7 },
  { letter: 'I', leftCount: 5, rightCount: 5 },
  { letter: 'J', leftCount: 5, rightCount: 4 },
  { letter: 'K', leftCount: 5, rightCount: 5 },
  { letter: 'M', leftCount: 3, rightCount: 0 },
]

function rowCode(letter: string, side: SeatSide): string {
  return `${letter}${side}`
}

function initialStatus(code: string, num: number): SeatStatus {
  const seed = code.charCodeAt(0) * 17 + (code.charCodeAt(1) || 0) * 13 + num * 31
  if (seed % 11 === 0 || seed % 13 === 0) return 'booked'
  if (seed % 17 === 0) return 'unavailable'
  return 'available'
}

function seatLabel(code: string, number: number): string {
  return `${code}${number}`
}

export function buildSeatMap(sectionId: string): Seat[] {
  const seats: Seat[] = []

  for (const { letter, leftCount, rightCount } of THEATER_ROWS) {
    for (const side of ['L', 'R'] as const) {
      const count = side === 'L' ? leftCount : rightCount
      if (count === 0) continue

      const code = rowCode(letter, side)
      for (let num = 1; num <= count; num++) {
        seats.push({
          id: `${sectionId}-${code}${num}`,
          rowCode: code,
          letter,
          side,
          number: num,
          status: initialStatus(code, num),
        })
      }
    }
  }

  return seats
}

function renderProgress(): string {
  return `
    <div class="flex items-center justify-center gap-sm md:gap-lg w-full max-w-2xl mx-auto">
      <div class="flex items-center gap-sm">
        <div class="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant">1</div>
        <span class="hidden md:inline font-label-md text-label-md text-on-surface-variant">القسم</span>
      </div>
      <div class="h-px w-8 md:w-16 bg-outline-variant"></div>
      <div class="flex items-center gap-sm">
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-[0_0_12px_rgba(242,202,80,0.6)]">2</div>
        <span class="font-label-md text-label-md text-primary font-semibold">المقاعد</span>
      </div>
      <div class="h-px w-8 md:w-16 bg-outline-variant"></div>
      <div class="flex items-center gap-sm">
        <div class="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant/50">3</div>
        <span class="hidden md:inline font-label-md text-label-md text-on-surface-variant/50">الدفع</span>
      </div>
    </div>
  `
}

function renderSeatCell(seat: Seat): string {
  const label = seatLabel(seat.rowCode, seat.number)

  if (seat.status === 'booked') {
    return `
      <div
        class="seat-box seat booked shrink-0"
        data-seat-id="${seat.id}"
        data-row="${seat.letter}"
        data-side="${seat.side}"
        tabindex="-1"
        aria-label="${label} محجوز"
        aria-disabled="true"
      >
        <span class="material-symbols-outlined seat-box__icon">close</span>
      </div>
    `
  }

  return `
    <button
      type="button"
      class="seat-box seat ${seat.status} shrink-0"
      data-seat-id="${seat.id}"
      data-seat-label="${label}"
      data-row="${seat.letter}"
      data-side="${seat.side}"
      data-price="${SEAT_PRICE}"
      ${seat.status === 'unavailable' ? 'disabled aria-disabled="true"' : ''}
      aria-pressed="${seat.status === 'selected'}"
      aria-label="مقعد ${label} - ${SEAT_PRICE} جنيه"
    >
      ${seat.number}
    </button>
  `
}

function renderColumnBlock(code: string, side: SeatSide, seats: Seat[]): string {
  if (seats.length === 0) {
    return `<div class="seat-row-block seat-row-block--${side.toLowerCase()} seat-row-block--empty" data-side="${side}"></div>`
  }

  const seatCells = seats.map(renderSeatCell).join('')
  const isLeft = side === 'L'

  if (isLeft) {
    return `
      <div class="seat-row-block seat-row-block--l" data-side="L">
        <div class="seat-row-block__seats seat-row-block__seats--reverse">${seatCells}</div>
        <span class="row-code-badge">${code}</span>
      </div>
    `
  }

  return `
    <div class="seat-row-block seat-row-block--r" data-side="R">
      <span class="row-code-badge">${code}</span>
      <div class="seat-row-block__seats">${seatCells}</div>
    </div>
  `
}

function renderRow(config: RowConfig, seats: Seat[]): string {
  const { letter, leftCount, rightCount } = config
  const leftSeats = seats.filter((s) => s.side === 'L')
  const rightSeats = seats.filter((s) => s.side === 'R')
  const leftCode = rowCode(letter, 'L')
  const rightCode = rowCode(letter, 'R')

  return `
    <div class="seat-map-row" data-row="${letter}">
      ${leftCount > 0 ? renderColumnBlock(leftCode, 'L', leftSeats) : '<div class="seat-row-block seat-row-block--empty"></div>'}
      <div class="seat-aisle" aria-hidden="true">
        <span class="seat-aisle__label">${letter}</span>
      </div>
      ${rightCount > 0 ? renderColumnBlock(rightCode, 'R', rightSeats) : '<div class="seat-row-block seat-row-block--empty"></div>'}
    </div>
  `
}

function renderColumnHeaders(): string {
  return `
    <div class="seat-map-row seat-map-row--header mb-sm">
      <div class="seat-row-block seat-row-block--l justify-end">
        <span class="column-header-badge">
          يسار المسرح · AL BL
          <span class="material-symbols-outlined text-[14px]">chevron_left</span>
        </span>
      </div>
      <div class="seat-aisle seat-aisle--header" aria-hidden="true">
        <span class="seat-aisle__label seat-aisle__label--stage">↑</span>
      </div>
      <div class="seat-row-block seat-row-block--r justify-start">
        <span class="column-header-badge">
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          يمين المسرح · AR BR
        </span>
      </div>
    </div>
  `
}

function renderSeatMap(seats: Seat[]): string {
  return (
    renderColumnHeaders() +
    THEATER_ROWS.map((config) =>
      renderRow(
        config,
        seats.filter((s) => s.letter === config.letter),
      ),
    ).join('')
  )
}

function renderLegendItem(status: SeatStatus, label: string): string {
  if (status === 'booked') {
    return `
      <div class="flex items-center gap-sm">
        <div class="seat-box seat booked scale-90 origin-center pointer-events-none">
          <span class="material-symbols-outlined seat-box__icon">close</span>
        </div>
        <span class="font-caption text-caption text-on-surface-variant">${label}</span>
      </div>
    `
  }

  return `
    <div class="flex items-center gap-sm">
      <div class="seat-box seat ${status} scale-90 origin-center pointer-events-none"></div>
      <span class="font-caption text-caption text-on-surface-variant">${label}</span>
    </div>
  `
}

function renderSummary(selected: string[]): string {
  const remaining = MAX_SEATS - selected.length
  const total = selected.length * SEAT_PRICE
  const chips =
    selected.length === 0
      ? `<span class="font-caption text-caption text-on-surface-variant">لم يتم اختيار مقاعد بعد</span>`
      : selected
          .map(
            (label) =>
              `<span class="bg-primary/20 text-primary border border-primary/30 px-sm py-xs rounded-md font-label-md text-label-md">${label}</span>`,
          )
          .join('')

  return `
    <div class="glass-panel rounded-xl p-lg flex flex-col gap-md" id="bookingSummary">
      <h2 class="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-sm">ملخص الحجز</h2>
      <div class="flex flex-col gap-sm">
        <div class="flex justify-between items-start gap-sm">
          <span class="font-body-md text-body-md text-on-surface-variant shrink-0">المقاعد المختارة:</span>
          <div class="flex gap-xs flex-wrap justify-end max-w-[60%]" id="selectedChips">${chips}</div>
        </div>
        <p class="font-caption text-caption text-on-surface-variant/70 text-left" id="remainingHint">
          ${remaining > 0 ? `يمكنك اختيار ${remaining} كراسي إضافية` : 'وصلت للحد الأقصى من المقاعد'}
        </p>
      </div>
      <div class="border-t border-outline-variant/30 pt-md flex justify-between items-end mt-sm">
        <span class="font-body-lg text-body-lg text-on-surface">الإجمالي:</span>
        <span class="font-headline-lg text-headline-lg text-primary tracking-tight" id="totalPrice">${total} ج.م</span>
      </div>
      <button
        type="button"
        id="continueSeatsBtn"
        ${selected.length === 0 ? 'disabled' : ''}
        class="w-full bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline-md text-headline-md py-sm rounded-lg transition-colors mt-md shadow-[0_4px_14px_rgba(242,202,80,0.4)] flex justify-center items-center gap-sm group disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        متابعة
        <span class="material-symbols-outlined group-hover:-translate-x-1 transition-transform" aria-hidden="true">arrow_back</span>
      </button>
    </div>
  `
}

export function renderSeatsPage(): string {
  const sectionId = sessionStorage.getItem('selectedSection') || 'ground'
  const seats = buildSeatMap(sectionId)

  return `
    <div class="min-h-screen flex flex-col bg-background text-on-background">
      ${renderNav()}
      <main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col gap-xl">
        ${renderProgress()}

        <div id="seatHoverBar" class="seat-hover-bar" aria-live="polite">
          <span class="material-symbols-outlined text-primary text-[18px]">event_seat</span>
          <span id="seatHoverText" class="font-body-md text-body-md text-on-surface">مرّر على المقاعد لعرض التفاصيل</span>
        </div>

        <div class="flex flex-col lg:flex-row gap-lg items-start">
          <div class="w-full lg:w-3/4 flex flex-col gap-lg glass-panel rounded-xl p-md md:p-lg relative overflow-hidden">
            <div class="w-full h-16 md:h-24 bg-gradient-to-b from-primary/20 to-transparent stage-curve border-t-[3px] border-primary flex items-end justify-center pb-sm md:pb-md mb-md relative shrink-0">
              <span class="font-headline-md text-headline-md text-primary/80 tracking-widest uppercase">المسرح</span>
            </div>

            <div class="flex flex-wrap justify-center gap-md md:gap-xl mb-md shrink-0">
              ${renderLegendItem('available', 'متاح')}
              ${renderLegendItem('selected', 'مختار')}
              ${renderLegendItem('booked', 'تم حجزه')}
              ${renderLegendItem('unavailable', 'غير متاح')}
            </div>

            <div class="seat-map-viewport relative">
              <div class="seat-map-scroll-fade seat-map-scroll-fade--top" aria-hidden="true"></div>
              <div class="seat-map-scroll overflow-y-auto overflow-x-hidden pb-md max-h-[min(60vh,520px)] md:max-h-[min(65vh,640px)]" id="seatMapScroll">
                <div class="w-full flex flex-col gap-sm items-stretch py-xs px-xs seat-map-ltr" id="seatMap" data-section="${sectionId}">
                  ${renderSeatMap(seats)}
                </div>
              </div>
              <div class="seat-map-scroll-fade seat-map-scroll-fade--bottom" aria-hidden="true"></div>
            </div>

            <div id="seatToast" class="seat-toast" role="status" aria-live="assertive"></div>

            <div class="pt-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm border-t border-outline-variant/30 shrink-0">
              <span class="font-caption text-caption text-on-surface-variant/60 flex items-center gap-xs">
                <span class="material-symbols-outlined text-[14px]" aria-hidden="true">update</span>
                آخر تحديث: منذ دقيقة واحدة
              </span>
              <span class="font-caption text-caption text-error bg-error/10 px-sm py-xs rounded-md border border-error/20 flex items-center gap-xs">
                <span class="material-symbols-outlined text-[14px]" aria-hidden="true">info</span>
                يمكنك اختيار حتى ${MAX_SEATS} مقاعد كحد أقصى
              </span>
            </div>
          </div>

          <div class="w-full lg:w-1/4 sticky top-[100px] flex flex-col gap-md">
            ${renderSummary([])}
          </div>
        </div>
      </main>
    </div>
  `
}

function updateSummaryPanel(root: HTMLElement, selected: string[]): void {
  const chips = root.querySelector('#selectedChips')
  const hint = root.querySelector('#remainingHint')
  const total = root.querySelector('#totalPrice')
  const btn = root.querySelector<HTMLButtonElement>('#continueSeatsBtn')
  const remaining = MAX_SEATS - selected.length

  if (chips) {
    chips.innerHTML =
      selected.length === 0
        ? `<span class="font-caption text-caption text-on-surface-variant">لم يتم اختيار مقاعد بعد</span>`
        : selected
            .map(
              (label) =>
                `<span class="bg-primary/20 text-primary border border-primary/30 px-sm py-xs rounded-md font-label-md text-label-md">${label}</span>`,
            )
            .join('')
  }

  if (hint) {
    hint.textContent =
      remaining > 0
        ? `يمكنك اختيار ${remaining} كراسي إضافية`
        : 'وصلت للحد الأقصى من المقاعد'
  }

  if (total) {
    total.textContent = `${selected.length * SEAT_PRICE} ج.م`
  }

  if (btn) {
    btn.disabled = selected.length === 0
  }
}

function showToast(root: HTMLElement, message: string): void {
  const toast = root.querySelector('#seatToast')
  if (!toast) return
  toast.textContent = message
  toast.classList.add('seat-toast--visible')
  window.setTimeout(() => toast.classList.remove('seat-toast--visible'), 2600)
}

function updateHoverBar(root: HTMLElement, seat: HTMLElement | null): void {
  const text = root.querySelector('#seatHoverText')
  const bar = root.querySelector('#seatHoverBar')
  if (!text || !bar) return

  if (!seat) {
    text.textContent = 'مرّر على المقاعد لعرض التفاصيل'
    bar.classList.remove('seat-hover-bar--active')
    return
  }

  const label = seat.dataset.seatLabel
  const price = seat.dataset.price
  const isBooked = seat.classList.contains('booked')
  const isUnavailable = seat.classList.contains('unavailable')
  const isSelected = seat.classList.contains('selected')

  bar.classList.add('seat-hover-bar--active')

  if (isBooked) {
    text.textContent = `${label} — محجوز مسبقاً`
  } else if (isUnavailable) {
    text.textContent = `${label} — غير متاح`
  } else if (isSelected) {
    text.textContent = `${label} — مختار · ${price} ج.م (اضغط للإلغاء)`
  } else {
    text.textContent = `${label} — متاح · ${price} ج.م (اضغط للاختيار)`
  }
}

function highlightRow(root: HTMLElement, letter: string | null): void {
  root.querySelectorAll('.seat-map-row').forEach((row) => {
    row.classList.toggle('seat-map-row--highlight', letter !== null && row.getAttribute('data-row') === letter)
  })
}

function updateScrollFades(scrollEl: HTMLElement): void {
  const viewport = scrollEl.closest('.seat-map-viewport')
  if (!viewport) return

  const atTop = scrollEl.scrollTop <= 4
  const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4

  viewport.classList.toggle('seat-map-viewport--at-top', atTop)
  viewport.classList.toggle('seat-map-viewport--at-bottom', atBottom)
}

export function bindSeatsPage(root: HTMLElement): void {
  const selected = new Set<string>()
  const seatMap = root.querySelector('#seatMap')
  const scrollEl = root.querySelector<HTMLElement>('#seatMapScroll')

  scrollEl?.addEventListener('scroll', () => updateScrollFades(scrollEl), { passive: true })
  updateScrollFades(scrollEl ?? root)

  seatMap?.addEventListener('mouseover', (event) => {
    const seat = (event.target as HTMLElement).closest<HTMLElement>('.seat-box')
    if (!seat) {
      updateHoverBar(root, null)
      highlightRow(root, null)
      return
    }
    updateHoverBar(root, seat)
    highlightRow(root, seat.dataset.row ?? null)
  })

  seatMap?.addEventListener('mouseleave', () => {
    updateHoverBar(root, null)
    highlightRow(root, null)
  })

  seatMap?.addEventListener('focusin', (event) => {
    const seat = (event.target as HTMLElement).closest<HTMLElement>('.seat-box')
    if (seat) {
      updateHoverBar(root, seat)
      highlightRow(root, seat.dataset.row ?? null)
    }
  })

  seatMap?.addEventListener('focusout', () => {
    updateHoverBar(root, null)
    highlightRow(root, null)
  })

  seatMap?.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button.seat-box')
    if (!target || target.disabled) return
    if (target.classList.contains('booked') || target.classList.contains('unavailable')) return

    const label = target.dataset.seatLabel
    if (!label) return

    if (selected.has(label)) {
      selected.delete(label)
      target.classList.remove('selected', 'seat-pop')
      target.classList.add('available')
      target.setAttribute('aria-pressed', 'false')
      void target.offsetWidth
      target.classList.add('seat-pop')
    } else {
      if (selected.size >= MAX_SEATS) {
        showToast(root, `الحد الأقصى ${MAX_SEATS} مقاعد فقط`)
        target.classList.add('seat-shake')
        window.setTimeout(() => target.classList.remove('seat-shake'), 450)
        return
      }
      selected.add(label)
      target.classList.remove('available')
      target.classList.add('selected', 'seat-pop')
      target.setAttribute('aria-pressed', 'true')
    }

    updateSummaryPanel(root, Array.from(selected).sort())
    updateHoverBar(root, target)
  })

  root.querySelector('#continueSeatsBtn')?.addEventListener('click', () => {
    if (selected.size === 0) return
    sessionStorage.setItem('selectedSeats', JSON.stringify(Array.from(selected).sort()))
    window.location.hash = '#/summary'
  })
}
