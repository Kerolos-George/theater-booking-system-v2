import { lookupEntryCode, redeemEntryCode } from '../../api/admin.api'
import type { AdminBooking } from '../../api/admin-types'
import { ApiError } from '../../api/http'
import { bindAdminNav, renderAdminNav } from '../../components/admin-nav'
import { compareSeatLabels, formatBookingDate } from '../../booking/utils'

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

function renderCodeStatus(booking: AdminBooking): string {
  if (booking.entryCodeUsed) {
    return `
      <div class="bg-error-container/20 border border-error-container/40 rounded-lg p-md flex items-center gap-sm">
        <span class="material-symbols-outlined text-on-error-container">block</span>
        <div>
          <p class="font-label-md text-on-error-container">الكود مستخدم</p>
          <p class="font-caption text-on-error-container/80">تم التحقق ${booking.entryCodeUsedAt ? formatBookingDate(booking.entryCodeUsedAt) : ''}</p>
        </div>
      </div>
    `
  }

  return `
    <div class="bg-primary/10 border border-primary/30 rounded-lg p-md flex items-center gap-sm">
      <span class="material-symbols-outlined text-primary">verified</span>
      <p class="font-label-md text-primary">الكود صالح — لم يُستخدم بعد</p>
    </div>
  `
}

function renderBookingDetails(booking: AdminBooking): string {
  const canRedeem = !booking.entryCodeUsed

  return `
    <div class="glass-card rounded-xl p-lg md:p-xl space-y-lg">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md">
        <div>
          <p class="font-caption text-on-surface-variant">رقم الحجز</p>
          <h2 class="font-headline-md text-primary font-mono">#${booking.ref}</h2>
        </div>
        <div class="text-left sm:text-right">
          <p class="font-caption text-on-surface-variant">كود الدخول</p>
          <p class="font-display-lg text-primary font-mono tracking-widest dir-ltr">${booking.entryCode ?? '—'}</p>
        </div>
      </div>

      ${renderCodeStatus(booking)}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <div>
          <p class="font-caption text-on-surface-variant">اسم صاحب الحجز</p>
          <p class="font-body-md">${booking.contactName}</p>
        </div>
        <div>
          <p class="font-caption text-on-surface-variant">البريد الإلكتروني</p>
          <p class="font-body-md dir-ltr">${booking.email}</p>
        </div>
        <div>
          <p class="font-caption text-on-surface-variant">واتساب</p>
          <p class="font-body-md dir-ltr">${booking.whatsapp}</p>
        </div>
        <div>
          <p class="font-caption text-on-surface-variant">موبايل المستخدم</p>
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
      </div>

      <p id="redeemError" class="hidden text-error font-body-md"></p>

      ${
        canRedeem
          ? `<button type="button" id="redeemCodeBtn"
              class="w-full bg-primary text-on-primary font-headline-md py-md rounded-lg hover:bg-primary-fixed-dim transition-colors">
              تأكيد الدخول (استخدام الكود)
            </button>`
          : `<p class="text-center font-body-md text-on-surface-variant">لا يمكن استخدام هذا الكود مرة أخرى</p>`
      }
    </div>
  `
}

export function renderAdminEntryPage(): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface page-radial">
      ${renderAdminNav('entry')}
      <main class="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl">
        <div class="glass-card rounded-xl p-lg md:p-xl mb-lg max-w-xl">
          <h2 class="font-headline-md text-headline-md text-on-surface mb-sm">إدخال كود الدخول</h2>
          <p class="font-body-md text-on-surface-variant mb-lg">أدخل الكود المكوّن من 6 أرقام للتحقق من الحجز</p>
          <form id="entryLookupForm" class="flex flex-col sm:flex-row gap-sm">
            <input id="entryCodeInput" type="text" inputmode="numeric" maxlength="8" dir="ltr" required
              placeholder="123456"
              class="input-dark flex-grow rounded-lg py-md px-md text-on-surface font-mono text-xl tracking-widest text-center" />
            <button type="submit" id="lookupBtn"
              class="bg-primary text-on-primary font-label-md px-xl py-md rounded-lg shrink-0">
              بحث
            </button>
          </form>
          <p id="lookupError" class="hidden mt-md text-error font-body-md text-center"></p>
        </div>
        <div id="entryResult"></div>
      </main>
    </div>
  `
}

export function bindAdminEntryPage(root: HTMLElement): void {
  bindAdminNav(root)

  const form = root.querySelector<HTMLFormElement>('#entryLookupForm')
  const codeInput = root.querySelector<HTMLInputElement>('#entryCodeInput')
  const lookupBtn = root.querySelector<HTMLButtonElement>('#lookupBtn')
  const lookupError = root.querySelector<HTMLParagraphElement>('#lookupError')
  const resultEl = root.querySelector<HTMLDivElement>('#entryResult')

  let currentCode = ''

  function showBooking(booking: AdminBooking): void {
    if (!resultEl) return
    resultEl.innerHTML = renderBookingDetails(booking)

    resultEl.querySelector('#redeemCodeBtn')?.addEventListener('click', () => {
      void redeemCurrent()
    })
  }

  async function redeemCurrent(): Promise<void> {
    const redeemError = resultEl?.querySelector<HTMLParagraphElement>('#redeemError')
    const redeemBtn = resultEl?.querySelector<HTMLButtonElement>('#redeemCodeBtn')
    redeemError?.classList.add('hidden')

    if (!currentCode || !redeemBtn) return

    redeemBtn.disabled = true
    redeemBtn.textContent = 'جاري التأكيد...'

    try {
      const updated = await redeemEntryCode(currentCode)
      showBooking(updated)
    } catch (err: unknown) {
      if (redeemError) {
        redeemError.textContent = err instanceof ApiError ? err.message : 'فشل تأكيد الدخول'
        redeemError.classList.remove('hidden')
      }
      redeemBtn.disabled = false
      redeemBtn.textContent = 'تأكيد الدخول (استخدام الكود)'
    }
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!codeInput || !lookupBtn) return

    currentCode = codeInput.value.trim()
    if (!currentCode) return

    lookupBtn.disabled = true
    lookupBtn.textContent = 'جاري البحث...'
    lookupError?.classList.add('hidden')
    if (resultEl) resultEl.innerHTML = ''

    void lookupEntryCode(currentCode)
      .then((booking) => {
        showBooking(booking)
      })
      .catch((err: unknown) => {
        if (lookupError) {
          lookupError.textContent = err instanceof ApiError ? err.message : 'كود غير صحيح'
          lookupError.classList.remove('hidden')
        }
      })
      .finally(() => {
        lookupBtn.disabled = false
        lookupBtn.textContent = 'بحث'
      })
  })
}
