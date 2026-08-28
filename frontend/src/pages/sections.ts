import { renderNav } from '../components/nav'
import { SEAT_PRICE } from '../constants'

const sections = [
  {
    id: 'ground',
    icon: 'chair',
    title: 'الدور الأرضي',
    description: 'إطلالة قريبة من المسرح وتجربة غامرة',
    availableSeats: 45,
  },
  {
    id: 'balcony',
    icon: 'balcony',
    title: 'البالكون',
    description: 'إطلالة بانورامية رائعة لكامل المسرح من الأعلى',
    availableSeats: 20,
  },
] as const

function renderProgress(): string {
  return `
    <div class="flex justify-center items-center mb-xl">
      <div class="flex items-center gap-sm">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high border border-primary text-primary font-label-md text-label-md">1</div>
        <div class="h-px w-8 bg-primary"></div>
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_0_12px_rgba(242,202,80,0.5)]">2</div>
        <div class="h-px w-8 bg-surface-variant"></div>
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">3</div>
      </div>
    </div>
  `
}

function renderSectionCard(section: (typeof sections)[number]): string {
  return `
    <button
      type="button"
      data-section="${section.id}"
      class="section-card glass-card rounded-xl p-lg flex flex-col items-center text-center group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary w-full"
    >
      <div class="section-check absolute top-0 right-0 p-md opacity-0 transition-opacity">
        <span class="material-symbols-outlined text-primary">check_circle</span>
      </div>
      <div class="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-md group-hover:gold-glow transition-all">
        <span class="material-symbols-outlined text-primary" style="font-size: 48px;">${section.icon}</span>
      </div>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm group-hover:text-primary transition-colors">${section.title}</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-md h-12">${section.description}</p>
      <div class="w-full mt-auto pt-md border-t border-outline-variant/30 flex justify-between items-center">
        <div class="flex items-center gap-xs text-secondary-fixed">
          <span class="material-symbols-outlined text-sm">event_seat</span>
          <span class="font-label-md text-label-md">${section.availableSeats} مقعد متاح</span>
        </div>
        <div class="font-headline-md text-headline-md text-primary">
          ${SEAT_PRICE} ج.م <span class="font-caption text-caption text-on-surface-variant">/ للفرد</span>
        </div>
      </div>
    </button>
  `
}

export function renderSectionsPage(): string {
  return `
    <div class="page-radial min-h-screen flex flex-col">
      ${renderNav()}
      <main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        ${renderProgress()}
        <div class="text-center mb-xl">
          <p class="font-label-md text-label-md text-primary mb-xs">الخطوة 2 من 3</p>
          <h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">اختر القسم المفضل</h1>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl mx-auto">
          ${sections.map(renderSectionCard).join('')}
        </div>
        <div class="mt-xl flex justify-center">
          <button
            type="button"
            id="continueBtn"
            disabled
            class="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg shadow-[0_0_20px_rgba(242,202,80,0.3)] hover:shadow-[0_0_30px_rgba(242,202,80,0.5)] transition-all transform hover:-translate-y-1 opacity-50 cursor-not-allowed disabled:pointer-events-none"
          >
            متابعة لاختيار المقاعد
          </button>
        </div>
      </main>
    </div>
  `
}

export function bindSectionsPage(root: HTMLElement): void {
  const cards = root.querySelectorAll<HTMLButtonElement>('.section-card')
  const continueBtn = root.querySelector<HTMLButtonElement>('#continueBtn')
  let selectedId: string | null = null

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      selectedId = card.dataset.section ?? null

      cards.forEach((c) => {
        c.classList.remove(
          'border-primary',
          'bg-surface-container-high',
          'shadow-[0_0_20px_rgba(242,202,80,0.2)]',
        )
        const check = c.querySelector('.section-check')
        check?.classList.remove('opacity-100')
        check?.classList.add('opacity-0')
      })

      card.classList.add(
        'border-primary',
        'bg-surface-container-high',
        'shadow-[0_0_20px_rgba(242,202,80,0.2)]',
      )
      const selectedCheck = card.querySelector('.section-check')
      selectedCheck?.classList.remove('opacity-0')
      selectedCheck?.classList.add('opacity-100')

      if (continueBtn) {
        continueBtn.disabled = false
        continueBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'disabled:pointer-events-none')
      }
    })
  })

  continueBtn?.addEventListener('click', () => {
    if (!selectedId) return
    sessionStorage.setItem('selectedSection', selectedId)
    window.location.hash = '#/seats'
  })
}
