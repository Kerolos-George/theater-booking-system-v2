import {
  cancelAdminBooking,
  confirmAdminBooking,
  fetchAdminBooking,
  fetchAdminBookings,
} from '../../api/admin.api'
import type { AdminBooking, ApiBookingStatus } from '../../api/admin-types'
import { ApiError } from '../../api/http'
import { bindAdminNav, renderAdminNav } from '../../components/admin-nav'
import { compareSeatLabels, formatBookingDate, STATUS_LABELS } from '../../booking/utils'

const PAGE_SIZE = 15

const ADMIN_STATUS_LABELS: Record<ApiBookingStatus, string> = {
  UNPAID: STATUS_LABELS.unpaid,
  PENDING: STATUS_LABELS.pending,
  CONFIRMED: STATUS_LABELS.confirmed,
  CANCELED: STATUS_LABELS.canceled,
}

function statusClass(status: ApiBookingStatus): string {
  switch (status) {
    case 'UNPAID':
      return 'text-on-error-container bg-error-container/30 border-error-container/50'
    case 'PENDING':
      return 'text-tertiary-fixed bg-tertiary-container/20 border-tertiary-container/40'
    case 'CONFIRMED':
      return 'text-primary bg-primary/15 border-primary/30'
    case 'CANCELED':
      return 'text-on-surface-variant bg-surface-container-high/50 border-outline-variant/30'
  }
}

function renderFilters(mobile: string): string {
  return `
    <div class="glass-card rounded-xl p-md mb-lg flex flex-col sm:flex-row gap-md items-stretch sm:items-end">
      <div class="flex-grow space-y-sm">
        <label for="mobileFilter" class="font-label-md text-on-surface-variant">بحث برقم موبايل المستخدم</label>
        <input id="mobileFilter" type="tel" dir="ltr" value="${mobile}"
          placeholder="01X XXXX XXXX"
          class="input-dark w-full rounded-lg py-sm px-md text-on-surface font-body-md" />
        <p class="font-caption text-caption text-on-surface-variant">البحث في كل الحجوزات ثم عرض النتائج صفحة بصفحة</p>
      </div>
      <div class="flex gap-sm shrink-0">
        <button type="button" id="searchBtn" class="bg-primary text-on-primary font-label-md px-lg py-sm rounded-lg">بحث</button>
        <button type="button" id="clearFilterBtn" class="border border-outline-variant text-on-surface-variant font-label-md px-lg py-sm rounded-lg hover:bg-white/5">مسح</button>
      </div>
    </div>
  `
}

function renderBookingRow(booking: AdminBooking): string {
  return `
    <tr class="border-b border-outline-variant/10 hover:bg-white/5 transition-colors">
      <td class="py-md px-sm font-mono text-primary">${booking.ref}</td>
      <td class="py-md px-sm font-body-md">${booking.user.name}</td>
      <td class="py-md px-sm font-body-md dir-ltr">${booking.user.mobile}</td>
      <td class="py-md px-sm">
        <span class="inline-flex px-sm py-xs rounded-full border text-xs font-label-md ${statusClass(booking.status)}">
          ${ADMIN_STATUS_LABELS[booking.status]}
        </span>
      </td>
      <td class="py-md px-sm font-body-md text-on-surface-variant">${formatBookingDate(booking.createdAt)}</td>
      <td class="py-md px-sm">
        <button type="button" class="view-booking-btn text-primary font-label-md hover:underline" data-id="${booking.id}">
          عرض التفاصيل
        </button>
      </td>
    </tr>
  `
}

function renderPagination(page: number, totalPages: number, total: number): string {
  return `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-md mt-lg">
      <p class="font-body-md text-on-surface-variant">إجمالي ${total} حجز — صفحة ${page} من ${totalPages}</p>
      <div class="flex gap-sm">
        <button type="button" id="prevPageBtn" ${page <= 1 ? 'disabled' : ''}
          class="px-md py-sm rounded-lg border border-outline-variant disabled:opacity-40 font-label-md">السابق</button>
        <button type="button" id="nextPageBtn" ${page >= totalPages ? 'disabled' : ''}
          class="px-md py-sm rounded-lg border border-outline-variant disabled:opacity-40 font-label-md">التالي</button>
      </div>
    </div>
  `
}

function renderSeatsList(seats: AdminBooking['seats']): string {
  const sorted = [...seats].sort((a, b) => compareSeatLabels(a.label, b.label))
  return sorted
    .map(
      (seat) => `
      <div class="flex justify-between gap-sm bg-surface-container-high/60 rounded-lg px-sm py-xs">
        <span class="font-mono text-primary">${seat.label}</span>
        <span class="text-on-surface">${seat.attendeeName}</span>
      </div>
    `,
    )
    .join('')
}

function renderDetailModal(booking: AdminBooking): string {
  const canConfirm = booking.status === 'PENDING'
  const canCancel = booking.status !== 'CANCELED'

  return `
    <div id="bookingModal" class="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/70 backdrop-blur-sm">
      <div class="glass-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-lg md:p-xl relative">
        <button type="button" id="closeModalBtn" class="absolute top-md left-md text-on-surface-variant hover:text-primary p-1">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div class="mb-lg pt-md">
          <p class="font-caption text-on-surface-variant">رقم الحجز</p>
          <h2 class="font-headline-md text-primary font-mono">#${booking.ref}</h2>
          <span class="inline-flex mt-sm px-sm py-xs rounded-full border text-xs ${statusClass(booking.status)}">
            ${ADMIN_STATUS_LABELS[booking.status]}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-md mb-lg">
          <div>
            <p class="font-caption text-on-surface-variant">اسم صاحب الحجز</p>
            <p class="font-body-md">${booking.contactName}</p>
          </div>
          <div>
            <p class="font-caption text-on-surface-variant">واتساب</p>
            <p class="font-body-md dir-ltr">${booking.whatsapp}</p>
          </div>
          <div>
            <p class="font-caption text-on-surface-variant">المستخدم (موبايل)</p>
            <p class="font-body-md">${booking.user.name}</p>
            <p class="font-body-md dir-ltr text-on-surface-variant">${booking.user.mobile}</p>
          </div>
          <div>
            <p class="font-caption text-on-surface-variant">القسم</p>
            <p class="font-body-md">${booking.section.labelAr}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="font-caption text-on-surface-variant mb-xs">المقاعد والحضور</p>
            <div class="flex flex-col gap-1">${renderSeatsList(booking.seats)}</div>
          </div>
          <div>
            <p class="font-caption text-on-surface-variant">الإجمالي</p>
            <p class="font-headline-md text-primary">${booking.totalAmount} ج.م</p>
          </div>
          ${
            booking.entryCode
              ? `<div>
            <p class="font-caption text-on-surface-variant">كود الدخول</p>
            <p class="font-display-lg text-primary font-mono tracking-widest dir-ltr">${booking.entryCode}</p>
            <p class="font-caption mt-xs ${booking.entryCodeUsed ? 'text-on-error-container' : 'text-primary'}">
              ${booking.entryCodeUsed ? `مستخدم${booking.entryCodeUsedAt ? ` — ${formatBookingDate(booking.entryCodeUsedAt)}` : ''}` : 'لم يُستخدم بعد'}
            </p>
          </div>`
              : ''
          }
        </div>

        ${
          booking.paymentProofUrl
            ? `
          <div class="mb-lg">
            <p class="font-label-md text-on-surface-variant mb-sm">إثبات الدفع</p>
            <button type="button" id="showPaymentBtn" class="bg-primary/15 text-primary border border-primary/30 px-md py-sm rounded-lg font-label-md mb-sm">
              عرض صورة الدفع
            </button>
            <div id="paymentImageWrap" class="hidden">
              <img src="${booking.paymentProofUrl}" alt="إثبات الدفع" class="w-full max-h-96 object-contain rounded-lg border border-outline-variant/30 bg-black/20" />
            </div>
          </div>
        `
            : '<p class="font-body-md text-on-surface-variant mb-lg">لا يوجد إثبات دفع مرفوع</p>'
        }

        <p id="modalActionError" class="hidden text-error font-body-md mb-md"></p>

        <div class="flex flex-wrap gap-sm pt-md border-t border-outline-variant/20">
          ${
            canConfirm
              ? `<button type="button" id="confirmBookingBtn" data-id="${booking.id}"
              class="bg-primary text-on-primary font-label-md px-lg py-sm rounded-lg">تأكيد وإنشاء كود الدخول</button>`
              : ''
          }
          ${
            canCancel
              ? `<button type="button" id="cancelBookingBtn" data-id="${booking.id}"
              class="border border-error-container text-on-error-container font-label-md px-lg py-sm rounded-lg hover:bg-error-container/10">إلغاء الحجز وتحرير المقاعد</button>`
              : ''
          }
        </div>
      </div>
    </div>
  `
}

export function renderAdminBookingsPage(): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface page-radial">
      ${renderAdminNav('bookings')}
      <main class="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl">
        ${renderFilters('')}
        <div id="adminBookingsError" class="hidden mb-lg bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md text-center"></div>
        <div class="glass-card rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-right min-w-[640px]">
              <thead class="bg-surface-container-high/50 font-label-md text-on-surface-variant">
                <tr>
                  <th class="py-md px-sm">المرجع</th>
                  <th class="py-md px-sm">الاسم</th>
                  <th class="py-md px-sm">الموبايل</th>
                  <th class="py-md px-sm">الحالة</th>
                  <th class="py-md px-sm">التاريخ</th>
                  <th class="py-md px-sm"></th>
                </tr>
              </thead>
              <tbody id="bookingsTableBody">
                <tr><td colspan="6" class="py-xl text-center text-on-surface-variant">جاري التحميل...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="paginationWrap"></div>
      </main>
      <div id="modalRoot"></div>
    </div>
  `
}

interface PageState {
  page: number
  mobile: string
  selectedId: string | null
}

export function bindAdminBookingsPage(root: HTMLElement): void {
  bindAdminNav(root)

  const state: PageState = { page: 1, mobile: '', selectedId: null }

  const tableBody = root.querySelector<HTMLTableSectionElement>('#bookingsTableBody')
  const paginationWrap = root.querySelector<HTMLDivElement>('#paginationWrap')
  const errorEl = root.querySelector<HTMLDivElement>('#adminBookingsError')
  const mobileInput = root.querySelector<HTMLInputElement>('#mobileFilter')
  const modalRoot = root.querySelector<HTMLDivElement>('#modalRoot')

  function loadBookings(): void {
    errorEl?.classList.add('hidden')
    if (tableBody) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="py-xl text-center text-on-surface-variant">جاري التحميل...</td></tr>'
    }

    void fetchAdminBookings({ page: state.page, limit: PAGE_SIZE, mobile: state.mobile || undefined })
      .then((result) => {
        if (!tableBody || !paginationWrap) return

        if (result.items.length === 0) {
          tableBody.innerHTML =
            '<tr><td colspan="6" class="py-xl text-center text-on-surface-variant">لا توجد حجوزات</td></tr>'
        } else {
          tableBody.innerHTML = result.items.map(renderBookingRow).join('')
          bindRowButtons()
        }

        paginationWrap.innerHTML = renderPagination(result.page, result.totalPages, result.total)
        bindPagination()
      })
      .catch((err: unknown) => {
        if (tableBody) tableBody.innerHTML = ''
        if (errorEl) {
          errorEl.textContent = err instanceof ApiError ? err.message : 'تعذر تحميل الحجوزات'
          errorEl.classList.remove('hidden')
        }
      })
  }

  function bindRowButtons(): void {
    root.querySelectorAll<HTMLButtonElement>('.view-booking-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id
        if (!id) return
        openModal(id)
      })
    })
  }

  function bindPagination(): void {
    root.querySelector('#prevPageBtn')?.addEventListener('click', () => {
      if (state.page > 1) {
        state.page -= 1
        loadBookings()
      }
    })
    root.querySelector('#nextPageBtn')?.addEventListener('click', () => {
      state.page += 1
      loadBookings()
    })
  }

  function openModal(id: string): void {
    void fetchAdminBooking(id).then((booking) => {
      if (!modalRoot) return
      state.selectedId = id
      modalRoot.innerHTML = renderDetailModal(booking)
      bindModal(booking)
    })
  }

  function bindModal(booking: AdminBooking): void {
    modalRoot?.querySelector('#closeModalBtn')?.addEventListener('click', closeModal)
    modalRoot?.querySelector('#bookingModal')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closeModal()
    })

    modalRoot?.querySelector('#showPaymentBtn')?.addEventListener('click', () => {
      modalRoot.querySelector('#paymentImageWrap')?.classList.remove('hidden')
    })

    modalRoot?.querySelector('#confirmBookingBtn')?.addEventListener('click', () => {
      void runAction('confirm', booking.id)
    })

    modalRoot?.querySelector('#cancelBookingBtn')?.addEventListener('click', () => {
      if (!window.confirm('هل أنت متأكد من إلغاء الحجز وتحرير المقاعد؟')) return
      void runAction('cancel', booking.id)
    })
  }

  function closeModal(): void {
    if (modalRoot) modalRoot.innerHTML = ''
    state.selectedId = null
  }

  async function runAction(action: 'confirm' | 'cancel', id: string): Promise<void> {
    const actionError = modalRoot?.querySelector<HTMLParagraphElement>('#modalActionError')
    actionError?.classList.add('hidden')

    try {
      const updated =
        action === 'confirm' ? await confirmAdminBooking(id) : await cancelAdminBooking(id)
      if (modalRoot) {
        modalRoot.innerHTML = renderDetailModal(updated)
        bindModal(updated)
      }
      loadBookings()
    } catch (err: unknown) {
      if (actionError) {
        actionError.textContent = err instanceof ApiError ? err.message : 'فشلت العملية'
        actionError.classList.remove('hidden')
      }
    }
  }

  root.querySelector('#searchBtn')?.addEventListener('click', () => {
    state.mobile = mobileInput?.value.trim() ?? ''
    state.page = 1
    loadBookings()
  })

  root.querySelector('#clearFilterBtn')?.addEventListener('click', () => {
    if (mobileInput) mobileInput.value = ''
    state.mobile = ''
    state.page = 1
    loadBookings()
  })

  mobileInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      state.mobile = mobileInput.value.trim()
      state.page = 1
      loadBookings()
    }
  })

  loadBookings()
}
