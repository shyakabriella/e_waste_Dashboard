import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

interface UserSummary {
  id?: number
  name?: string
  email?: string
  role?: string
  institution_name?: string | null
  phone?: string | null
}

interface WasteListing {
  id: number
  title?: string
  status?: string
  quantity?: number
  estimated_weight_kg?: number | string | null
  expected_price?: number | string | null
  verified_weight_kg?: number | string | null
  final_price?: number | string | null
  currency?: string
  institution?: UserSummary
}

interface WasteOffer {
  id: number
  waste_listing_id?: number
  offer_amount?: number | string
  currency?: string
  offer_type?: string
  status?: string
  message?: string | null
  response_note?: string | null
  expires_at?: string | null
  created_at?: string
  waste_listing?: WasteListing
  wasteListing?: WasteListing
  offered_by?: UserSummary
  offeredBy?: UserSummary
  offered_to?: UserSummary
  offeredTo?: UserSummary
  responded_by?: UserSummary
  respondedBy?: UserSummary
}

type ListingResponse = WasteListing[] | PaginatedResponse<WasteListing>
type OfferResponse = WasteOffer[] | PaginatedResponse<WasteOffer>

let selectedListing: WasteListing | null = null

export function renderWasteOffersPage(): string {
  return DashboardLayout(
    'Waste Offers',
    `
      <div class="space-y-5">
        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Waste Offers
          </p>

          <h1 class="mt-2 text-2xl font-black tracking-tight">
            Send Offer After Staff Verification
          </h1>

          <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
            Create an offer from verified waste, send it to the institution, and track accept/reject response before pickup or payout.
          </p>
        </section>

        <section class="grid gap-5 xl:grid-cols-[430px_1fr]">
          <div class="space-y-5">
            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-lg font-black text-[#020617]">
                    Verified Listings
                  </h3>
                  <p class="mt-1 text-xs font-semibold text-slate-400">
                    Select verified waste to send offer.
                  </p>
                </div>

                <button id="refreshOfferListings" class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white">
                  Refresh
                </button>
              </div>

              <div id="offerMessage" class="mt-4 hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

              <div id="offerListingsList" class="mt-4 space-y-3">
                <div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Loading verified listings...
                </div>
              </div>
            </div>

            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <h3 class="text-lg font-black text-[#020617]">
                Offers
              </h3>

              <form id="offerFilterForm" class="mt-4 grid grid-cols-[1fr_auto] gap-3">
                <select id="offerStatusFilter" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
                  <option value="all">All Offers</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button class="h-10 rounded-xl border border-slate-200 px-4 text-xs font-black text-[#020617] hover:bg-slate-50">
                  Filter
                </button>
              </form>

              <div id="offersList" class="mt-4 space-y-3">
                <div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Loading offers...
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[24px] bg-white p-5 shadow-sm">
            <div id="offerPanel">
              <div class="rounded-2xl bg-[#f6f8fc] p-6 text-center">
                <h3 class="text-lg font-black text-[#020617]">
                  Select verified listing
                </h3>

                <p class="mt-2 text-sm font-semibold text-slate-500">
                  Choose a verified waste listing from the left side, review final kg and price, then send offer.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  )
}

export function initWasteOffersPage(): void {
  document.querySelector<HTMLButtonElement>('#refreshOfferListings')?.addEventListener('click', () => {
    loadOfferListings()
    loadOffers()
  })

  document.querySelector<HTMLFormElement>('#offerFilterForm')?.addEventListener('submit', (event) => {
    event.preventDefault()
    loadOffers()
  })

  document.querySelector<HTMLSelectElement>('#offerStatusFilter')?.addEventListener('change', () => {
    loadOffers()
  })

  loadOfferListings()
  loadOffers()
}

async function loadOfferListings(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#offerListingsList')

  if (!container) {
    return
  }

  container.innerHTML = infoBox('Loading verified listings...')

  try {
    const response = await api.get<ListingResponse>('/waste-listings?per_page=100&status=verified')
    const listings = normalizeList(response)

    if (!listings.length) {
      container.innerHTML = infoBox('No verified listings ready for offer.')
      return
    }

    container.innerHTML = listings.map(renderListingCard).join('')

    container.querySelectorAll<HTMLButtonElement>('[data-select-offer-listing]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.selectOfferListing)
        const listing = listings.find((item) => item.id === id)

        if (listing) {
          selectedListing = listing
          renderOfferPanel(listing)
          showMessage('Verified listing selected. Create offer now.', 'success')
        }
      })
    })
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load verified listings.'))
  }
}

async function loadOffers(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#offersList')

  if (!container) {
    return
  }

  const status = document.querySelector<HTMLSelectElement>('#offerStatusFilter')?.value || 'all'
  const params = new URLSearchParams()
  params.set('per_page', '100')

  if (status !== 'all') {
    params.set('status', status)
  }

  container.innerHTML = infoBox('Loading offers...')

  try {
    const response = await api.get<OfferResponse>(`/waste-offers?${params.toString()}`)
    const offers = normalizeList(response)

    if (!offers.length) {
      container.innerHTML = infoBox('No offers found.')
      return
    }

    container.innerHTML = offers.map(renderOfferCard).join('')

    container.querySelectorAll<HTMLButtonElement>('[data-accept-offer]').forEach((button) => {
      button.addEventListener('click', () => respondOffer(Number(button.dataset.acceptOffer), 'accepted'))
    })

    container.querySelectorAll<HTMLButtonElement>('[data-reject-offer]').forEach((button) => {
      button.addEventListener('click', () => respondOffer(Number(button.dataset.rejectOffer), 'rejected'))
    })
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load offers.'))
  }
}

function renderOfferPanel(listing: WasteListing): void {
  const panel = document.querySelector<HTMLDivElement>('#offerPanel')

  if (!panel) {
    return
  }

  const verifiedWeight = Number(listing.verified_weight_kg || listing.estimated_weight_kg || 0)
  const finalPrice = Number(listing.final_price || listing.expected_price || 0)

  panel.innerHTML = `
    <div>
      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        Selected Verified Waste
      </p>

      <h2 class="mt-1 text-2xl font-black text-[#020617]">
        ${escapeHtml(listing.title || `Listing #${listing.id}`)}
      </h2>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        ${summaryCard('Verified Kg', `${verifiedWeight} kg`)}
        ${summaryCard('Final Price', `${listing.currency || 'RWF'} ${finalPrice}`)}
        ${summaryCard('Institution', listing.institution?.institution_name || listing.institution?.name || '-')}
      </div>

      <form id="createOfferForm" class="mt-5 rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Create Offer
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Offer Amount</label>
            <input name="offer_amount" type="number" min="0" step="0.01" value="${finalPrice}" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Offer Type</label>
            <select name="offer_type" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="initial_offer">Initial Offer</option>
              <option value="counter_offer">Counter Offer</option>
              <option value="final_offer">Final Offer</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Currency</label>
            <input name="currency" value="${listing.currency || 'RWF'}" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Expires At</label>
            <input name="expires_at" type="datetime-local" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>
        </div>

        <div class="mt-3">
          <label class="mb-1 block text-xs font-black text-slate-600">Message</label>
          <textarea name="message" class="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#020617]">Offer generated after staff verification. Verified weight: ${verifiedWeight} kg. Offer amount: ${listing.currency || 'RWF'} ${finalPrice}.</textarea>
        </div>

        <button type="submit" class="mt-4 h-11 w-full rounded-xl bg-[#020617] text-sm font-black text-white transition hover:bg-[#0b1633]">
          Send Offer
        </button>
      </form>
    </div>
  `

  bindCreateOfferForm()
}

function bindCreateOfferForm(): void {
  const form = document.querySelector<HTMLFormElement>('#createOfferForm')

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!selectedListing) {
      showMessage('Select a verified listing first.', 'error')
      return
    }

    const formData = new FormData(form)
    const body = {
      waste_listing_id: selectedListing.id,
      offer_amount: numberOrNull(formData.get('offer_amount')),
      currency: String(formData.get('currency') || 'RWF'),
      offer_type: String(formData.get('offer_type') || 'initial_offer'),
      message: String(formData.get('message') || ''),
      expires_at: String(formData.get('expires_at') || '') || null,
    }

    showMessage('Sending offer...', 'info')

    try {
      await api.post('/waste-offers', body)
      showMessage('Offer sent successfully.', 'success')
      selectedListing = null
      await loadOfferListings()
      await loadOffers()

      const panel = document.querySelector<HTMLDivElement>('#offerPanel')
      if (panel) {
        panel.innerHTML = infoBox('Offer sent. Select another verified listing.')
      }
    } catch (error: unknown) {
      showMessage(getErrorMessage(error, 'Failed to send offer.'), 'error')
    }
  })
}

async function respondOffer(id: number, status: 'accepted' | 'rejected'): Promise<void> {
  const responseNote = status === 'accepted'
    ? 'Offer accepted from dashboard.'
    : 'Offer rejected from dashboard.'

  showMessage(`${status === 'accepted' ? 'Accepting' : 'Rejecting'} offer...`, 'info')

  try {
    await api.post(`/waste-offers/${id}/respond`, {
      status,
      response_note: responseNote,
    })

    showMessage(`Offer ${status} successfully.`, 'success')
    await loadOfferListings()
    await loadOffers()
  } catch (error: unknown) {
    showMessage(getErrorMessage(error, `Failed to ${status} offer.`), 'error')
  }
}

function renderListingCard(listing: WasteListing): string {
  const verifiedWeight = listing.verified_weight_kg || listing.estimated_weight_kg || 0
  const finalPrice = listing.final_price || listing.expected_price || 0

  return `
    <article class="rounded-2xl border border-slate-100 p-4 transition hover:bg-[#f6f8fc]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-black text-[#020617]">${escapeHtml(listing.title || `Listing #${listing.id}`)}</h4>
          <p class="mt-1 text-xs font-semibold text-slate-400">
            ${escapeHtml(listing.institution?.institution_name || listing.institution?.name || 'Institution')}
          </p>
          <p class="mt-2 text-xs font-black text-slate-600">
            Verified Kg: ${escapeHtml(String(verifiedWeight))}
            • Final: ${escapeHtml(listing.currency || 'RWF')} ${escapeHtml(String(finalPrice))}
          </p>
        </div>

        <button data-select-offer-listing="${listing.id}" class="rounded-xl bg-[#020617] px-3 py-2 text-xs font-black text-white">
          Offer
        </button>
      </div>
    </article>
  `
}

function renderOfferCard(offer: WasteOffer): string {
  const listing = offer.wasteListing || offer.waste_listing
  const offeredTo = offer.offeredTo || offer.offered_to

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-black text-[#020617]">
            ${escapeHtml(listing?.title || `Offer #${offer.id}`)}
          </p>

          <p class="mt-1 text-xs font-semibold text-slate-400">
            To: ${escapeHtml(offeredTo?.institution_name || offeredTo?.name || offeredTo?.email || '-')}
          </p>

          <p class="mt-2 text-sm font-black text-[#020617]">
            ${escapeHtml(offer.currency || 'RWF')} ${escapeHtml(String(offer.offer_amount || 0))}
          </p>

          <p class="mt-1 text-xs font-semibold text-slate-500">
            ${escapeHtml(offer.message || '')}
          </p>
        </div>

        <span class="rounded-full px-3 py-1 text-xs font-black ${statusClass(offer.status)}">
          ${escapeHtml(offer.status || '-')}
        </span>
      </div>

      ${offer.status === 'pending'
        ? `
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button data-accept-offer="${offer.id}" class="h-9 rounded-xl bg-green-600 text-xs font-black text-white">
              Accept
            </button>
            <button data-reject-offer="${offer.id}" class="h-9 rounded-xl bg-red-600 text-xs font-black text-white">
              Reject
            </button>
          </div>
        `
        : ''
      }
    </article>
  `
}

function summaryCard(label: string, value: string): string {
  return `
    <div class="rounded-xl bg-[#f6f8fc] px-4 py-3">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">${label}</p>
      <p class="mt-1 text-sm font-black text-[#020617]">${escapeHtml(value)}</p>
    </div>
  `
}

function statusClass(status?: string): string {
  if (status === 'accepted') {
    return 'bg-green-50 text-green-700'
  }

  if (status === 'rejected' || status === 'cancelled') {
    return 'bg-red-50 text-red-700'
  }

  return 'bg-blue-50 text-blue-700'
}

function normalizeList<T>(response: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.data || []
}

function infoBox(message: string): string {
  return `<div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">${escapeHtml(message)}</div>`
}

function errorBox(message: string): string {
  return `<div class="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">${escapeHtml(message)}</div>`
}

function showMessage(message: string, type: 'success' | 'error' | 'info'): void {
  const messageBox = document.querySelector<HTMLDivElement>('#offerMessage')

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
