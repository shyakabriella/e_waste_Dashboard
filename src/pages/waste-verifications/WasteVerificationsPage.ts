import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

interface WasteCategory {
  id: number
  name: string
  slug?: string
  price_per_kg?: number | string | null
  price_per_item?: number | string | null
  average_weight_kg?: number | string | null
  is_hazardous?: boolean | number
}

interface AiBreakdownItem {
  item_name: string
  category_id?: number | null
  category_name?: string | null
  quantity?: number
  unit_weight_kg?: number
  total_weight_kg?: number
  line_expected_price?: number
  confidence?: number
  reason?: string
}

interface AiAnalysis {
  id: number
  detected_item?: string | null
  detected_category_name?: string | null
  estimated_weight_kg?: number | string | null
  confidence?: number | string | null
  analysis_result?: {
    item_breakdown?: AiBreakdownItem[]
    expected_price?: number | string | null
    estimated_weight_kg?: number | string | null
    analysis_note?: string
  }
}

interface WasteListing {
  id: number
  title: string
  description?: string | null
  status?: string
  quantity?: number
  estimated_weight_kg?: number | string | null
  expected_price?: number | string | null
  currency?: string
  ai_detected_item?: string | null
  ai_detected_category?: string | null
  ai_estimated_weight_kg?: number | string | null
  ai_confidence?: number | string | null
  category?: WasteCategory | null
  ai_analyses?: AiAnalysis[]
  aiAnalyses?: AiAnalysis[]
  institution?: {
    name?: string
    email?: string
    institution_name?: string | null
  }
}

interface Verification {
  id: number
  status?: string
  condition_status?: string
  verified_weight_kg?: number | string
  verified_total_price?: number | string
  currency?: string
  waste_listing?: WasteListing
  wasteListing?: WasteListing
  confirmed_category?: WasteCategory
  confirmedCategory?: WasteCategory
}

type ListingResponse = WasteListing[] | PaginatedResponse<WasteListing>
type CategoryResponse = WasteCategory[] | PaginatedResponse<WasteCategory>
type VerificationResponse = Verification[] | PaginatedResponse<Verification>

let categories: WasteCategory[] = []
let selectedListing: WasteListing | null = null
let isSavingVerification = false

export function renderWasteVerificationsPage(): string {
  return DashboardLayout(
    'Waste Verification',
    `
      <div class="space-y-5">
        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Staff Verification
          </p>

          <h1 class="mt-2 text-2xl font-black tracking-tight">
            Verify AI Listing Before Final Bill
          </h1>

          <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
            Review AI detected items, enter real verified quantity and real verified kilograms, then approve or reject the listing.
          </p>
        </section>

        <section class="grid gap-5 xl:grid-cols-[430px_1fr]">
          <div class="space-y-5">
            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-lg font-black text-[#020617]">
                    Listings Waiting Verification
                  </h3>
                  <p class="mt-1 text-xs font-semibold text-slate-400">
                    Select a listing to inspect AI result.
                  </p>
                </div>

                <button id="refreshVerifyListings" class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white">
                  Refresh
                </button>
              </div>

              <div id="verificationMessage" class="mt-4 hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

              <div id="verifyListingsList" class="mt-4 space-y-3">
                <div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Loading listings...
                </div>
              </div>
            </div>

            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <h3 class="text-lg font-black text-[#020617]">
                Recent Verifications
              </h3>

              <div id="verificationsList" class="mt-4 space-y-3">
                <div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Loading verifications...
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[24px] bg-white p-5 shadow-sm">
            <div id="verificationPanel">
              <div class="rounded-2xl bg-[#f6f8fc] p-6 text-center">
                <h3 class="text-lg font-black text-[#020617]">
                  Select a listing
                </h3>

                <p class="mt-2 text-sm font-semibold text-slate-500">
                  Choose an AI-analyzed listing from the left to verify real category, kg, and final bill.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  )
}

export function initWasteVerificationsPage(): void {
  document.querySelector<HTMLButtonElement>('#refreshVerifyListings')?.addEventListener('click', () => {
    loadVerifyListings()
  })

  loadCategories()
  loadVerifyListings()
  loadVerifications()
}

async function loadCategories(): Promise<void> {
  try {
    const response = await api.get<CategoryResponse>('/waste-categories?per_page=100&status=active')
    categories = normalizeList(response)
  } catch {
    categories = []
  }
}

async function loadVerifyListings(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#verifyListingsList')

  if (!container) {
    return
  }

  container.innerHTML = loadingBox('Loading listings...')

  try {
    const response = await api.get<ListingResponse>('/waste-listings?per_page=100&status=ai_analyzed')
    const listings = normalizeList(response)

    if (!listings.length) {
      container.innerHTML = emptyBox('No AI-analyzed listings waiting for verification.')
      return
    }

    container.innerHTML = listings.map(renderListingCard).join('')

    container.querySelectorAll<HTMLButtonElement>('[data-select-listing]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.selectListing)
        selectListing(id)
      })
    })
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load listings.'))
  }
}

async function selectListing(id: number): Promise<void> {
  showMessage('Loading listing details...', 'info')

  try {
    const listing = await api.get<WasteListing>(`/waste-listings/${id}`)
    selectedListing = listing
    renderVerificationPanel(listing)
    showMessage('Listing loaded. Review AI breakdown and verify.', 'success')
  } catch (error: unknown) {
    showMessage(getErrorMessage(error, 'Failed to load listing.'), 'error')
  }
}

async function loadVerifications(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#verificationsList')

  if (!container) {
    return
  }

  container.innerHTML = loadingBox('Loading verifications...')

  try {
    const response = await api.get<VerificationResponse>('/waste-verifications?per_page=20')
    const verifications = normalizeList(response)

    if (!verifications.length) {
      container.innerHTML = emptyBox('No verifications yet.')
      return
    }

    container.innerHTML = verifications.map(renderVerificationCard).join('')
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load verifications.'))
  }
}

function renderVerificationPanel(listing: WasteListing): void {
  const panel = document.querySelector<HTMLDivElement>('#verificationPanel')

  if (!panel) {
    return
  }

  const latestAi = getLatestAiAnalysis(listing)
  const breakdown = latestAi?.analysis_result?.item_breakdown || []
  const categoryId = listing.category?.id || getFirstCategoryIdFromBreakdown(breakdown)

  panel.innerHTML = `
    <div>
      <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Selected Listing
          </p>

          <h2 class="mt-1 text-2xl font-black text-[#020617]">
            ${escapeHtml(listing.title || `Listing #${listing.id}`)}
          </h2>

          <p class="mt-1 text-sm font-semibold text-slate-500">
            ${escapeHtml(listing.ai_detected_item || listing.description || 'AI-analyzed listing')}
          </p>
        </div>

        <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
          ${escapeHtml(listing.status || '-')}
        </span>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-4">
        ${summaryCard('AI Kg', String(listing.ai_estimated_weight_kg || latestAi?.estimated_weight_kg || listing.estimated_weight_kg || 0))}
        ${summaryCard('AI Bill', `${listing.currency || 'RWF'} ${listing.expected_price || 0}`)}
        ${summaryCard('AI Category', listing.ai_detected_category || listing.category?.name || '-')}
        ${summaryCard('Confidence', `${listing.ai_confidence || latestAi?.confidence || '-'}%`)}
      </div>

      ${renderAiBreakdownTable(breakdown)}

      <form id="verifyForm" class="mt-5 rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Final Staff Verification
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Confirmed Category</label>
            <select name="confirmed_category_id" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="">Select category</option>
              ${categories.map((category) => `
                <option value="${category.id}" ${category.id === categoryId ? 'selected' : ''}>
                  ${escapeHtml(category.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Condition</label>
            <select name="condition_status" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="partially_damaged">Partially Damaged</option>
              <option value="hazardous">Hazardous</option>
              <option value="not_e_waste">Not E-Waste</option>
              <option value="not_accepted">Not Accepted</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Verified Quantity</label>
            <input name="verified_quantity" type="number" min="0" value="${estimateQuantity(breakdown, listing)}" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Verified Kg</label>
            <input id="verifiedWeightInput" name="verified_weight_kg" type="number" min="0" step="0.01" value="${listing.ai_estimated_weight_kg || listing.estimated_weight_kg || latestAi?.estimated_weight_kg || 0}" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Price Per Kg</label>
            <input id="pricePerKgInput" name="price_per_kg" type="number" min="0" step="0.01" value="${getCategoryPricePerKg(categoryId)}" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Final Price</label>
            <input id="finalPriceInput" name="verified_total_price" type="number" min="0" step="0.01" value="0" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>
        </div>

        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <label class="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-600">
            <input name="is_accepted" type="checkbox" checked />
            Accept waste
          </label>

          <label class="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-600">
            <input name="is_hazardous" type="checkbox" />
            Mark hazardous
          </label>
        </div>

        <div class="mt-3">
          <label class="mb-1 block text-xs font-black text-slate-600">Verification Notes</label>
          <textarea name="verification_notes" class="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Staff verification notes"></textarea>
        </div>

        <button id="saveVerificationButton" type="submit" class="mt-4 h-11 w-full rounded-xl bg-[#020617] text-sm font-black text-white transition hover:bg-[#0b1633] disabled:cursor-not-allowed disabled:opacity-60">
          Save Verification
        </button>
      </form>
    </div>
  `

  bindVerifyForm(breakdown, latestAi?.id)
  calculateFinalPrice()
}

function bindVerifyForm(breakdown: AiBreakdownItem[], aiAnalysisId?: number): void {
  const form = document.querySelector<HTMLFormElement>('#verifyForm')
  const weightInput = document.querySelector<HTMLInputElement>('#verifiedWeightInput')
  const priceInput = document.querySelector<HTMLInputElement>('#pricePerKgInput')
  const saveButton = document.querySelector<HTMLButtonElement>('#saveVerificationButton')

  weightInput?.addEventListener('input', calculateFinalPrice)
  priceInput?.addEventListener('input', calculateFinalPrice)

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (isSavingVerification) {
      return
    }

    if (!selectedListing) {
      showMessage('Select listing first.', 'error')
      return
    }

    isSavingVerification = true

    if (saveButton) {
      saveButton.disabled = true
      saveButton.textContent = 'Saving verification...'
    }

    form.classList.add('opacity-70', 'pointer-events-none')

    const listingId = selectedListing.id
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries()) as Record<string, string | File>

    const verifiedItems = breakdown.map((item) => ({
      item_name: item.item_name,
      category_id: item.category_id || null,
      category_name: item.category_name || null,
      verified_quantity: item.quantity || 0,
      verified_weight_kg: item.total_weight_kg || 0,
      condition_status: payload.condition_status || 'good',
      notes: item.reason || '',
    }))

    const body = {
      waste_listing_id: listingId,
      waste_ai_analysis_id: aiAnalysisId,
      confirmed_category_id: numberOrNull(payload.confirmed_category_id),
      verified_weight_kg: numberOrNull(payload.verified_weight_kg),
      verified_quantity: numberOrNull(payload.verified_quantity),
      condition_status: String(payload.condition_status || 'good'),
      is_accepted: form.querySelector<HTMLInputElement>('input[name="is_accepted"]')?.checked || false,
      is_hazardous: form.querySelector<HTMLInputElement>('input[name="is_hazardous"]')?.checked || false,
      price_per_kg: numberOrNull(payload.price_per_kg),
      verified_total_price: numberOrNull(payload.verified_total_price),
      verification_notes: String(payload.verification_notes || ''),
      verified_items: verifiedItems,
    }

    showMessage('Saving verification... Please wait.', 'info')
    showSavingOverlay('Saving verification...')

    try {
      await api.post('/waste-verifications', body)

      showMessage('Waste verification saved successfully. Ready for next listing.', 'success')
      showCompletedPanel()

      selectedListing = null

      await loadVerifyListings()
      await loadVerifications()
    } catch (error: unknown) {
      isSavingVerification = false
      form.classList.remove('opacity-70', 'pointer-events-none')

      if (saveButton) {
        saveButton.disabled = false
        saveButton.textContent = 'Save Verification'
      }

      showMessage(getErrorMessage(error, 'Failed to save verification.'), 'error')
    }
  })
}


function showSavingOverlay(message: string): void {
  const panel = document.querySelector<HTMLDivElement>('#verificationPanel')

  if (!panel) {
    return
  }

  const overlay = document.createElement('div')
  overlay.id = 'verificationSavingOverlay'
  overlay.className =
    'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm'

  overlay.innerHTML = `
    <div class="w-full max-w-sm animate-pulse rounded-[24px] bg-white p-6 text-center shadow-2xl">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#020617] text-2xl text-white">
        ✓
      </div>

      <h3 class="mt-4 text-lg font-black text-[#020617]">
        ${escapeHtml(message)}
      </h3>

      <p class="mt-2 text-sm font-semibold text-slate-500">
        Please wait. Do not click again.
      </p>
    </div>
  `

  document.body.appendChild(overlay)
}

function removeSavingOverlay(): void {
  document.querySelector<HTMLDivElement>('#verificationSavingOverlay')?.remove()
}

function showCompletedPanel(): void {
  removeSavingOverlay()

  const panel = document.querySelector<HTMLDivElement>('#verificationPanel')

  if (!panel) {
    return
  }

  panel.innerHTML = `
    <div class="rounded-[24px] border border-green-100 bg-green-50 p-8 text-center">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-4xl text-white shadow-lg">
        ✓
      </div>

      <h3 class="mt-5 text-2xl font-black text-green-800">
        Verification Saved
      </h3>

      <p class="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-green-700">
        This listing has been verified successfully. Select another AI-analyzed listing from the left side when a new one is available.
      </p>

      <button
        id="resetVerificationPanelButton"
        type="button"
        class="mt-6 rounded-xl bg-[#020617] px-5 py-3 text-sm font-black text-white"
      >
        Wait for New Listing
      </button>
    </div>
  `

  document
    .querySelector<HTMLButtonElement>('#resetVerificationPanelButton')
    ?.addEventListener('click', () => {
      renderEmptyVerificationPanel()
    })

  setTimeout(() => {
    renderEmptyVerificationPanel()
  }, 2200)
}

function renderEmptyVerificationPanel(): void {
  removeSavingOverlay()

  const panel = document.querySelector<HTMLDivElement>('#verificationPanel')

  if (!panel) {
    return
  }

  panel.innerHTML = `
    <div class="rounded-2xl bg-[#f6f8fc] p-6 text-center">
      <h3 class="text-lg font-black text-[#020617]">
        Waiting for new listing
      </h3>

      <p class="mt-2 text-sm font-semibold text-slate-500">
        Choose another AI-analyzed listing from the left to verify real category, kg, and final bill.
      </p>
    </div>
  `

  isSavingVerification = false
}

function calculateFinalPrice(): void {
  const weight = Number(document.querySelector<HTMLInputElement>('#verifiedWeightInput')?.value || 0)
  const price = Number(document.querySelector<HTMLInputElement>('#pricePerKgInput')?.value || 0)
  const total = weight * price

  const finalInput = document.querySelector<HTMLInputElement>('#finalPriceInput')

  if (finalInput) {
    finalInput.value = String(Math.round(total))
  }
}

function renderAiBreakdownTable(items: AiBreakdownItem[]): string {
  if (!items.length) {
    return `
      <div class="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
        No AI item breakdown found for this listing.
      </div>
    `
  }

  return `
    <div class="mt-5 overflow-hidden rounded-2xl border border-slate-100">
      <div class="bg-[#020617] px-4 py-3">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-white">
          AI Detected Item Breakdown
        </p>
      </div>

      <table class="w-full text-left text-xs">
        <thead class="bg-[#f6f8fc] font-black uppercase text-slate-500">
          <tr>
            <th class="px-3 py-2">Item</th>
            <th class="px-3 py-2">Category</th>
            <th class="px-3 py-2">Qty</th>
            <th class="px-3 py-2">Kg</th>
            <th class="px-3 py-2">AI Price</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          ${items.map((item) => `
            <tr>
              <td class="px-3 py-2">
                <p class="font-black text-[#020617]">${escapeHtml(item.item_name || '-')}</p>
                <p class="text-[11px] font-semibold text-slate-400">${escapeHtml(item.reason || '')}</p>
              </td>
              <td class="px-3 py-2 font-bold text-slate-600">${escapeHtml(item.category_name || '-')}</td>
              <td class="px-3 py-2 font-bold text-slate-600">${escapeHtml(String(item.quantity || 0))}</td>
              <td class="px-3 py-2 font-black text-[#020617]">${escapeHtml(String(item.total_weight_kg || 0))}</td>
              <td class="px-3 py-2 font-bold text-slate-600">RWF ${escapeHtml(String(item.line_expected_price || 0))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderListingCard(listing: WasteListing): string {
  return `
    <article class="rounded-2xl border border-slate-100 p-4 transition hover:bg-[#f6f8fc]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-black text-[#020617]">${escapeHtml(listing.title || `Listing #${listing.id}`)}</h4>
          <p class="mt-1 text-xs font-semibold text-slate-400">${escapeHtml(listing.ai_detected_item || listing.description || '-')}</p>
          <p class="mt-2 text-xs font-black text-slate-600">
            AI Kg: ${escapeHtml(String(listing.ai_estimated_weight_kg || listing.estimated_weight_kg || 0))}
            • Bill: ${escapeHtml(listing.currency || 'RWF')} ${escapeHtml(String(listing.expected_price || 0))}
          </p>
        </div>

        <button data-select-listing="${listing.id}" class="rounded-xl bg-[#020617] px-3 py-2 text-xs font-black text-white">
          Verify
        </button>
      </div>
    </article>
  `
}

function renderVerificationCard(verification: Verification): string {
  const listing = verification.wasteListing || verification.waste_listing
  const category = verification.confirmedCategory || verification.confirmed_category

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <p class="font-black text-[#020617]">${escapeHtml(listing?.title || `Verification #${verification.id}`)}</p>
      <p class="mt-1 text-xs font-semibold text-slate-400">
        ${escapeHtml(category?.name || '-')} • ${escapeHtml(String(verification.verified_weight_kg || 0))} kg
      </p>
      <p class="mt-2 text-xs font-black text-slate-600">
        ${escapeHtml(verification.currency || 'RWF')} ${escapeHtml(String(verification.verified_total_price || 0))}
        • ${escapeHtml(verification.status || '-')}
      </p>
    </article>
  `
}

function getLatestAiAnalysis(listing: WasteListing): AiAnalysis | undefined {
  const analyses = listing.aiAnalyses || listing.ai_analyses || []
  return analyses[0]
}

function getFirstCategoryIdFromBreakdown(items: AiBreakdownItem[]): number | undefined {
  return items.find((item) => item.category_id)?.category_id || undefined
}

function getCategoryPricePerKg(categoryId?: number): number {
  const category = categories.find((item) => item.id === categoryId)
  return Number(category?.price_per_kg || 700)
}

function estimateQuantity(items: AiBreakdownItem[], listing: WasteListing): number {
  const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  return total || Number(listing.quantity || 1)
}

function summaryCard(label: string, value: string): string {
  return `
    <div class="rounded-xl bg-[#f6f8fc] px-4 py-3">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">${label}</p>
      <p class="mt-1 text-sm font-black text-[#020617]">${escapeHtml(value)}</p>
    </div>
  `
}

function normalizeList<T>(response: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.data || []
}

function loadingBox(message: string): string {
  return `<div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">${escapeHtml(message)}</div>`
}

function emptyBox(message: string): string {
  return `<div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">${escapeHtml(message)}</div>`
}

function errorBox(message: string): string {
  return `<div class="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">${escapeHtml(message)}</div>`
}

function showMessage(message: string, type: 'success' | 'error' | 'info'): void {
  const messageBox = document.querySelector<HTMLDivElement>('#verificationMessage')

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

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : null
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
