import { fetchSections } from '../api/sections.api'
import type { Section } from '../api/types'
import { ApiError } from '../api/http'
import { setSection } from '../booking/session'
import { renderNav } from '../components/nav'

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

function sectionIcon(slug: string): string {
  return slug === 'balcony' ? 'balcony' : 'chair'
}

function sectionDescription(slug: string): string {
  return slug === 'balcony'
    ? 'إطلالة بانورامية رائعة لكامل المسرح من الأعلى'
    : 'إطلالة قريبة من المسرح وتجربة غامرة'
}

function renderSectionCard(section: Section): string {
  const disabled = !section.visible
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''

  return `
    <button
      type="button"
      data-section-id="${section.id}"
      data-section-slug="${section.slug}"
      data-visible="${section.visible}"
      ${disabled ? 'disabled' : ''}
      class="section-card glass-card rounded-xl p-lg flex flex-col items-center text-center group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary w-full ${disabledClass}"
    >
      ${disabled ? '<span class="absolute top-md left-md bg-error-container/30 text-on-error-container text-xs px-sm py-xs rounded-full border border-error-container/40 z-10">غير متاح</span>' : ''}
      <div class="section-check absolute top-0 right-0 p-md opacity-0 transition-opacity">
        <span class="material-symbols-outlined text-primary">check_circle</span>
      </div>
      <div class="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-md group-hover:gold-glow transition-all">
        <span class="material-symbols-outlined text-primary" style="font-size: 48px;">${sectionIcon(section.slug)}</span>
      </div>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-sm group-hover:text-primary transition-colors">${section.labelAr}</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-md h-12">${sectionDescription(section.slug)}</p>
      <div class="w-full mt-auto pt-md border-t border-outline-variant/30 flex justify-between items-center">
        <div class="font-headline-md text-headline-md text-primary">
          ${section.price} ج.م <span class="font-caption text-caption text-on-surface-variant">/ للفرد</span>
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
        <div id="sectionsError" class="hidden max-w-4xl mx-auto mb-lg bg-error-container/20 border border-error-container text-on-error-container rounded-lg p-md text-center font-body-md"></div>
        <div id="sectionsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl mx-auto">
          <div class="col-span-full text-center py-xl text-on-surface-variant font-body-md">جاري تحميل الأقسام...</div>
        </div>
        <div class="mt-xl flex justify-center">
          <button type="button" id="continueBtn" disabled class="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg shadow-[0_0_20px_rgba(242,202,80,0.3)] transition-all opacity-50 cursor-not-allowed disabled:pointer-events-none">
            متابعة لاختيار المقاعد
          </button>
        </div>
      </main>
    </div>
  `
}

export function bindSectionsPage(root: HTMLElement): void {
  const grid = root.querySelector<HTMLDivElement>('#sectionsGrid')
  const errorEl = root.querySelector<HTMLDivElement>('#sectionsError')
  const continueBtn = root.querySelector<HTMLButtonElement>('#continueBtn')

  let selectedId: string | null = null
  let selectedSlug: string | null = null

  void fetchSections()
    .then((sections) => {
      if (!grid) return

      if (sections.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-xl text-on-surface-variant">لا توجد أقسام متاحة</div>'
        return
      }

      grid.innerHTML = sections.map(renderSectionCard).join('')
      bindSectionCards(root, (id, slug) => {
        selectedId = id
        selectedSlug = slug
        if (continueBtn) {
          continueBtn.disabled = false
          continueBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'disabled:pointer-events-none')
        }
      })
    })
    .catch((err: unknown) => {
      if (grid) grid.innerHTML = ''
      if (errorEl) {
        errorEl.textContent = err instanceof ApiError ? err.message : 'تعذر تحميل الأقسام'
        errorEl.classList.remove('hidden')
      }
    })

  continueBtn?.addEventListener('click', () => {
    if (!selectedId || !selectedSlug) return
    setSection(selectedSlug, selectedId)
    window.location.hash = '#/seats'
  })
}

function bindSectionCards(root: HTMLElement, onSelect: (id: string, slug: string) => void): void {
  const cards = root.querySelectorAll<HTMLButtonElement>('.section-card:not([disabled])')

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.sectionId
      const slug = card.dataset.sectionSlug
      if (!id || !slug) return

      cards.forEach((c) => {
        c.classList.remove('border-primary', 'bg-surface-container-high', 'shadow-[0_0_20px_rgba(242,202,80,0.2)]')
        c.querySelector('.section-check')?.classList.replace('opacity-100', 'opacity-0')
      })

      card.classList.add('border-primary', 'bg-surface-container-high', 'shadow-[0_0_20px_rgba(242,202,80,0.2)]')
      card.querySelector('.section-check')?.classList.replace('opacity-0', 'opacity-100')
      onSelect(id, slug)
    })
  })
}
