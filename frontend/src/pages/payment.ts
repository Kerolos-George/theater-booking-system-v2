import { fetchBooking, uploadPaymentProof } from '../api/bookings.api'
import { ApiError } from '../api/http'
import { getActiveBookingId } from '../booking/session'
import { INSTAPAY } from '../constants'

function hasActiveBooking(): boolean {
  return Boolean(getActiveBookingId())
}

function renderHeader(): string {
  return `
    <header class="bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-md sticky top-0 z-50">
      <div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-md w-full max-w-container-max mx-auto">
        <a href="#/" data-link class="font-display-lg text-headline-md md:text-display-lg font-bold text-primary tracking-tighter">
          PREMIER THEATER
        </a>
        <button type="button" class="text-primary p-sm rounded-full hover:bg-white/5 transition-colors" aria-label="تغيير اللغة">
          <span class="material-symbols-outlined text-2xl">language</span>
        </button>
      </div>
    </header>
  `
}

function renderProgress(): string {
  return `
    <div class="flex items-center justify-center mb-xl">
      <div class="flex items-center gap-4 w-full max-w-md">
        <div class="flex flex-col items-center flex-1">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span class="material-symbols-outlined text-sm">check</span>
          </div>
          <span class="font-caption text-caption text-primary mt-2">اختيار المقاعد</span>
        </div>
        <div class="h-1 bg-primary flex-1"></div>
        <div class="flex flex-col items-center flex-1">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary glow-effect">
            <span class="font-label-md text-label-md">2</span>
          </div>
          <span class="font-label-md text-label-md text-primary mt-2 font-bold">الدفع</span>
        </div>
        <div class="h-1 bg-surface-container-highest flex-1"></div>
        <div class="flex flex-col items-center flex-1">
          <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
            <span class="font-label-md text-label-md">3</span>
          </div>
          <span class="font-caption text-caption text-on-surface-variant mt-2">التأكيد</span>
        </div>
      </div>
    </div>
  `
}

function renderInstapayBox(): string {
  return `
    <div class="w-full flex flex-col items-center md:items-end gap-sm">
      <span class="font-label-md text-label-md text-on-surface-variant">حساب إنستا باي</span>
      <div class="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface-dim px-4 py-3 rounded-lg border border-outline-variant/50">
        <div class="flex-grow text-center sm:text-left min-w-0">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <span class="font-body-md text-body-md text-primary dir-ltr tracking-wide">${INSTAPAY.number}</span>
            <button
              type="button"
              id="copyNumberBtn"
              class="flex items-center justify-center text-primary hover:text-primary-fixed transition-colors p-1 rounded-md hover:bg-white/5"
              title="نسخ الرقم"
              data-copy="${INSTAPAY.number}"
              aria-label="نسخ رقم إنستا باي"
            >
              <span class="material-symbols-outlined text-xl">content_copy</span>
            </button>
          </div>
          <span class="font-caption text-caption text-on-surface-variant block mt-1">${INSTAPAY.ownerName}</span>
          <span class="font-caption text-caption text-on-surface-variant/70 dir-ltr block mt-1">${INSTAPAY.address}</span>
        </div>
      </div>
      <p id="copyFeedback" class="font-caption text-caption text-primary opacity-0 transition-opacity">تم نسخ الرقم!</p>
    </div>
  `
}

function renderEmptyState(): string {
  return `
    <div class="glass-card rounded-xl p-xl text-center max-w-lg mx-auto">
      <span class="material-symbols-outlined text-primary text-[48px] mb-md">payments</span>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm">لا توجد بيانات حجز</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-lg">يرجى إكمال بيانات الحجز أولاً.</p>
      <a href="#/summary" data-link class="inline-flex bg-primary text-on-primary font-label-md text-label-md font-bold py-3 px-8 rounded-lg btn-primary-glow transition-all duration-300">
        العودة لملخص الحجز
      </a>
    </div>
  `
}

export function renderPaymentPage(): string {
  if (!hasActiveBooking()) {
    return `
      <div class="min-h-screen flex flex-col bg-background text-on-surface">
        ${renderHeader()}
        <main class="flex-grow flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop">
          ${renderEmptyState()}
        </main>
      </div>
    `
  }

  return `
    <div class="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      ${renderHeader()}
      <main class="flex-grow flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop">
        <div class="w-full max-w-2xl mx-auto glass-card payment-card rounded-xl p-lg md:p-xl shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          ${renderProgress()}
          <div class="text-center mb-lg">
            <h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-xs">الدفع عبر إنستا باي</h1>
            <p class="font-body-lg text-body-lg text-on-surface-variant">الرجاء إتمام عملية الدفع لتأكيد حجزك.</p>
          </div>
          <div id="paymentLoadError" class="hidden bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md mb-lg font-body-md"></div>
          <div class="bg-surface-container-highest rounded-lg p-lg mb-lg border border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-center md:text-right w-full">
              <span class="font-label-md text-label-md text-on-surface-variant block mb-1">إجمالي المبلغ</span>
              <span class="font-headline-md text-headline-md text-primary font-bold" id="paymentTotal">—</span>
            </div>
            <div class="w-px h-12 bg-outline-variant/30 hidden md:block"></div>
            ${renderInstapayBox()}
          </div>
          <div class="mb-lg">
            <h3 class="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined filled">integration_instructions</span>
              خطوات الدفع
            </h3>
            <ol class="list-decimal list-inside space-y-3 font-body-md text-body-md text-on-surface-variant marker:text-primary marker:font-bold">
              <li>افتح تطبيق إنستا باي على هاتفك.</li>
              <li>قم بتحويل المبلغ المذكور أعلاه بدقة إلى الرقم أو الحساب الموضح.</li>
              <li>خذ لقطة شاشة (Screenshot) لرسالة نجاح العملية.</li>
              <li>ارفع الصورة بالأسفل لتأكيد الحجز.</li>
            </ol>
          </div>
          <div class="bg-error-container/20 border border-error-container rounded-lg p-4 mb-lg flex items-start gap-3">
            <span class="material-symbols-outlined text-error mt-0.5 filled">warning</span>
            <p class="font-body-md text-body-md text-on-error-container m-0">برجاء تحويل المبلغ بالكامل وإرفاق صورة واضحة لعملية الدفع حتى لا يتم إلغاء الحجز.</p>
          </div>
          <div class="mb-xl">
            <input type="file" id="paymentProof" accept="image/jpeg,image/png,image/jpg" class="hidden" />
            <label
              for="paymentProof"
              id="uploadArea"
              class="border-2 border-dashed border-outline-variant rounded-lg p-xl text-center bg-surface-container-highest/50 hover:bg-surface-container-highest hover:border-primary transition-all cursor-pointer group flex flex-col items-center justify-center"
            >
              <div class="w-16 h-16 rounded-full bg-surface-dim flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors" id="uploadIcon">upload_file</span>
              </div>
              <p class="font-body-lg text-body-lg text-on-surface mb-2" id="uploadTitle">اسحب وأفلت الصورة هنا</p>
              <p class="font-caption text-caption text-on-surface-variant mb-4" id="uploadHint">أو انقر لاختيار ملف من جهازك</p>
              <span class="font-caption text-caption text-outline">صيغ مدعومة: JPG, PNG</span>
            </label>
          </div>
          <button
            type="button"
            id="confirmPaymentBtn"
            disabled
            class="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-lg hover:bg-primary-fixed transition-colors shadow-lg active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            تأكيد الحجز
          </button>
          <p class="text-center font-caption text-caption text-on-surface-variant mt-4">
            بمجرد التأكيد، سيتم مراجعة الدفع وإرسال التذاكر إليك.
          </p>
        </div>
      </main>
    </div>
  `
}

async function copyInstapay(text: string, feedback: HTMLElement | null): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    if (feedback) {
      feedback.classList.remove('opacity-0')
      window.setTimeout(() => feedback.classList.add('opacity-0'), 2000)
    }
  } catch {
    // Clipboard unavailable
  }
}

export function bindPaymentPage(root: HTMLElement): void {
  const bookingId = getActiveBookingId()
  const totalEl = root.querySelector('#paymentTotal')
  const loadError = root.querySelector<HTMLDivElement>('#paymentLoadError')

  if (bookingId) {
    void fetchBooking(bookingId)
      .then((booking) => {
        if (totalEl) totalEl.textContent = `${booking.totalAmount} ج.م`
      })
      .catch((err: unknown) => {
        if (loadError) {
          loadError.textContent = err instanceof ApiError ? err.message : 'تعذر تحميل الحجز'
          loadError.classList.remove('hidden')
        }
      })
  }

  const copyBtn = root.querySelector<HTMLButtonElement>('#copyNumberBtn')
  const feedback = root.querySelector('#copyFeedback')

  copyBtn?.addEventListener('click', (event) => {
    event.stopPropagation()
    void copyInstapay(INSTAPAY.number, feedback)
  })

  const fileInput = root.querySelector<HTMLInputElement>('#paymentProof')
  const confirmBtn = root.querySelector<HTMLButtonElement>('#confirmPaymentBtn')
  const uploadTitle = root.querySelector('#uploadTitle')
  const uploadHint = root.querySelector('#uploadHint')
  const uploadIcon = root.querySelector('#uploadIcon')

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (!file) {
      confirmBtn?.setAttribute('disabled', '')
      return
    }
    if (uploadTitle) uploadTitle.textContent = file.name
    if (uploadHint) uploadHint.textContent = 'تم اختيار الملف — يمكنك تغييره بالنقر مرة أخرى'
    if (uploadIcon) uploadIcon.textContent = 'check_circle'
    confirmBtn?.removeAttribute('disabled')
  })

  confirmBtn?.addEventListener('click', () => {
    const file = fileInput?.files?.[0]
    const bookingId = getActiveBookingId()
    if (!file || !bookingId || !confirmBtn) return

    confirmBtn.disabled = true
    confirmBtn.textContent = 'جاري رفع الصورة...'

    void uploadPaymentProof(bookingId, file)
      .then(() => {
        window.location.hash = '#/confirmation'
      })
      .catch((err: unknown) => {
        if (loadError) {
          loadError.textContent = err instanceof ApiError ? err.message : 'فشل رفع الصورة'
          loadError.classList.remove('hidden')
        }
        confirmBtn.disabled = false
        confirmBtn.textContent = 'تأكيد الحجز'
      })
  })
}
