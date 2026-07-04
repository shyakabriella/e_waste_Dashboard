import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

interface WasteCategory {
  id: number
  name: string
  slug?: string
  waste_nature?: string
  price_per_kg?: string | number | null
  price_per_item?: string | number | null
}

interface WasteListing {
  id: number
  title?: string
  description?: string | null
  status?: string
  quantity?: number
  estimated_weight_kg?: string | number | null
  ai_estimated_weight_kg?: string | number | null
  verified_weight_kg?: string | number | null
  expected_price?: string | number | null
  final_price?: string | number | null
  currency?: string
  ai_detected_item?: string | null
  ai_detected_category?: string | null
  ai_confidence?: string | number | null
  pickup_address?: string | null
  district?: string | null
  sector?: string | null
  cell?: string | null
  village?: string | null
  institution?: {
    name?: string
    email?: string
    phone?: string
    institution_name?: string | null
  }
  company?: {
    name?: string
    email?: string
    phone?: string
    institution_name?: string | null
  }
  category?: WasteCategory | null
  created_at?: string
}

type ListingResponse = WasteListing[] | PaginatedResponse<WasteListing>

export function renderWasteListingsPage(): string {
  return DashboardLayout(
    'Waste Listings',
    `
      <div class="space-y-5">

        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Customer Waste Listings
              </p>

              <h1 class="mt-2 text-2xl font-black tracking-tight">
                Waste Listings From Customers
              </h1>

              <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Customers create waste listings from the mobile app. Admin can view submitted listings, AI results, estimated kilograms, bill, customer, pickup address and status.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              ${summaryCard('Total', 'listingsTotalCount')}
              ${summaryCard('AI Analyzed', 'listingsAiCount')}
              ${summaryCard('Verified', 'listingsVerifiedCount')}
              ${summaryCard('Completed', 'listingsCompletedCount')}
            </div>
          </div>
        </section>

        <section class="rounded-[24px] bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 class="text-lg font-black text-[#020617]">
                Customer Listings
              </h3>

              <p class="mt-1 text-xs font-semibold text-slate-400">
                Admin view only. Listing creation is handled by customer mobile app.
              </p>
            </div>

            <button
              id="refreshListings"
              type="button"
              class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white"
            >
              Refresh
            </button>
          </div>

          <form id="listingFilterForm" class="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <input
              id="listingSearch"
              class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
              placeholder="Search customer, listing, category, address..."
            />

            <select
              id="listingStatus"
              class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ai_analyzed">AI Analyzed</option>
              <option value="verified">Verified</option>
              <option value="offer_sent">Offer Sent</option>
              <option value="offer_accepted">Offer Accepted</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              type="submit"
              class="h-10 rounded-xl border border-slate-200 px-4 text-xs font-black text-[#020617] hover:bg-slate-50"
            >
              Filter
            </button>
          </form>

          <div class="mt-4 overflow-hidden rounded-2xl border border-slate-100">
            <table class="w-full text-left text-sm">
              <thead class="bg-[#f6f8fc] text-xs font-black uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">Listing</th>
                  <th class="px-4 py-3">Customer</th>
                  <th class="px-4 py-3">Category</th>
                  <th class="px-4 py-3">Kg</th>
                  <th class="px-4 py-3">Bill</th>
                  <th class="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody id="listingsTable" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                    Loading listings...
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

export function initWasteListingsPage(): void {
  bindListingFilters()
  bindButtons()
  loadListings()
}

function bindButtons(): void {
  document.querySelector<HTMLButtonElement>('#refreshListings')?.addEventListener('click', () => {
    loadListings()
  })
}

function bindListingFilters(): void {
  const form = document.querySelector<HTMLFormElement>('#listingFilterForm')
  const status = document.querySelector<HTMLSelectElement>('#listingStatus')

  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    loadListings()
  })

  status?.addEventListener('change', () => {
    loadListings()
  })
}

async function loadListings(): Promise<void> {
  const table = document.querySelector<HTMLTableSectionElement>('#listingsTable')

  if (!table) {
    return
  }

  table.innerHTML = `
    <tr>
      <td colspan="6" class="px-4 py-8 text-center text-slate-500">
        Loading listings...
      </td>
    </tr>
  `

  try {
    const query = buildListingQuery()
    const response = await api.get<ListingResponse>(`/waste-listings${query}`)
    const listings = normalizeListings(response)

    updateSummary(listings)

    if (!listings.length) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-slate-500">
            No customer waste listings found.
          </td>
        </tr>
      `
      return
    }

    table.innerHTML = listings.map((listing) => renderListingRow(listing)).join('')
  } catch (error: unknown) {
    table.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-red-600">
          ${escapeHtml(getErrorMessage(error, 'Failed to load listings.'))}
        </td>
      </tr>
    `
  }
}

function buildListingQuery(): string {
  const search = document.querySelector<HTMLInputElement>('#listingSearch')?.value.trim() || ''
  const status = document.querySelector<HTMLSelectElement>('#listingStatus')?.value || 'all'

  const params = new URLSearchParams()
  params.set('per_page', '100')

  if (search) {
    params.set('search', search)
  }

  if (status !== 'all') {
    params.set('status', status)
  }

  return `?${params.toString()}`
}

function renderListingRow(listing: WasteListing): string {
  const category = listing.category?.name || listing.ai_detected_category || '-'
  const weight =
    listing.verified_weight_kg ??
    listing.estimated_weight_kg ??
    listing.ai_estimated_weight_kg ??
    '-'

  const price = listing.final_price ?? listing.expected_price ?? 0
  const customer = getCustomerName(listing)
  const customerContact = getCustomerContact(listing)

  return `
    <tr class="hover:bg-[#f6f8fc]">
      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">${escapeHtml(listing.title || `Listing #${listing.id}`)}</p>
        <p class="text-xs font-semibold text-slate-400">
          ${escapeHtml(listing.ai_detected_item || listing.description || 'Customer waste item')}
        </p>
        <p class="mt-1 text-[11px] font-semibold text-slate-400">
          ${escapeHtml(listing.pickup_address || '-')}
        </p>
      </td>

      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">${escapeHtml(customer)}</p>
        <p class="text-xs font-semibold text-slate-400">${escapeHtml(customerContact)}</p>
      </td>

      <td class="px-4 py-3">
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#020617]">
          ${escapeHtml(category)}
        </span>
      </td>

      <td class="px-4 py-3 font-semibold text-slate-500">
        ${escapeHtml(String(weight))} kg
      </td>

      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">
          ${escapeHtml(listing.currency || 'RWF')} ${escapeHtml(String(price))}
        </p>
        <p class="text-xs font-semibold text-slate-400">
          Qty: ${escapeHtml(String(listing.quantity ?? 1))}
        </p>
      </td>

      <td class="px-4 py-3">
        <span class="rounded-full px-3 py-1 text-xs font-black ${statusClass(listing.status)}">
          ${escapeHtml(listing.status || '-')}
        </span>
      </td>
    </tr>
  `
}

function normalizeListings(response: ListingResponse): WasteListing[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.data || []
}

function getCustomerName(listing: WasteListing): string {
  return (
    listing.institution?.institution_name ||
    listing.institution?.name ||
    listing.company?.institution_name ||
    listing.company?.name ||
    '-'
  )
}

function getCustomerContact(listing: WasteListing): string {
  return (
    listing.institution?.email ||
    listing.institution?.phone ||
    listing.company?.email ||
    listing.company?.phone ||
    '-'
  )
}

function updateSummary(listings: WasteListing[]): void {
  setText('listingsTotalCount', String(listings.length))
  setText(
    'listingsAiCount',
    String(listings.filter((listing) => listing.status === 'ai_analyzed').length),
  )
  setText(
    'listingsVerifiedCount',
    String(listings.filter((listing) => listing.status === 'verified').length),
  )
  setText(
    'listingsCompletedCount',
    String(listings.filter((listing) => listing.status === 'completed').length),
  )
}

function summaryCard(label: string, id: string): string {
  return `
    <div class="rounded-2xl bg-white/10 px-4 py-3">
      <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${label}</p>
      <p id="${id}" class="mt-1 text-xl font-black text-white">...</p>
    </div>
  `
}

function setText(id: string, value: string): void {
  const element = document.getElementById(id)

  if (element) {
    element.textContent = value
  }
}

function statusClass(status?: string): string {
  if (
    status === 'ai_analyzed' ||
    status === 'verified' ||
    status === 'offer_sent' ||
    status === 'offer_accepted' ||
    status === 'pickup_scheduled' ||
    status === 'completed'
  ) {
    return 'bg-green-50 text-green-700'
  }

  if (status === 'rejected' || status === 'cancelled') {
    return 'bg-red-50 text-red-700'
  }

  return 'bg-slate-100 text-slate-500'
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
