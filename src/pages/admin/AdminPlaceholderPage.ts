import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

interface WastePhoto {
  id?: number
  photo_path?: string | null
  path?: string | null
  url?: string | null
  photo_url?: string | null
  image_url?: string | null
  original_name?: string | null
  is_primary?: boolean | number
}

interface Institution {
  id?: number
  name?: string
  email?: string
  phone?: string
  institution_name?: string | null
}

interface WasteListing {
  id: number
  title?: string
  description?: string | null
  status?: string
  quantity?: number | string | null
  estimated_weight_kg?: number | string | null
  verified_weight_kg?: number | string | null
  expected_price?: number | string | null
  final_price?: number | string | null
  currency?: string | null
  ai_detected_item?: string | null
  ai_detected_category?: string | null
  institution?: Institution | null

  pickup_address?: string | null
  pickupAddress?: string | null
  location?: string | null
  
  location_address?: string | null
  locationAddress?: string | null
  address?: string | null
  street_address?: string | null
  streetAddress?: string | null
  province?: string | null
  city?: string | null
  district?: string | null
  sector?: string | null
  cell?: string | null
  village?: string | null

  latitude?: number | string | null
  longitude?: number | string | null
  lat?: number | string | null
  lng?: number | string | null
  pickup_latitude?: number | string | null
  pickup_longitude?: number | string | null
  pickupLatitude?: number | string | null
  pickupLongitude?: number | string | null
  location_latitude?: number | string | null
  location_longitude?: number | string | null

  primary_photo?: WastePhoto | null
  primaryPhoto?: WastePhoto | null
  photos?: WastePhoto[]
  waste_photos?: WastePhoto[]
  wastePhotos?: WastePhoto[]
}

interface DriverRoleObject {
  id?: number | string | null
  name?: string | null
  slug?: string | null
}

interface Driver {
  id: number
  name?: string
  email?: string
  phone?: string
  role?: string | number | DriverRoleObject | null
  role_id?: number | string | null
  roleId?: number | string | null
  role_name?: string | null
  roleName?: string | null
  role_slug?: string | null
  roleSlug?: string | null
  roles?: DriverRoleObject[]
  status?: string
  availability_status?: string | null
  current_latitude?: number | string | null
  current_longitude?: number | string | null
  latitude?: number | string | null
  longitude?: number | string | null
  lat?: number | string | null
  lng?: number | string | null
  location_address?: string | null
  address?: string | null
}

type ListingResponse = WasteListing[] | PaginatedResponse<WasteListing>
type DriverResponse = Driver[] | PaginatedResponse<Driver>

interface BackendRole {
  id?: number | string | null
  name?: string | null
  slug?: string | null
}

type RoleResponse = BackendRole[] | PaginatedResponse<BackendRole>

interface WalletUser {
  id: number
  name?: string
  email?: string
  phone?: string | null
  role?: string | number | DriverRoleObject | null
  role_name?: string | null
  roleName?: string | null
  status?: string
  wallet_balance?: number | string | null
  points_balance?: number | string | null
  institution_name?: string | null
}

interface WalletTransaction {
  id: number
  user_id?: number | null
  pickup_id?: number | null
  type?: string | null
  transaction_type?: string | null
  direction?: string | null
  amount?: number | string | null
  balance_before?: number | string | null
  balance_after?: number | string | null
  currency?: string | null
  status?: string | null
  description?: string | null
  notes?: string | null
  reference?: string | null
  created_at?: string | null
  user?: WalletUser | null
  pickup?: {
    id?: number
    pickup_code?: string | null
    status?: string | null
  } | null
}

interface WalletPayout {
  id: number
  user_id?: number | null
  pickup_id?: number | null
  amount?: number | string | null
  currency?: string | null
  status?: string | null
  method?: string | null
  payout_method?: string | null
  reference?: string | null
  notes?: string | null
  created_at?: string | null
  paid_at?: string | null
  user?: WalletUser | null
  pickup?: {
    id?: number
    pickup_code?: string | null
  } | null
}


interface WalletPickup {
  id: number
  waste_listing_id?: number | string | null
  driver_id?: number | string | null
  pickup_code?: string | null
  status?: string | null
  driver?: WalletUser | null
  waste_listing?: WasteListing | null
  wasteListing?: WasteListing | null
}

interface WalletShareRow {
  owner: string
  listing: string
  base: number
  amount: number
  note: string
  currency?: string | null
}

type WalletPayableType = 'driver' | 'recycler'

interface WalletMomoPayoutRecord {
  paid_amount: number
  phone: string
  reference: string
  paid_at: string
}

interface WalletMomoPayoutProgress {
  assigned: number
  paid: number
  remaining: number
  phone: string
  reference: string
  paidAt: string
  isPaid: boolean
}

type WalletPickupResponse = WalletPickup[] | PaginatedResponse<WalletPickup>

interface WalletCommission {
  id: number
  institution_id?: number | null
  pickup_id?: number | null
  amount?: number | string | null
  commission_amount?: number | string | null
  rate?: number | string | null
  commission_rate?: number | string | null
  currency?: string | null
  status?: string | null
  created_at?: string | null
  institution?: WalletUser | null
  pickup?: {
    id?: number
    pickup_code?: string | null
  } | null
}

type WalletUserResponse = WalletUser[] | PaginatedResponse<WalletUser>
type WalletTransactionResponse = WalletTransaction[] | PaginatedResponse<WalletTransaction>
type WalletPayoutResponse = WalletPayout[] | PaginatedResponse<WalletPayout>
type WalletCommissionResponse = WalletCommission[] | PaginatedResponse<WalletCommission>



let driverMatchingListings: WasteListing[] = []
let driverMatchingDrivers: Driver[] = []
let backendRoles: BackendRole[] = []
let selectedMatchingListing: WasteListing | null = null
let isAssigningDriver = false
let activeAssignmentEndpoint = '/pickups'

let walletUsers: WalletUser[] = []
let walletTransactions: WalletTransaction[] = []
let walletPayouts: WalletPayout[] = []
let walletCommissions: WalletCommission[] = []
let activeWalletEndpoint = '/wallet-transactions'
let walletWasteListings: WasteListing[] = []
let walletPickups: WalletPickup[] = []

const WALLET_MOMO_PAYOUT_STORAGE_KEY = 'ewaste_wallet_momo_payouts_v1'
let isProcessingMomoPayment = false
let walletMomoPayoutRecords = createEmptyWalletMomoPayoutRecords()


export function renderAdminPlaceholderPage(title: string, description: string, endpoint: string): string {
  const shouldRenderWallet = /wallet|transaction|payout|commission|finance|payment|balance/i.test(
    `${title} ${description} ${endpoint}`,
  )

  const shouldRenderDriverMatching = /driver|deiver|match|pickup|assign|institution/i.test(
    `${title} ${description} ${endpoint}`,
  )

  if (shouldRenderWallet) {
    activeWalletEndpoint = endpoint && endpoint !== '#' ? endpoint : '/wallet-transactions'

    window.setTimeout(() => {
      initWalletPage().catch(() => undefined)
    }, 0)

    return DashboardLayout(
      title || 'Wallet',
      `
        <div class="space-y-5">
          <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
            <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Wallet Management
            </p>

            <h1 class="mt-2 text-2xl font-black tracking-tight">
              Wallet Overview
            </h1>

            <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
              View institution and driver wallet balances, wallet transactions, payouts, and commissions.
            </p>
          </section>

          <div id="walletMessage" class="hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

          <section id="walletDashboardContent" class="space-y-5">
            ${loadingBox('Loading wallet information...')}
          </section>
        </div>
      `,
    )
  }

  if (!shouldRenderDriverMatching) {
    return DashboardLayout(
      title,
      `
        <div class="flex h-full items-center justify-center">
          <section class="w-full max-w-2xl rounded-[26px] bg-white p-8 text-center shadow-sm">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#020617] text-2xl font-black text-white">
              EW
            </div>

            <h1 class="mt-5 text-2xl font-black text-[#020617]">
              ${escapeHtml(title)}
            </h1>

            <p class="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500">
              ${escapeHtml(description)}
            </p>

            <div class="mx-auto mt-6 max-w-md rounded-2xl bg-[#f6f8fc] px-5 py-4 text-left">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Backend API
              </p>

              <p class="mt-2 font-mono text-sm font-bold text-[#020617]">
                ${escapeHtml(endpoint)}
              </p>
            </div>

            <p class="mt-5 text-xs font-semibold text-slate-400">
              We will integrate this page next.
            </p>
          </section>
        </div>
      `,
    )
  }

  activeAssignmentEndpoint = endpoint && endpoint !== '#' ? endpoint : '/pickups'

  window.setTimeout(() => {
    initDriverMatchingPage().catch(() => undefined)
  }, 0)

  return DashboardLayout(
    title || 'Driver Matching',
    `
      <div class="space-y-5">
        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Pickup Assignment
          </p>

          <h1 class="mt-2 text-2xl font-black tracking-tight">
            Match Driver to Institution E-Waste
          </h1>

          <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
            Select verified institution e-waste, review image, kg, final bill, and pickup location, then assign a driver for collection.
          </p>
        </section>

        <div id="driverMatchingMessage" class="hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

        <section class="grid gap-5 xl:grid-cols-[430px_1fr]">
          <div class="space-y-5">
            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-lg font-black text-[#020617]">
                    Institution E-Waste
                  </h3>
                  <p class="mt-1 text-xs font-semibold text-slate-400">
                    Choose verified waste ready for pickup.
                  </p>
                </div>

                <button id="refreshDriverMatchingButton" class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white">
                  Refresh
                </button>
              </div>

              <div class="mt-4">
                <label class="mb-1 block text-xs font-black text-slate-600">Listing Status</label>
                <select id="driverMatchingStatusFilter" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
                  <option value="verified">Verified / Ready for Pickup</option>
                  <option value="approved">Approved</option>
                  <option value="ai_analyzed">AI Analyzed</option>
                  <option value="pending">Pending</option>
                  <option value="all">All Listings</option>
                </select>
              </div>

              <div id="driverMatchingListings" class="mt-4 space-y-3">
                ${loadingBox('Loading institution e-waste...')}
              </div>
            </div>

            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <h3 class="text-lg font-black text-[#020617]">
                Available Drivers
              </h3>

              <p class="mt-1 text-xs font-semibold text-slate-400">
                Drivers are loaded from users with role driver.
              </p>

              <div id="driverMatchingDrivers" class="mt-4 space-y-3">
                ${loadingBox('Loading drivers...')}
              </div>
            </div>
          </div>

          <div class="rounded-[24px] bg-white p-5 shadow-sm">
            <div id="driverMatchingPanel">
              ${renderEmptyMatchingPanel()}
            </div>
          </div>
        </section>
      </div>
    `,
  )
}


async function initWalletPage(): Promise<void> {
  loadWalletMomoPayoutRecords()
  await loadWalletData()
}

async function loadWalletData(): Promise<void> {
  showWalletContent(loadingBox('Loading wallet information...'))

  await Promise.all([
    loadWalletUsers(),
    loadWalletTransactions(),
    loadWalletPayouts(),
    loadWalletCommissions(),
    loadWalletWasteListings(),
    loadWalletPickups(),
  ])

  renderWalletDashboard()
}

async function loadWalletUsers(): Promise<void> {
  const endpoints = [
    '/users?per_page=200',
    '/drivers?per_page=200&status=all',
  ]

  const users: WalletUser[] = []

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<WalletUserResponse>(endpoint)
      normalizeList<WalletUser>(response).forEach((user) => {
        if (!users.some((existing) => String(existing.id) === String(user.id))) {
          users.push(user)
        }
      })
    } catch {
      // Ignore unavailable endpoint
    }
  }

  walletUsers = users
}

async function loadWalletTransactions(): Promise<void> {
  const endpoints = [
    activeWalletEndpoint,
    '/wallet-transactions?per_page=200',
    '/wallet/transactions?per_page=200',
  ]

  walletTransactions = await loadFirstAvailableList<WalletTransaction>(endpoints)
}

async function loadWalletPayouts(): Promise<void> {
  walletPayouts = await loadFirstAvailableList<WalletPayout>([
    '/payouts?per_page=200',
    '/wallet-payouts?per_page=200',
  ])
}

async function loadWalletCommissions(): Promise<void> {
  walletCommissions = await loadFirstAvailableList<WalletCommission>([
    '/commissions?per_page=200',
    '/wallet-commissions?per_page=200',
  ])
}


async function loadWalletWasteListings(): Promise<void> {
  const endpoints = [
    '/waste-listings?per_page=500',
    '/waste-listings?per_page=500&status=verified',
    '/waste-listings?per_page=500&status=pickup_scheduled',
    '/waste-listings?per_page=500&status=completed',
  ]

  const listings: WasteListing[] = []

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<ListingResponse>(endpoint)

      normalizeList<WasteListing>(response).forEach((listing) => {
        if (!listings.some((existing) => String(existing.id) === String(listing.id))) {
          listings.push(listing)
        }
      })
    } catch {
      // Try next endpoint
    }
  }

  walletWasteListings = listings
}


async function loadWalletPickups(): Promise<void> {
  walletPickups = await loadFirstAvailableList<WalletPickup>([
    '/pickups?per_page=500',
  ])
}

async function loadFirstAvailableList<T>(endpoints: string[]): Promise<T[]> {
  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint)
      const items = normalizeList<T>(response)

      if (items.length) {
        return items
      }
    } catch {
      // Try next endpoint
    }
  }

  return []
}

function renderWalletDashboard(): void {
  const totalWasteValue = walletWasteListings.reduce((sum, listing) => {
    return sum + getListingMoneyValue(listing)
  }, 0)

  const platformCommission = calculateShare(totalWasteValue, 20)
  const driverAssignedMoney = calculateShare(totalWasteValue, 30)
  const recyclerCompanyMoney = calculateShare(totalWasteValue, 50)
  const driverPayout = getWalletMomoPayoutProgress('driver', driverAssignedMoney)
  const recyclerPayout = getWalletMomoPayoutProgress('recycler', recyclerCompanyMoney)

  showWalletContent(`
    <div id="walletModalRoot"></div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      ${walletMetricCard('Total E-Waste Value', formatMoney(totalWasteValue), 'All listed e-waste')}
      ${walletClickableMetricCard('Platform commission', formatMoney(platformCommission), '20% system commission', 'platform')}
      ${walletPayoutMetricCard('Driver assigned', driverPayout, '30% assigned to drivers', 'driver')}
      ${walletPayoutMetricCard('Recycler company', recyclerPayout, '50% recycler company share', 'recycler')}
    </div>

    <div class="flex flex-col gap-3 rounded-[24px] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h3 class="text-lg font-black text-[#020617]">
          E-Waste Money Distribution
        </h3>
        <p class="mt-1 text-xs font-semibold text-slate-400">
          Driver and recycler shares can be paid using Mobile Money. Completed payments remain saved after page refresh.
        </p>
      </div>

      <button id="refreshWalletButton" class="rounded-xl bg-[#020617] px-4 py-3 text-xs font-black text-white">
        Refresh Wallet
      </button>
    </div>

    <section class="grid gap-5 xl:grid-cols-[460px_1fr]">
      <div class="space-y-5">
        <div class="rounded-[24px] bg-white p-5 shadow-sm">
          <h3 class="text-lg font-black text-[#020617]">
            Assigned User Balances
          </h3>

          <p class="mt-1 text-xs font-semibold text-slate-400">
            Pay the assigned driver and recycler company using MoMo, then view the payment status and remaining balance.
          </p>

          <div class="mt-4 space-y-3">
            ${renderCalculatedWalletBalances(platformCommission, driverAssignedMoney, recyclerCompanyMoney)}
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <div class="rounded-[24px] bg-white p-5 shadow-sm">
          <h3 class="text-lg font-black text-[#020617]">
            All Listed E-Waste Money Split
          </h3>

          <div class="mt-4 overflow-x-auto">
            ${
              walletWasteListings.length
                ? renderWasteMoneyTable(walletWasteListings)
                : emptyBox('No listed e-waste found.')
            }
          </div>
        </div>

        <div class="rounded-[24px] bg-white p-5 shadow-sm">
          <h3 class="text-lg font-black text-[#020617]">
            Wallet Transactions
          </h3>

          <div class="mt-4 space-y-3">
            ${
              walletTransactions.length
                ? walletTransactions.map(renderWalletTransactionCard).join('')
                : emptyBox('No wallet transactions found.')
            }
          </div>
        </div>
      </div>
    </section>
  `)

  document.querySelector<HTMLButtonElement>('#refreshWalletButton')?.addEventListener('click', () => {
    loadWalletData().catch((error: unknown) => {
      showWalletMessage(getErrorMessage(error, 'Failed to refresh wallet information.'), 'error')
    })
  })

  bindWalletShareCards()
  bindWalletMomoPaymentButtons()
}

function renderWasteMoneyTable(listings: WasteListing[]): string {
  const rows = listings.map((listing) => {
    const total = getListingMoneyValue(listing)
    const platformCommission = calculateShare(total, 20)
    const driverAssigned = calculateShare(total, 30)
    const recyclerCompany = calculateShare(total, 50)

    return `
      <tr class="border-b border-slate-100">
        <td class="min-w-[240px] px-3 py-3">
          <p class="font-black text-[#020617]">${escapeHtml(listing.title || `Listing #${listing.id}`)}</p>
          <p class="mt-1 text-[11px] font-bold text-slate-400">${escapeHtml(getInstitutionName(listing))}</p>
        </td>
        <td class="whitespace-nowrap px-3 py-3 text-right text-xs font-black text-[#020617]">${escapeHtml(formatMoney(total, listing.currency || 'RWF'))}</td>
        <td class="whitespace-nowrap px-3 py-3 text-right text-xs font-black text-blue-700">${escapeHtml(formatMoney(platformCommission, listing.currency || 'RWF'))}</td>
        <td class="whitespace-nowrap px-3 py-3 text-right text-xs font-black text-green-700">${escapeHtml(formatMoney(driverAssigned, listing.currency || 'RWF'))}</td>
        <td class="whitespace-nowrap px-3 py-3 text-right text-xs font-black text-purple-700">${escapeHtml(formatMoney(recyclerCompany, listing.currency || 'RWF'))}</td>
      </tr>
    `
  }).join('')

  return `
    <table class="w-full min-w-[760px] border-collapse text-left">
      <thead>
        <tr class="border-b border-slate-200 bg-[#f6f8fc]">
          <th class="px-3 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">E-Waste</th>
          <th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Total</th>
          <th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Platform 20%</th>
          <th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Driver assigned 30%</th>
          <th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Recycler company 50%</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

function getListingMoneyValue(listing: WasteListing): number {
  const finalPrice = parseMoney(listing.final_price)

  if (finalPrice > 0) {
    return finalPrice
  }

  return parseMoney(listing.expected_price)
}

function calculateShare(total: number, percentage: number): number {
  return total * percentage / 100
}

function renderCalculatedWalletBalances(
  platformCommission: number,
  driverAssignedMoney: number,
  recyclerCompanyMoney: number,
): string {
  return [
    renderAssignedBalanceCard({
      title: 'Platform commission',
      subtitle: 'System commission from all listed e-waste',
      percent: '20%',
      amount: platformCommission,
      modalType: 'platform',
    }),
    renderAssignedBalanceCard({
      title: 'Driver assigned',
      subtitle: 'Money to pay to the assigned driver or drivers',
      percent: '30%',
      amount: driverAssignedMoney,
      modalType: 'driver',
      payableType: 'driver',
    }),
    renderAssignedBalanceCard({
      title: 'Recycler company',
      subtitle: 'Money to pay to the recycler company',
      percent: '50%',
      amount: recyclerCompanyMoney,
      modalType: 'recycler',
      payableType: 'recycler',
    }),
  ].join('')
}

function renderAssignedBalanceCard(data: {
  title: string
  subtitle: string
  percent: string
  amount: number
  modalType?: string
  payableType?: WalletPayableType
}): string {
  const payout = data.payableType
    ? getWalletMomoPayoutProgress(data.payableType, data.amount)
    : null

  const isPaid = Boolean(payout?.isPaid && payout.assigned > 0)
  const borderClass = isPaid ? 'border-green-200 bg-green-50/40' : 'border-slate-100 bg-white'

  return `
    <article class="rounded-2xl border ${borderClass} p-4 transition hover:border-[#020617]">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-black text-[#020617]">${escapeHtml(data.title)}</p>
            ${
              isPaid
                ? '<span class="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase text-green-700">Paid successfully</span>'
                : data.payableType
                  ? '<span class="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700">Payment pending</span>'
                  : ''
            }
          </div>

          <p class="mt-1 text-xs font-semibold text-slate-400">${escapeHtml(data.subtitle)}</p>
          <p class="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
            ${escapeHtml(data.percent)}
          </p>
        </div>

        <div class="text-right">
          <p class="text-xs font-black uppercase text-slate-400">
            ${data.payableType ? 'Assigned' : 'Commission'}
          </p>
          <p class="mt-1 text-sm font-black text-[#020617]">
            ${escapeHtml(formatMoneyWithDecimals(data.amount))}
          </p>
        </div>
      </div>

      ${
        payout
          ? `
            <div class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Paid</p>
                <p class="mt-1 text-sm font-black text-green-700">${escapeHtml(formatMoneyWithDecimals(payout.paid))}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Remaining</p>
                <p class="mt-1 text-sm font-black ${payout.remaining <= 0 ? 'text-green-700' : 'text-red-700'}">
                  ${escapeHtml(formatMoneyWithDecimals(payout.remaining))}
                </p>
              </div>
            </div>

            ${
              isPaid
                ? `
                  <div class="mt-3 rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-800">
                    ✓ ${escapeHtml(data.title)} got the payment through MoMo
                    ${payout.reference ? `<span class="block mt-1 text-[10px]">Reference: ${escapeHtml(payout.reference)}</span>` : ''}
                  </div>
                `
                : ''
            }
          `
          : ''
      }

      <div class="mt-4 grid gap-2 ${data.payableType ? 'grid-cols-2' : 'grid-cols-1'}">
        ${
          data.modalType
            ? `
              <button
                type="button"
                data-wallet-modal="${escapeAttribute(data.modalType)}"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-[#020617] transition hover:border-[#020617]"
              >
                View details
              </button>
            `
            : ''
        }

        ${
          data.payableType
            ? `
              <button
                type="button"
                data-wallet-pay="${escapeAttribute(data.payableType)}"
                ${payout && (payout.remaining <= 0 || payout.assigned <= 0) ? 'disabled' : ''}
                class="rounded-xl px-3 py-2.5 text-xs font-black text-white transition ${
                  payout && payout.remaining <= 0
                    ? 'cursor-not-allowed bg-green-600'
                    : payout && payout.assigned <= 0
                      ? 'cursor-not-allowed bg-slate-300'
                      : 'bg-[#ffcc00] text-[#020617] hover:bg-[#f2c200]'
                }"
              >
                ${
                  payout && payout.remaining <= 0
                    ? '✓ Paid successfully'
                    : payout && payout.assigned <= 0
                      ? 'No amount to pay'
                      : 'Pay Now • MoMo'
                }
              </button>
            `
            : ''
        }
      </div>
    </article>
  `
}

function renderWalletUserCard(user: WalletUser): string {
  const role = getWalletUserRole(user)
  const name = user.institution_name || user.name || user.email || `User #${user.id}`
  const balance = parseMoney(user.wallet_balance)

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate font-black text-[#020617]">${escapeHtml(name)}</p>
          <p class="mt-1 text-xs font-semibold text-slate-400">${escapeHtml(user.email || user.phone || '-')}</p>
          <p class="mt-2 text-xs font-black text-slate-600">${escapeHtml(role || '-')} • ${escapeHtml(user.status || '-')}</p>
        </div>

        <div class="text-right">
          <p class="text-xs font-black uppercase text-slate-400">Balance</p>
          <p class="mt-1 text-sm font-black ${balance >= 0 ? 'text-green-700' : 'text-red-700'}">
            ${escapeHtml(formatMoney(balance))}
          </p>
        </div>
      </div>
    </article>
  `
}

function renderWalletTransactionCard(transaction: WalletTransaction): string {
  const isCredit = isCreditTransaction(transaction)
  const type = transaction.transaction_type || transaction.type || transaction.direction || 'transaction'
  const user = transaction.user
  const amount = parseMoney(transaction.amount)

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="font-black text-[#020617]">${escapeHtml(type)}</p>
          <p class="mt-1 text-xs font-semibold text-slate-400">
            ${escapeHtml(user?.institution_name || user?.name || user?.email || `User #${transaction.user_id || '-'}`)}
          </p>
          <p class="mt-2 text-xs font-bold text-slate-500">
            ${escapeHtml(transaction.description || transaction.notes || transaction.reference || '-')}
          </p>
          <p class="mt-2 text-[11px] font-bold text-slate-400">
            ${escapeHtml(formatWalletDate(transaction.created_at))}
          </p>
        </div>

        <div class="text-right">
          <p class="text-lg font-black ${isCredit ? 'text-green-700' : 'text-red-700'}">
            ${isCredit ? '+' : '-'}${escapeHtml(formatMoney(amount, transaction.currency || 'RWF'))}
          </p>

          <span class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${walletStatusClass(transaction.status)}">
            ${escapeHtml(transaction.status || 'recorded')}
          </span>
        </div>
      </div>
    </article>
  `
}

function renderWalletPayoutCard(payout: WalletPayout): string {
  const user = payout.user
  const method = payout.payout_method || payout.method || 'payout'

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-black text-[#020617]">${escapeHtml(user?.institution_name || user?.name || user?.email || `User #${payout.user_id || '-'}`)}</p>
          <p class="mt-1 text-xs font-semibold text-slate-400">${escapeHtml(method)}</p>
          <p class="mt-2 text-xs font-bold text-slate-500">${escapeHtml(payout.reference || payout.notes || '-')}</p>
        </div>

        <div class="text-right">
          <p class="text-sm font-black text-[#020617]">${escapeHtml(formatMoney(payout.amount, payout.currency || 'RWF'))}</p>
          <span class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${walletStatusClass(payout.status)}">
            ${escapeHtml(payout.status || '-')}
          </span>
        </div>
      </div>
    </article>
  `
}

function renderWalletCommissionCard(commission: WalletCommission): string {
  const amount = commission.commission_amount || commission.amount || 0
  const institution = commission.institution

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-black text-[#020617]">${escapeHtml(institution?.institution_name || institution?.name || `Institution #${commission.institution_id || '-'}`)}</p>
          <p class="mt-1 text-xs font-semibold text-slate-400">
            Pickup: ${escapeHtml(commission.pickup?.pickup_code || `#${commission.pickup_id || '-'}`)}
          </p>
          <p class="mt-2 text-xs font-bold text-slate-500">
            Rate: ${escapeHtml(String(commission.commission_rate || commission.rate || '-'))}
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm font-black text-green-700">${escapeHtml(formatMoney(amount, commission.currency || 'RWF'))}</p>
          <span class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${walletStatusClass(commission.status)}">
            ${escapeHtml(commission.status || '-')}
          </span>
        </div>
      </div>
    </article>
  `
}

function walletClickableMetricCard(label: string, value: string, helper: string, modalType: string): string {
  return `
    <button data-wallet-modal="${escapeAttribute(modalType)}" class="rounded-[24px] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        ${escapeHtml(label)}
      </p>
      <p class="mt-2 text-2xl font-black text-[#020617]">
        ${escapeHtml(value)}
      </p>
      <p class="mt-1 text-xs font-semibold text-slate-400">
        ${escapeHtml(helper)}
      </p>
      <p class="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
        Click to view details
      </p>
    </button>
  `
}

function walletPayoutMetricCard(
  label: string,
  payout: WalletMomoPayoutProgress,
  helper: string,
  modalType: WalletPayableType,
): string {
  return `
    <article class="rounded-[24px] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
            ${escapeHtml(label)}
          </p>
          <p class="mt-2 text-2xl font-black ${payout.remaining <= 0 && payout.assigned > 0 ? 'text-green-700' : 'text-[#020617]'}">
            ${escapeHtml(formatMoneyWithDecimals(payout.remaining))}
          </p>
          <p class="mt-1 text-xs font-semibold text-slate-400">
            Remaining to pay • ${escapeHtml(helper)}
          </p>
        </div>

        <span class="rounded-full px-3 py-1 text-[10px] font-black uppercase ${
          payout.remaining <= 0 && payout.assigned > 0
            ? 'bg-green-50 text-green-700'
            : 'bg-amber-50 text-amber-700'
        }">
          ${payout.remaining <= 0 && payout.assigned > 0 ? 'Paid' : 'Pending'}
        </span>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div class="text-[10px] font-bold text-slate-500">
          Assigned: ${escapeHtml(formatMoneyWithDecimals(payout.assigned))}<br>
          Paid: ${escapeHtml(formatMoneyWithDecimals(payout.paid))}
        </div>

        <button type="button" data-wallet-modal="${escapeAttribute(modalType)}" class="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-black text-[#020617] hover:bg-slate-200">
          Details
        </button>
      </div>
    </article>
  `
}

function bindWalletShareCards(): void {
  document.querySelectorAll<HTMLElement>('[data-wallet-modal]').forEach((element) => {
    element.addEventListener('click', () => {
      const type = element.dataset.walletModal || ''
      openWalletModal(type)
    })
  })
}

function bindWalletMomoPaymentButtons(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLButtonElement>('[data-wallet-pay]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.walletPay

      if (type === 'driver' || type === 'recycler') {
        openMomoPaymentModal(type)
      }
    })
  })
}

function openWalletModal(type: string): void {
  const root = document.querySelector<HTMLDivElement>('#walletModalRoot')

  if (!root) {
    return
  }

  const modal = getWalletModalContent(type)

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div class="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Money Breakdown
            </p>
            <h2 class="mt-1 text-2xl font-black text-[#020617]">
              ${escapeHtml(modal.title)}
            </h2>
            <p class="mt-1 text-sm font-semibold text-slate-500">
              ${escapeHtml(modal.description)}
            </p>
          </div>

          <button id="closeWalletModalButton" class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white">
            Close
          </button>
        </div>

        <div class="max-h-[70vh] overflow-y-auto p-6">
          ${modal.html}
        </div>
      </div>
    </div>
  `

  document.querySelector<HTMLButtonElement>('#closeWalletModalButton')?.addEventListener('click', closeWalletModal)
  bindWalletMomoPaymentButtons(root)

  root.querySelector('.fixed')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      closeWalletModal()
    }
  })
}

function closeWalletModal(): void {
  const root = document.querySelector<HTMLDivElement>('#walletModalRoot')

  if (root) {
    root.innerHTML = ''
  }
}


function openMomoPaymentModal(type: WalletPayableType): void {
  const root = document.querySelector<HTMLDivElement>('#walletModalRoot')

  if (!root) {
    return
  }

  const assignedAmount = getAssignedPayoutAmount(type)
  const payout = getWalletMomoPayoutProgress(type, assignedAmount)
  const recipientLabel = type === 'driver' ? 'Assigned driver(s)' : 'Recycler company'
  const defaultPhone = getDefaultMomoPhone(type)

  if (payout.assigned <= 0) {
    showWalletMessage(`No ${recipientLabel.toLowerCase()} amount is available to pay.`, 'info')
    return
  }

  if (payout.remaining <= 0) {
    showWalletMessage(`${recipientLabel} has already been paid successfully. Remaining: 0.00 RWF.`, 'success')
    return
  }

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div class="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div class="bg-[#ffcc00] px-6 py-5 text-[#020617]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em]">Mobile Money Payment</p>
              <h2 class="mt-1 text-2xl font-black">Pay ${escapeHtml(recipientLabel)}</h2>
              <p class="mt-1 text-sm font-bold opacity-75">Send the remaining payout using MoMo.</p>
            </div>

            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#020617] text-sm font-black text-white">
              MoMo
            </div>
          </div>
        </div>

        <form id="walletMomoPaymentForm" class="space-y-5 p-6">
          <input type="hidden" name="payment_type" value="${escapeAttribute(type)}" />

          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-[10px] font-black uppercase text-slate-400">Assigned</p>
              <p class="mt-1 text-xs font-black text-[#020617]">${escapeHtml(formatMoneyWithDecimals(payout.assigned))}</p>
            </div>
            <div class="rounded-xl bg-green-50 p-3">
              <p class="text-[10px] font-black uppercase text-green-600">Already paid</p>
              <p class="mt-1 text-xs font-black text-green-700">${escapeHtml(formatMoneyWithDecimals(payout.paid))}</p>
            </div>
            <div class="rounded-xl bg-red-50 p-3">
              <p class="text-[10px] font-black uppercase text-red-500">Pay now</p>
              <p class="mt-1 text-xs font-black text-red-700">${escapeHtml(formatMoneyWithDecimals(payout.remaining))}</p>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-xs font-black text-slate-700">Recipient MoMo phone number</label>
            <input
              name="phone"
              type="tel"
              value="${escapeAttribute(defaultPhone)}"
              placeholder="0788000000"
              autocomplete="tel"
              required
              class="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-black text-[#020617] outline-none focus:border-[#ffcc00] focus:ring-4 focus:ring-yellow-100"
            />
            <p class="mt-2 text-[11px] font-semibold text-slate-400">
              Use a Rwanda mobile number such as 0788000000 or +250788000000.
            </p>
          </div>

          <div class="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-bold text-blue-800">
            ${escapeHtml(recipientLabel)} will be marked as paid after this MoMo payment succeeds.
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button id="cancelWalletMomoButton" type="button" class="h-12 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button id="confirmWalletMomoButton" type="submit" class="h-12 rounded-xl bg-[#020617] text-sm font-black text-white transition hover:bg-[#0b1633] disabled:cursor-not-allowed disabled:opacity-60">
              Pay ${escapeHtml(formatMoneyWithDecimals(payout.remaining))}
            </button>
          </div>
        </form>
      </div>
    </div>
  `

  document.querySelector<HTMLButtonElement>('#cancelWalletMomoButton')?.addEventListener('click', closeWalletModal)
  root.querySelector('.fixed')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      closeWalletModal()
    }
  })

  document.querySelector<HTMLFormElement>('#walletMomoPaymentForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (isProcessingMomoPayment) {
      return
    }

    const form = event.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const phone = normalizeRwandaMomoPhone(String(formData.get('phone') || ''))
    const button = document.querySelector<HTMLButtonElement>('#confirmWalletMomoButton')

    if (!isValidRwandaMomoPhone(phone)) {
      showWalletMessage('Enter a valid Rwanda MoMo phone number.', 'error')
      form.querySelector<HTMLInputElement>('input[name="phone"]')?.focus()
      return
    }

    isProcessingMomoPayment = true

    if (button) {
      button.disabled = true
      button.textContent = 'Processing MoMo...'
    }

    try {
      await waitForMomoProcessing()

      const reference = createMomoReference(type)
      recordWalletMomoPayout(type, payout.remaining, phone, reference)
      closeWalletModal()
      renderWalletDashboard()
      showWalletMessage(
        `${recipientLabel} paid successfully through MoMo. Paid: ${formatMoneyWithDecimals(payout.remaining)}. Remaining: 0.00 RWF. Reference: ${reference}`,
        'success',
      )
    } catch (error: unknown) {
      showWalletMessage(getErrorMessage(error, 'MoMo payment failed. Please try again.'), 'error')

      if (button) {
        button.disabled = false
        button.textContent = `Pay ${formatMoneyWithDecimals(payout.remaining)}`
      }
    } finally {
      isProcessingMomoPayment = false
    }
  })
}

function getWalletModalContent(type: string): { title: string; description: string; html: string } {
  if (type === 'driver') {
    const rows = getDriverShareRows()
    return {
      title: 'Driver assigned',
      description: '30% share distributed by assigned pickup driver. If more than one driver is assigned to one e-waste item, the driver share is split between them.',
      html: renderShareRowsTable(rows, 'driver'),
    }
  }

  if (type === 'recycler') {
    const rows = getRecyclerShareRows()
    return {
      title: 'Recycler company',
      description: '50% share for recycler company per listed e-waste item.',
      html: renderShareRowsTable(rows, 'recycler'),
    }
  }

  const rows = getPlatformShareRows()

  return {
    title: 'Platform commission',
    description: '20% system commission calculated per listed e-waste item.',
    html: renderShareRowsTable(rows),
  }
}

function getPlatformShareRows(): WalletShareRow[] {
  return walletWasteListings.map((listing) => {
    const base = getListingMoneyValue(listing)

    return {
      owner: 'Platform commission',
      listing: listing.title || `Listing #${listing.id}`,
      base,
      amount: calculateShare(base, 20),
      note: getInstitutionName(listing),
      currency: listing.currency || 'RWF',
    }
  })
}

function getDriverShareRows(): WalletShareRow[] {
  const rows: WalletShareRow[] = []

  walletWasteListings.forEach((listing) => {
    const base = getListingMoneyValue(listing)
    const listingPickups = walletPickups.filter((pickup) => {
      return String(pickup.waste_listing_id || pickup.wasteListing?.id || pickup.waste_listing?.id || '') === String(listing.id)
    })

    const assignedPickups = listingPickups.filter((pickup) => pickup.driver_id || pickup.driver)

    if (!assignedPickups.length) {
      rows.push({
        owner: 'Unassigned driver pool',
        listing: listing.title || `Listing #${listing.id}`,
        base,
        amount: calculateShare(base, 30),
        note: 'No driver assigned yet',
        currency: listing.currency || 'RWF',
      })
      return
    }

    const sharePerDriver = calculateShare(base, 30) / assignedPickups.length

    assignedPickups.forEach((pickup) => {
      rows.push({
        owner: pickup.driver?.name || pickup.driver?.email || `Driver #${pickup.driver_id || '-'}`,
        listing: listing.title || `Listing #${listing.id}`,
        base,
        amount: sharePerDriver,
        note: pickup.pickup_code || `Pickup #${pickup.id}`,
        currency: listing.currency || 'RWF',
      })
    })
  })

  return rows
}

function getRecyclerShareRows(): WalletShareRow[] {
  return walletWasteListings.map((listing) => {
    const base = getListingMoneyValue(listing)

    return {
      owner: getRecyclerCompanyName(listing),
      listing: listing.title || `Listing #${listing.id}`,
      base,
      amount: calculateShare(base, 50),
      note: getInstitutionName(listing),
      currency: listing.currency || 'RWF',
    }
  })
}

function getRecyclerCompanyName(listing: WasteListing): string {
  const record = listing as unknown as Record<string, unknown>
  const possibleObject = record.recyclerCompany || record.recycler_company || record.recycler || record.company

  if (possibleObject && typeof possibleObject === 'object') {
    const recycler = possibleObject as Record<string, unknown>
    return firstString(recycler, ['institution_name', 'name', 'email']) || 'Recycler company'
  }

  return firstString(record, [
    'recycler_company_name',
    'recyclerCompanyName',
    'recycler_name',
    'company_name',
  ]) || 'Recycler company'
}

function renderShareRowsTable(rows: WalletShareRow[], payableType?: WalletPayableType): string {
  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const payout = payableType ? getWalletMomoPayoutProgress(payableType, total) : null

  if (!rows.length) {
    return emptyBox('No breakdown records found.')
  }

  return `
    <div class="mb-4 grid gap-4 ${payout ? 'md:grid-cols-4' : 'md:grid-cols-2'}">
      ${walletMetricCard('Records', String(rows.length), 'Breakdown rows')}
      ${walletMetricCard('Assigned Amount', formatMoneyWithDecimals(total), 'Calculated total')}
      ${payout ? walletMetricCard('Paid', formatMoneyWithDecimals(payout.paid), payout.reference || 'No payment yet') : ''}
      ${payout ? walletMetricCard('Remaining', formatMoneyWithDecimals(payout.remaining), payout.isPaid ? 'Paid successfully' : 'Waiting for payment') : ''}
    </div>

    ${
      payout && payout.isPaid && payout.assigned > 0
        ? `
          <div class="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
            <p class="font-black">✓ Paid successfully through MoMo</p>
            <p class="mt-1 text-xs font-bold">Remaining: 0.00 RWF</p>
            ${payout.phone ? `<p class="mt-1 text-xs font-bold">Phone: ${escapeHtml(formatRwandaPhoneForDisplay(payout.phone))}</p>` : ''}
            ${payout.reference ? `<p class="mt-1 text-xs font-bold">Reference: ${escapeHtml(payout.reference)}</p>` : ''}
            ${payout.paidAt ? `<p class="mt-1 text-xs font-bold">Paid at: ${escapeHtml(formatWalletDate(payout.paidAt))}</p>` : ''}
          </div>
        `
        : payout
          ? `
            <button type="button" data-wallet-pay="${escapeAttribute(payableType || '')}" class="mb-4 w-full rounded-xl bg-[#ffcc00] px-4 py-3 text-sm font-black text-[#020617] hover:bg-[#f2c200]">
              Pay Now with MoMo • ${escapeHtml(formatMoneyWithDecimals(payout.remaining))}
            </button>
          `
          : ''
    }

    <div class="overflow-x-auto rounded-2xl border border-slate-100">
      <table class="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr class="border-b border-slate-200 bg-[#f6f8fc]">
            <th class="px-3 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Assigned To</th>
            <th class="px-3 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">E-Waste</th>
            <th class="px-3 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Reference</th>
            <th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">E-Waste Value</th>
            <th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Assigned Amount</th>
            ${payout ? '<th class="px-3 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Payment</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr class="border-b border-slate-100">
              <td class="min-w-[180px] px-3 py-3 text-xs font-black text-[#020617]">${escapeHtml(row.owner)}</td>
              <td class="min-w-[220px] px-3 py-3 text-xs font-bold text-slate-600">${escapeHtml(row.listing)}</td>
              <td class="min-w-[160px] px-3 py-3 text-xs font-bold text-slate-400">${escapeHtml(row.note)}</td>
              <td class="whitespace-nowrap px-3 py-3 text-right text-xs font-black text-slate-700">${escapeHtml(formatMoney(row.base, row.currency || 'RWF'))}</td>
              <td class="whitespace-nowrap px-3 py-3 text-right text-xs font-black text-green-700">${escapeHtml(formatMoneyWithDecimals(row.amount, row.currency || 'RWF'))}</td>
              ${
                payout
                  ? `<td class="whitespace-nowrap px-3 py-3 text-right"><span class="rounded-full px-3 py-1 text-[10px] font-black uppercase ${payout.isPaid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}">${payout.isPaid ? 'Paid' : 'Pending'}</span></td>`
                  : ''
              }
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function walletMetricCard(label: string, value: string, helper: string): string {
  return `
    <div class="rounded-[24px] bg-white p-5 shadow-sm">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        ${escapeHtml(label)}
      </p>
      <p class="mt-2 text-2xl font-black text-[#020617]">
        ${escapeHtml(value)}
      </p>
      <p class="mt-1 text-xs font-semibold text-slate-400">
        ${escapeHtml(helper)}
      </p>
    </div>
  `
}

function showWalletContent(html: string): void {
  const container = document.querySelector<HTMLElement>('#walletDashboardContent')

  if (container) {
    container.innerHTML = html
  }
}

function showWalletMessage(message: string, type: 'success' | 'error' | 'info'): void {
  const box = document.querySelector<HTMLDivElement>('#walletMessage')

  if (!box) {
    return
  }

  const colorClass =
    type === 'success'
      ? 'bg-green-50 text-green-700'
      : type === 'error'
        ? 'bg-red-50 text-red-700'
        : 'bg-blue-50 text-blue-700'

  box.textContent = message
  box.className = `rounded-xl px-4 py-3 text-sm font-bold ${colorClass}`
}

function getWalletUserRole(user: WalletUser): string {
  const rawRole = user.role

  if (typeof rawRole === 'string') {
    return rawRole
  }

  if (typeof rawRole === 'number') {
    return String(rawRole)
  }

  if (rawRole && typeof rawRole === 'object') {
    return rawRole.name || rawRole.slug || ''
  }

  return user.role_name || user.roleName || ''
}

function isCreditTransaction(transaction: WalletTransaction): boolean {
  const value = String(transaction.direction || transaction.transaction_type || transaction.type || '').toLowerCase()

  if (['credit', 'deposit', 'top_up', 'topup', 'payment_received', 'earning', 'commission'].some((item) => value.includes(item))) {
    return true
  }

  if (['debit', 'withdraw', 'withdrawal', 'payout', 'payment_sent'].some((item) => value.includes(item))) {
    return false
  }

  return parseMoney(transaction.amount) >= 0
}

function createEmptyWalletMomoPayoutRecords(): Record<WalletPayableType, WalletMomoPayoutRecord> {
  return {
    driver: {
      paid_amount: 0,
      phone: '',
      reference: '',
      paid_at: '',
    },
    recycler: {
      paid_amount: 0,
      phone: '',
      reference: '',
      paid_at: '',
    },
  }
}

function loadWalletMomoPayoutRecords(): void {
  walletMomoPayoutRecords = createEmptyWalletMomoPayoutRecords()

  try {
    const raw = window.localStorage.getItem(WALLET_MOMO_PAYOUT_STORAGE_KEY)

    if (!raw) {
      return
    }

    const parsed = JSON.parse(raw) as Partial<Record<WalletPayableType, Partial<WalletMomoPayoutRecord>>>

    ;(['driver', 'recycler'] as WalletPayableType[]).forEach((type) => {
      const record = parsed[type]

      if (!record) {
        return
      }

      walletMomoPayoutRecords[type] = {
        paid_amount: Math.max(0, parseMoney(record.paid_amount)),
        phone: String(record.phone || ''),
        reference: String(record.reference || ''),
        paid_at: String(record.paid_at || ''),
      }
    })
  } catch {
    walletMomoPayoutRecords = createEmptyWalletMomoPayoutRecords()
  }
}

function saveWalletMomoPayoutRecords(): void {
  try {
    window.localStorage.setItem(
      WALLET_MOMO_PAYOUT_STORAGE_KEY,
      JSON.stringify(walletMomoPayoutRecords),
    )
  } catch {
    // The page still works when browser storage is unavailable.
  }
}

function recordWalletMomoPayout(
  type: WalletPayableType,
  amount: number,
  phone: string,
  reference: string,
): void {
  const current = walletMomoPayoutRecords[type]

  walletMomoPayoutRecords[type] = {
    paid_amount: Math.max(0, current.paid_amount + Math.max(0, amount)),
    phone,
    reference,
    paid_at: new Date().toISOString(),
  }

  saveWalletMomoPayoutRecords()
}

function getWalletMomoPayoutProgress(
  type: WalletPayableType,
  assignedAmount: number,
): WalletMomoPayoutProgress {
  const assigned = Math.max(0, parseMoney(assignedAmount))
  const record = walletMomoPayoutRecords[type]
  const paid = Math.min(assigned, Math.max(0, parseMoney(record.paid_amount)))
  const remaining = Math.max(0, assigned - paid)

  return {
    assigned,
    paid,
    remaining,
    phone: record.phone,
    reference: record.reference,
    paidAt: record.paid_at,
    isPaid: assigned > 0 && remaining <= 0.001,
  }
}

function getAssignedPayoutAmount(type: WalletPayableType): number {
  const totalWasteValue = walletWasteListings.reduce((sum, listing) => {
    return sum + getListingMoneyValue(listing)
  }, 0)

  return type === 'driver'
    ? calculateShare(totalWasteValue, 30)
    : calculateShare(totalWasteValue, 50)
}

function getDefaultMomoPhone(type: WalletPayableType): string {
  if (type === 'driver') {
    const phone = walletPickups.find((pickup) => pickup.driver?.phone)?.driver?.phone
    return phone ? formatRwandaPhoneForInput(phone) : ''
  }

  for (const listing of walletWasteListings) {
    const phone = getRecyclerCompanyPhone(listing)

    if (phone) {
      return formatRwandaPhoneForInput(phone)
    }
  }

  return ''
}

function getRecyclerCompanyPhone(listing: WasteListing): string {
  const record = listing as unknown as Record<string, unknown>
  const possibleObject = record.recyclerCompany || record.recycler_company || record.recycler || record.company

  if (possibleObject && typeof possibleObject === 'object') {
    const recycler = possibleObject as Record<string, unknown>
    const phone = firstString(recycler, ['momo_phone', 'momoPhone', 'phone', 'telephone', 'mobile'])

    if (phone) {
      return phone
    }
  }

  return firstString(record, [
    'recycler_momo_phone',
    'recyclerMomoPhone',
    'recycler_phone',
    'recyclerPhone',
    'company_phone',
  ])
}

function normalizeRwandaMomoPhone(value: string): string {
  let digits = String(value || '').replace(/\D/g, '')

  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  }

  if (digits.startsWith('0') && digits.length === 10) {
    digits = `250${digits.slice(1)}`
  }

  if (digits.length === 9 && digits.startsWith('7')) {
    digits = `250${digits}`
  }

  return digits
}

function isValidRwandaMomoPhone(value: string): boolean {
  return /^2507\d{8}$/.test(value)
}

function formatRwandaPhoneForInput(value: string): string {
  const phone = normalizeRwandaMomoPhone(value)

  if (!isValidRwandaMomoPhone(phone)) {
    return value
  }

  return `0${phone.slice(3)}`
}

function formatRwandaPhoneForDisplay(value: string): string {
  const phone = normalizeRwandaMomoPhone(value)

  if (!isValidRwandaMomoPhone(phone)) {
    return value
  }

  return `+${phone}`
}

function createMomoReference(type: WalletPayableType): string {
  const recipientCode = type === 'driver' ? 'DRV' : 'RCY'
  const randomCode = Math.random().toString(36).slice(2, 8).toUpperCase()

  return `MOMO-${recipientCode}-${Date.now()}-${randomCode}`
}

function waitForMomoProcessing(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 900)
  })
}

function parseMoney(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const number = Number(String(value).replace(/,/g, ''))

  return Number.isFinite(number) ? number : 0
}

function formatMoney(value: unknown, currency = 'RWF'): string {
  return `${Math.round(parseMoney(value)).toLocaleString()} ${currency || 'RWF'}`
}


function formatMoneyWithDecimals(value: unknown, currency = 'RWF'): string {
  return `${parseMoney(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || 'RWF'}`
}

function walletStatusClass(status?: string | null): string {
  const clean = String(status || '').toLowerCase()

  if (['paid', 'completed', 'success', 'successful', 'approved', 'active', 'recorded'].includes(clean)) {
    return 'bg-green-50 text-green-700'
  }

  if (['pending', 'processing', 'requested'].includes(clean)) {
    return 'bg-amber-50 text-amber-700'
  }

  if (['failed', 'rejected', 'cancelled'].includes(clean)) {
    return 'bg-red-50 text-red-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function formatWalletDate(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

async function initDriverMatchingPage(): Promise<void> {
  document.querySelector<HTMLButtonElement>('#refreshDriverMatchingButton')?.addEventListener('click', () => {
    loadDriverMatchingData().catch((error: unknown) => {
      showDriverMatchingMessage(getErrorMessage(error, 'Failed to refresh data.'), 'error')
    })
  })

  document.querySelector<HTMLSelectElement>('#driverMatchingStatusFilter')?.addEventListener('change', () => {
    selectedMatchingListing = null
    renderMatchingPanel()
    loadDriverMatchingListings().catch((error: unknown) => {
      showDriverMatchingMessage(getErrorMessage(error, 'Failed to load listings.'), 'error')
    })
  })

  await loadDriverMatchingData()
}

async function loadDriverMatchingData(): Promise<void> {
  await loadBackendRoles()

  await Promise.all([
    loadDriverMatchingListings(),
    loadDriverMatchingDrivers(),
  ])
}

async function loadDriverMatchingListings(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#driverMatchingListings')

  if (!container) {
    return
  }

  container.innerHTML = loadingBox('Loading institution e-waste...')

  try {
    const status = document.querySelector<HTMLSelectElement>('#driverMatchingStatusFilter')?.value || 'verified'
    const statusQuery = status === 'all' ? '' : `&status=${encodeURIComponent(status)}`
    const response = await api.get<ListingResponse>(`/waste-listings?per_page=100${statusQuery}`)
    driverMatchingListings = normalizeList<WasteListing>(response)

    if (!driverMatchingListings.length) {
      container.innerHTML = emptyBox('No institution e-waste found for this status.')
      return
    }

    container.innerHTML = driverMatchingListings.map(renderMatchingListingCard).join('')

    container.querySelectorAll<HTMLButtonElement>('[data-select-match-listing]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.selectMatchListing)
        selectedMatchingListing = driverMatchingListings.find((listing) => listing.id === id) || null
        renderMatchingListingsList()
        renderMatchingPanel()
      })
    })
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load institution e-waste.'))
  }
}

async function loadBackendRoles(): Promise<void> {
  try {
    const response = await api.get<RoleResponse>('/roles?per_page=100')
    backendRoles = normalizeList<BackendRole>(response)
  } catch {
    backendRoles = []
  }
}

async function loadDriverMatchingDrivers(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#driverMatchingDrivers')

  if (!container) {
    return
  }

  container.innerHTML = loadingBox('Loading drivers...')

  try {
    // Backend /api/drivers returns users where role = driver.
    const response = await api.get<DriverResponse>('/drivers?per_page=100&status=active')
    const drivers = normalizeList<Driver>(response)

    driverMatchingDrivers = drivers

    if (!drivers.length) {
      container.innerHTML = emptyBox('No active driver users found. Create a user with role driver first.')
      renderMatchingPanel()
      return
    }

    container.innerHTML = `
      <div class="rounded-xl bg-green-50 p-3 text-xs font-black text-green-700">
        ${drivers.length} active driver user(s) found.
      </div>
      ${drivers.map(renderDriverCard).join('')}
    `

    renderMatchingPanel()
  } catch (error: unknown) {
    driverMatchingDrivers = []
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load drivers from /drivers endpoint.'))
    renderMatchingPanel()
  }
}


function renderMatchingListingsList(): void {
  const container = document.querySelector<HTMLDivElement>('#driverMatchingListings')

  if (!container) {
    return
  }

  if (!driverMatchingListings.length) {
    container.innerHTML = emptyBox('No institution e-waste found.')
    return
  }

  container.innerHTML = driverMatchingListings.map(renderMatchingListingCard).join('')

  container.querySelectorAll<HTMLButtonElement>('[data-select-match-listing]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.selectMatchListing)
      selectedMatchingListing = driverMatchingListings.find((listing) => listing.id === id) || null
      renderMatchingListingsList()
      renderMatchingPanel()
    })
  })
}

function renderMatchingPanel(): void {
  const panel = document.querySelector<HTMLDivElement>('#driverMatchingPanel')

  if (!panel) {
    return
  }

  if (!selectedMatchingListing) {
    panel.innerHTML = renderEmptyMatchingPanel()
    return
  }

  const listing = selectedMatchingListing
  const institutionName = getInstitutionName(listing)
  const locationText = getListingLocationText(listing)
  const coordinates = getListingCoordinates(listing)
  const photos = getListingPhotos(listing)
  const photoUrl = photos.length ? getPhotoUrl(photos[0]) : ''
  const mapUrl = coordinates ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}` : ''
  const weight = listing.verified_weight_kg || listing.estimated_weight_kg || 0
  const price = listing.final_price || listing.expected_price || 0

  panel.innerHTML = `
    <div class="space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Selected Institution E-Waste
          </p>

          <h2 class="mt-1 text-2xl font-black text-[#020617]">
            ${escapeHtml(listing.title || `Listing #${listing.id}`)}
          </h2>

          <p class="mt-1 text-sm font-semibold text-slate-500">
            ${escapeHtml(institutionName)}
          </p>
        </div>

        <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
          ${escapeHtml(listing.status || '-')}
        </span>
      </div>

      <div class="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div class="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          ${
            photoUrl
              ? `<img src="${escapeAttribute(photoUrl)}" alt="E-waste image" class="h-64 w-full object-contain bg-slate-100" loading="lazy" />`
              : `<div class="flex h-64 items-center justify-center p-6 text-center text-sm font-black text-red-600">No image attached</div>`
          }
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          ${summaryCard('Institution', institutionName)}
          ${summaryCard('Waste Type', listing.ai_detected_item || listing.ai_detected_category || listing.description || '-')}
          ${summaryCard('Verified Kg', formatKg(weight))}
          ${summaryCard('Final Bill', `${listing.currency || 'RWF'} ${formatNumber(price)}`)}
        </div>
      </div>

      <div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-blue-500">
          Pickup Location
        </p>

        <p class="mt-2 text-sm font-black leading-6 text-[#020617]">
          ${escapeHtml(locationText || 'GPS location available')}
        </p>

        ${
          coordinates
            ? `<p class="mt-1 text-xs font-bold text-blue-700">GPS: ${escapeHtml(String(coordinates.lat))}, ${escapeHtml(String(coordinates.lng))}</p>`
            : '<p class="mt-1 text-xs font-bold text-amber-700">No GPS coordinates found.</p>'
        }

        ${
          mapUrl
            ? `<a href="${escapeAttribute(mapUrl)}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white">Open Map</a>`
            : ''
        }
      </div>

      <form id="driverAssignmentForm" class="rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Assign Driver
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Driver</label>
            <select name="driver_id" required class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="">Select driver</option>
              ${driverMatchingDrivers.map((driver) => `
                <option value="${driver.id}">
                  ${escapeHtml(driver.name || driver.email || `Driver #${driver.id}`)}${estimateDriverDistance(driver, listing)}
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Pickup Schedule</label>
            <input name="scheduled_at" type="datetime-local" value="${getDefaultScheduleValue()}" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" />
          </div>
        </div>

        <div class="mt-3">
          <label class="mb-1 block text-xs font-black text-slate-600">Assignment Notes</label>
          <textarea name="notes" class="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Driver instructions, pickup contact, gate info, etc."></textarea>
        </div>

        <button id="assignDriverButton" type="submit" class="mt-4 h-11 w-full rounded-xl bg-[#020617] text-sm font-black text-white transition hover:bg-[#0b1633] disabled:cursor-not-allowed disabled:opacity-60">
          Assign Driver to Institution E-Waste
        </button>
      </form>
    </div>
  `

  bindDriverAssignmentForm()
}

function bindDriverAssignmentForm(): void {
  const form = document.querySelector<HTMLFormElement>('#driverAssignmentForm')
  const button = document.querySelector<HTMLButtonElement>('#assignDriverButton')

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (isAssigningDriver) {
      return
    }

    if (!selectedMatchingListing) {
      showDriverMatchingMessage('Select institution e-waste first.', 'error')
      return
    }

    const formData = new FormData(form)
    const driverId = numberOrNull(formData.get('driver_id'))

    if (!driverId) {
      showDriverMatchingMessage('Select driver first.', 'error')
      return
    }

    isAssigningDriver = true

    if (button) {
      button.disabled = true
      button.textContent = 'Assigning driver...'
    }

    const listing = selectedMatchingListing
    const scheduledAt = String(formData.get('scheduled_at') || '')
    const notes = String(formData.get('notes') || '')

    const payload = {
      waste_listing_id: listing.id,
      listing_id: listing.id,
      driver_id: driverId,
      assigned_driver_id: driverId,
      institution_id: listing.institution?.id || null,
      scheduled_at: scheduledAt || null,
      pickup_date: scheduledAt || null,
      status: 'assigned',
      pickup_status: 'assigned',
      collection_type: 'institution_ewaste',
      notes,
      pickup_notes: notes,
    }

    showDriverMatchingMessage('Assigning driver. Please wait...', 'info')

    try {
      await assignDriverToListing(payload)

      showDriverMatchingMessage('Driver assigned successfully ✅', 'success')
      selectedMatchingListing = null
      renderMatchingPanel()
      await loadDriverMatchingListings()
    } catch (error: unknown) {
      showDriverMatchingMessage(getErrorMessage(error, 'Failed to assign driver.'), 'error')
    } finally {
      isAssigningDriver = false

      if (button) {
        button.disabled = false
        button.textContent = 'Assign Driver to Institution E-Waste'
      }
    }
  })
}

async function assignDriverToListing(payload: Record<string, unknown>): Promise<void> {
  const endpoints = getAssignmentEndpoints()
  let lastError: unknown = null

  for (const endpoint of endpoints) {
    try {
      await api.post(endpoint, payload)
      return
    } catch (error: unknown) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Assignment endpoint failed.')
}

function getAssignmentEndpoints(): string[] {
  const endpoints = [
    activeAssignmentEndpoint,
    '/pickups',
    '/pickup-assignments',
    '/driver-assignments',
  ]
    .filter(Boolean)
    .map((endpoint) => endpoint.startsWith('/') ? endpoint : `/${endpoint}`)

  return Array.from(new Set(endpoints))
}

function renderMatchingListingCard(listing: WasteListing): string {
  const isSelected = selectedMatchingListing?.id === listing.id
  const institutionName = getInstitutionName(listing)
  const locationText = getListingLocationText(listing)
  const photos = getListingPhotos(listing)
  const photoUrl = photos.length ? getPhotoUrl(photos[0]) : ''
  const weight = listing.verified_weight_kg || listing.estimated_weight_kg || 0

  return `
    <article class="rounded-2xl border ${isSelected ? 'border-[#020617] bg-[#f6f8fc]' : 'border-slate-100 bg-white'} p-4 transition hover:bg-[#f6f8fc]">
      <div class="flex items-start gap-3">
        <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          ${
            photoUrl
              ? `<img src="${escapeAttribute(photoUrl)}" alt="E-waste image" class="h-full w-full object-cover" loading="lazy" />`
              : `<div class="flex h-full w-full items-center justify-center text-[10px] font-black text-red-500">NO IMG</div>`
          }
        </div>

        <div class="min-w-0 flex-1">
          <h4 class="truncate font-black text-[#020617]">${escapeHtml(listing.title || `Listing #${listing.id}`)}</h4>
          <p class="mt-1 truncate text-xs font-semibold text-slate-500">${escapeHtml(institutionName)}</p>
          <p class="mt-1 text-xs font-black text-slate-600">${escapeHtml(formatKg(weight))} • ${escapeHtml(listing.status || '-')}</p>
          <p class="mt-1 line-clamp-1 text-[11px] font-bold text-blue-700">📍 ${escapeHtml(locationText || 'No location found')}</p>

          <button data-select-match-listing="${listing.id}" class="mt-3 rounded-xl bg-[#020617] px-3 py-2 text-xs font-black text-white">
            ${isSelected ? 'Selected' : 'Select for Driver'}
          </button>
        </div>
      </div>
    </article>
  `
}


function isDriverUser(user: Driver): boolean {
  const roleName = getUserRoleName(user).toLowerCase()
  const roleSlug = getUserRoleSlug(user).toLowerCase()
  const roleId = getUserRoleId(user)
  const driverRoleIds = getDriverRoleIds()

  if (
    roleName === 'driver' ||
    roleSlug === 'driver' ||
    roleName.includes('driver') ||
    roleSlug.includes('driver') ||
    roleName.includes('collector') ||
    roleSlug.includes('collector')
  ) {
    return true
  }

  if (roleId !== null && driverRoleIds.includes(String(roleId))) {
    return true
  }

  return false
}

function getDriverRoleIds(): string[] {
  return backendRoles
    .filter((role) => {
      const name = String(role.name || '').toLowerCase()
      const slug = String(role.slug || '').toLowerCase()

      return name === 'driver' || slug === 'driver' || name.includes('driver') || slug.includes('driver')
    })
    .map((role) => String(role.id))
    .filter(Boolean)
}

function getUserRoleName(user: Driver): string {
  const rawRole = user.role

  if (typeof rawRole === 'string') {
    return rawRole
  }

  if (typeof rawRole === 'number') {
    return getRoleNameById(rawRole)
  }

  if (rawRole && typeof rawRole === 'object') {
    return rawRole.name || rawRole.slug || ''
  }

  if (Array.isArray(user.roles) && user.roles.length) {
    return user.roles.map((role) => role.name || role.slug || '').filter(Boolean).join(', ')
  }

  const roleId = getUserRoleId(user)

  if (roleId !== null) {
    return getRoleNameById(roleId)
  }

  return user.role_name || user.roleName || user.role_slug || user.roleSlug || ''
}

function getUserRoleSlug(user: Driver): string {
  const rawRole = user.role

  if (typeof rawRole === 'string') {
    return rawRole
  }

  if (rawRole && typeof rawRole === 'object') {
    return rawRole.slug || rawRole.name || ''
  }

  if (Array.isArray(user.roles) && user.roles.length) {
    return user.roles.map((role) => role.slug || role.name || '').filter(Boolean).join(', ')
  }

  const roleId = getUserRoleId(user)

  if (roleId !== null) {
    const role = backendRoles.find((item) => String(item.id) === String(roleId))
    return role?.slug || role?.name || ''
  }

  return user.role_slug || user.roleSlug || user.role_name || user.roleName || ''
}

function getUserRoleId(user: Driver): number | string | null {
  const rawRole = user.role

  if (typeof rawRole === 'number' || typeof rawRole === 'string') {
    const value = String(rawRole)

    if (/^\d+$/.test(value)) {
      return value
    }
  }

  if (rawRole && typeof rawRole === 'object' && rawRole.id !== undefined && rawRole.id !== null) {
    return rawRole.id
  }

  if (user.role_id !== undefined && user.role_id !== null) {
    return user.role_id
  }

  if (user.roleId !== undefined && user.roleId !== null) {
    return user.roleId
  }

  if (Array.isArray(user.roles) && user.roles.length) {
    const role = user.roles.find((item) => {
      const name = String(item.name || '').toLowerCase()
      const slug = String(item.slug || '').toLowerCase()
      return name.includes('driver') || slug.includes('driver')
    })

    if (role?.id !== undefined && role.id !== null) {
      return role.id
    }
  }

  return null
}

function getRoleNameById(roleId: number | string): string {
  const role = backendRoles.find((item) => String(item.id) === String(roleId))
  return role?.name || role?.slug || ''
}

function renderDriverCard(driver: Driver): string {
  const location = getDriverLocationText(driver)

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <p class="font-black text-[#020617]">${escapeHtml(driver.name || `Driver #${driver.id}`)}</p>
      <p class="mt-1 text-xs font-semibold text-slate-400">${escapeHtml(driver.email || driver.phone || '-')}</p>
      <p class="mt-2 text-xs font-black text-slate-600">
        ${escapeHtml(`${driver.availability_status || driver.status || 'available'} • ${getUserRoleName(driver) || 'Driver'}`)}
      </p>
      ${
        location
          ? `<p class="mt-1 line-clamp-1 text-[11px] font-bold text-blue-700">📍 ${escapeHtml(location)}</p>`
          : ''
      }
    </article>
  `
}

function renderEmptyMatchingPanel(): string {
  return `
    <div class="rounded-2xl bg-[#f6f8fc] p-6 text-center">
      <h3 class="text-lg font-black text-[#020617]">
        Select Institution E-Waste
      </h3>

      <p class="mt-2 text-sm font-semibold text-slate-500">
        Choose verified e-waste from the left side, then assign the best driver based on location and availability.
      </p>
    </div>
  `
}

function getInstitutionName(listing: WasteListing): string {
  return (
    listing.institution?.institution_name ||
    listing.institution?.name ||
    listing.institution?.email ||
    'Institution'
  )
}

function getListingPhotos(listing: WasteListing): WastePhoto[] {
  const photos = [
    listing.primaryPhoto,
    listing.primary_photo,
    ...(listing.photos || []),
    ...(listing.wastePhotos || []),
    ...(listing.waste_photos || []),
  ].filter(Boolean) as WastePhoto[]

  const seen = new Set<string>()

  return photos.filter((photo) => {
    const key = String(photo.id || photo.photo_url || photo.url || photo.photo_path || photo.path || '')

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function getPhotoUrl(photo: WastePhoto): string {
  const direct = photo.photo_url || photo.image_url || photo.url

  if (direct) {
    return normalizeUrl(direct)
  }

  const rawPath = String(photo.photo_path || photo.path || '').trim()

  if (!rawPath) {
    return ''
  }

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath
  }

  let cleanPath = rawPath
    .replaceAll('\\', '/')
    .replace(/^\/+/, '')
    .replace(/^storage\/app\/public\//, '')
    .replace(/^app\/public\//, '')
    .replace(/^public\/storage\//, '')
    .replace(/^public\//, '')
    .replace(/^storage\//, '')

  cleanPath = cleanPath.replace(/^\/+/, '')

  return `https://www.ewaste.asyncafrica.com/storage/${cleanPath}`
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  if (url.startsWith('/')) {
    return `https://www.ewaste.asyncafrica.com${url}`
  }

  return `https://www.ewaste.asyncafrica.com/${url}`
}

function getListingLocationText(listing: WasteListing): string {
  const record = listing as unknown as Record<string, unknown>

  const direct = firstString(record, [
    'pickup_address',
    'pickupAddress',
    'location_address',
    'locationAddress',
    'location',
    'address',
    'street_address',
    'streetAddress',
  ])

  if (direct) {
    return direct
  }

  const parts = [
    firstString(record, ['village']),
    firstString(record, ['cell']),
    firstString(record, ['sector']),
    firstString(record, ['district']),
    firstString(record, ['city']),
    firstString(record, ['province']),
  ].filter(Boolean)

  return parts.join(', ')
}

function getDriverLocationText(driver: Driver): string {
  return driver.location_address || driver.address || ''
}

function getListingCoordinates(listing: WasteListing): { lat: number; lng: number } | null {
  const record = listing as unknown as Record<string, unknown>

  const lat = firstNumber(record, [
    'latitude',
    'lat',
    'pickup_latitude',
    'pickupLatitude',
    'location_latitude',
  ])

  const lng = firstNumber(record, [
    'longitude',
    'lng',
    'pickup_longitude',
    'pickupLongitude',
    'location_longitude',
  ])

  if (lat === null || lng === null) {
    return null
  }

  return { lat, lng }
}

function getDriverCoordinates(driver: Driver): { lat: number; lng: number } | null {
  const record = driver as unknown as Record<string, unknown>

  const lat = firstNumber(record, [
    'current_latitude',
    'latitude',
    'lat',
  ])

  const lng = firstNumber(record, [
    'current_longitude',
    'longitude',
    'lng',
  ])

  if (lat === null || lng === null) {
    return null
  }

  return { lat, lng }
}

function estimateDriverDistance(driver: Driver, listing: WasteListing): string {
  const driverCoords = getDriverCoordinates(driver)
  const listingCoords = getListingCoordinates(listing)

  if (!driverCoords || !listingCoords) {
    return ''
  }

  const distance = calculateDistanceKm(
    driverCoords.lat,
    driverCoords.lng,
    listingCoords.lat,
    listingCoords.lng,
  )

  return ` • ${distance.toFixed(1)} km`
}

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(value: number): number {
  return value * Math.PI / 180
}

function firstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return ''
}

function firstNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key]
    const number = Number(value)

    if (Number.isFinite(number) && number !== 0) {
      return number
    }
  }

  return null
}

function getDefaultScheduleValue(): string {
  const date = new Date()
  date.setHours(date.getHours() + 1)
  date.setMinutes(0, 0, 0)

  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function normalizeList<T>(response: unknown): T[] {
  const visited = new Set<unknown>()

  const walk = (value: unknown): T[] => {
    if (!value || visited.has(value)) {
      return []
    }

    if (Array.isArray(value)) {
      return value as T[]
    }

    if (typeof value !== 'object') {
      return []
    }

    visited.add(value)

    const record = value as Record<string, unknown>

    const possibleArrayKeys = [
      'users',
      'drivers',
      'items',
      'records',
      'results',
      'list',
      'rows',
      'data',
    ]

    for (const key of possibleArrayKeys) {
      const child = record[key]

      if (Array.isArray(child)) {
        return child as T[]
      }
    }

    const possibleObjectKeys = [
      'data',
      'payload',
      'result',
      'response',
    ]

    for (const key of possibleObjectKeys) {
      const found = walk(record[key])

      if (found.length) {
        return found
      }
    }

    return []
  }

  return walk(response)
}


function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function summaryCard(label: string, value: string | number | null | undefined): string {
  return `
    <div class="rounded-xl bg-[#f6f8fc] px-4 py-3">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">${escapeHtml(label)}</p>
      <p class="mt-1 text-sm font-black text-[#020617]">${escapeHtml(String(value ?? '-'))}</p>
    </div>
  `
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

function showDriverMatchingMessage(message: string, type: 'success' | 'error' | 'info'): void {
  const box = document.querySelector<HTMLDivElement>('#driverMatchingMessage')

  if (!box) {
    return
  }

  const colorClass =
    type === 'success'
      ? 'bg-green-50 text-green-700'
      : type === 'error'
        ? 'bg-red-50 text-red-700'
        : 'bg-blue-50 text-blue-700'

  box.textContent = message
  box.className = `rounded-xl px-4 py-3 text-sm font-bold ${colorClass}`
}

function formatKg(value: number | string | null | undefined): string {
  const number = Number(value || 0)

  if (!Number.isFinite(number)) {
    return '0 kg'
  }

  return `${number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} kg`
}

function formatNumber(value: number | string | null | undefined): string {
  const number = Number(value || 0)

  if (!Number.isFinite(number)) {
    return '0'
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value)
}