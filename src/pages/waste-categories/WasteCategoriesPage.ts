import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

type CategoryStatus = 'active' | 'inactive'

interface WasteCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  waste_nature?: string
  is_e_waste?: boolean | number
  is_hazardous?: boolean | number
  average_weight_kg?: string | number | null
  min_weight_kg?: string | number | null
  max_weight_kg?: string | number | null
  price_per_kg?: string | number | null
  price_per_item?: string | number | null
  currency?: string | null
  status?: CategoryStatus
}

interface SyncLibraryResponse {
  total_library_items: number
  created: number
  updated: number
}

type CategoryResponse = WasteCategory[] | PaginatedResponse<WasteCategory>

export function renderWasteCategoriesPage(): string {
  return DashboardLayout(
    'Waste Categories',
    `
      <div class="space-y-5">

        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Standard E-Waste Library
              </p>

              <h1 class="mt-2 text-2xl font-black tracking-tight">
                Category Weight & Price Reference
              </h1>

              <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                This library stores common electronic components with normal kilograms and estimated prices.
                AI listings use this library to calculate realistic weight and bill.
              </p>
            </div>

            <button
              id="syncLibraryButton"
              type="button"
              class="h-11 rounded-xl bg-white px-5 text-sm font-black text-[#020617] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sync Standard Library
            </button>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-4">
          ${statCard('Total Categories', 'categoriesTotal')}
          ${statCard('Hazardous', 'categoriesHazardous')}
          ${statCard('Bulk Support', 'categoriesBulk')}
          ${statCard('Active', 'categoriesActive')}
        </section>

        <section class="rounded-[24px] bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 class="text-lg font-black text-[#020617]">
                E-Waste Reference Items
              </h3>

              <p class="mt-1 text-xs font-semibold text-slate-400">
                Listing AI will match detected items to these records.
              </p>
            </div>

            <div class="flex gap-3">
              <input
                id="categorySearch"
                class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617] xl:w-72"
                placeholder="Search category..."
              />

              <button
                id="refreshCategories"
                type="button"
                class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white"
              >
                Refresh
              </button>
            </div>
          </div>

          <div id="categoryMessage" class="mt-4 hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

          <div class="mt-4 overflow-hidden rounded-2xl border border-slate-100">
            <table class="w-full text-left text-sm">
              <thead class="bg-[#f6f8fc] text-xs font-black uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">Component</th>
                  <th class="px-4 py-3">Normal Kg</th>
                  <th class="px-4 py-3">Range</th>
                  <th class="px-4 py-3">Price</th>
                  <th class="px-4 py-3">Safety</th>
                </tr>
              </thead>

              <tbody id="categoriesTable" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,
  )
}

export function initWasteCategoriesPage(): void {
  document.querySelector<HTMLButtonElement>('#syncLibraryButton')?.addEventListener('click', () => {
    syncStandardLibrary()
  })

  document.querySelector<HTMLButtonElement>('#refreshCategories')?.addEventListener('click', () => {
    loadCategories()
  })

  document.querySelector<HTMLInputElement>('#categorySearch')?.addEventListener('input', () => {
    loadCategories()
  })

  loadCategories()
}

async function syncStandardLibrary(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('#syncLibraryButton')

  if (button) {
    button.disabled = true
    button.textContent = 'Syncing...'
  }

  showMessage('Syncing standard e-waste category library...', 'info')

  try {
    const response = await api.post<SyncLibraryResponse>('/waste-categories/sync-standard-library')

    showMessage(
      `Library synced. Created: ${response.created}, Updated: ${response.updated}, Total: ${response.total_library_items}.`,
      'success',
    )

    await loadCategories()
  } catch (error: unknown) {
    showMessage(getErrorMessage(error, 'Failed to sync library.'), 'error')
  } finally {
    if (button) {
      button.disabled = false
      button.textContent = 'Sync Standard Library'
    }
  }
}

async function loadCategories(): Promise<void> {
  const table = document.querySelector<HTMLTableSectionElement>('#categoriesTable')

  if (!table) {
    return
  }

  table.innerHTML = `
    <tr>
      <td colspan="5" class="px-4 py-8 text-center text-slate-500">
        Loading categories...
      </td>
    </tr>
  `

  try {
    const search = document.querySelector<HTMLInputElement>('#categorySearch')?.value.trim() || ''
    const params = new URLSearchParams()

    params.set('per_page', '100')

    if (search) {
      params.set('search', search)
    }

    const response = await api.get<CategoryResponse>(`/waste-categories?${params.toString()}`)
    const categories = normalizeCategories(response)

    updateStats(categories)

    if (!categories.length) {
      table.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-slate-500">
            No categories found. Click Sync Standard Library.
          </td>
        </tr>
      `
      return
    }

    table.innerHTML = categories.map((category) => renderCategoryRow(category)).join('')
  } catch (error: unknown) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-red-600">
          ${escapeHtml(getErrorMessage(error, 'Failed to load categories.'))}
        </td>
      </tr>
    `
  }
}

function renderCategoryRow(category: WasteCategory): string {
  return `
    <tr class="hover:bg-[#f6f8fc]">
      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">${escapeHtml(category.name)}</p>
        <p class="mt-1 text-xs font-semibold text-slate-400">${escapeHtml(category.description || category.slug || '-')}</p>
      </td>

      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">${escapeHtml(String(category.average_weight_kg ?? '-'))} kg</p>
        <p class="text-xs font-semibold text-slate-400">normal weight</p>
      </td>

      <td class="px-4 py-3 font-semibold text-slate-500">
        ${escapeHtml(String(category.min_weight_kg ?? '-'))} kg -
        ${escapeHtml(String(category.max_weight_kg ?? '-'))} kg
      </td>

      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">
          ${escapeHtml(category.currency || 'RWF')} ${escapeHtml(String(category.price_per_kg ?? 0))} / kg
        </p>
        <p class="text-xs font-semibold text-slate-400">
          Item: ${escapeHtml(String(category.price_per_item ?? 0))}
        </p>
      </td>

      <td class="px-4 py-3">
        <span class="rounded-full px-3 py-1 text-xs font-black ${
          Boolean(category.is_hazardous)
            ? 'bg-red-50 text-red-700'
            : 'bg-green-50 text-green-700'
        }">
          ${Boolean(category.is_hazardous) ? 'Hazardous' : 'Normal'}
        </span>
      </td>
    </tr>
  `
}

function updateStats(categories: WasteCategory[]): void {
  const hazardous = categories.filter((category) => Boolean(category.is_hazardous)).length
  const active = categories.filter((category) => category.status === 'active').length
  const bulk = categories.filter((category) =>
    category.slug?.includes('bulk') || category.slug?.includes('mixed'),
  ).length

  setText('categoriesTotal', String(categories.length))
  setText('categoriesHazardous', String(hazardous))
  setText('categoriesBulk', String(bulk))
  setText('categoriesActive', String(active))
}

function statCard(label: string, id: string): string {
  return `
    <article class="rounded-[22px] bg-white p-4 shadow-sm">
      <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        ${label}
      </p>

      <h3 id="${id}" class="mt-2 text-2xl font-black text-[#020617]">
        ...
      </h3>
    </article>
  `
}

function normalizeCategories(response: CategoryResponse): WasteCategory[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.data || []
}

function showMessage(message: string, type: 'success' | 'error' | 'info'): void {
  const messageBox = document.querySelector<HTMLDivElement>('#categoryMessage')

  if (!messageBox) {
    return
  }

  const colorClass =
    type === 'success'
      ? 'bg-green-50 text-green-700'
      : type === 'error'
        ? 'bg-red-50 text-red-700'
        : 'bg-blue-50 text-blue-700'

  messageBox.textContent = message
  messageBox.className = `mt-4 rounded-xl px-4 py-3 text-sm font-bold ${colorClass}`
}

function setText(id: string, value: string): void {
  const element = document.getElementById(id)

  if (element) {
    element.textContent = value
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
