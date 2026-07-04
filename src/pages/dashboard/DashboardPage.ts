import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

type ApiListResponse<T> = T[] | PaginatedResponse<T>

interface UserRecord {
  id: number
  name: string
  email: string
  role: string
  status: string
}

interface UsersApiResponse {
  users: ApiListResponse<UserRecord>
  summary?: {
    total?: number
    active?: number
    inactive?: number
    suspended?: number
    admins?: number
    institutions?: number
    staff?: number
    drivers?: number
    finance_officers?: number
  }
}

interface WasteCategory {
  id: number
  name: string
  average_weight_kg?: string | number | null
  price_per_kg?: string | number | null
  status?: string
}

interface WasteListing {
  id: number
  title?: string
  waste_name?: string
  name?: string
  status?: string
  estimated_weight_kg?: string | number | null
  verified_weight_kg?: string | number | null
}

interface Pickup {
  id: number
  status?: string
}

interface Payout {
  id: number
  amount?: string | number | null
  status?: string
}

interface WalletTransaction {
  id: number
  amount?: string | number | null
  points?: string | number | null
  type?: string
}

interface AuditLog {
  id: number
  action?: string
  description?: string
  created_at?: string
}

interface FeatureCard {
  title: string
  href: string
  description: string
  counterId: string
  icon: string
}

const features: FeatureCard[] = [
  {
    title: 'Users',
    href: '/users',
    description: 'Manage admins, institutions, staff, drivers, and finance users.',
    counterId: 'featureUsersCount',
    icon: '▣',
  },
  {
    title: 'Roles',
    href: '/roles',
    description: 'Control roles and permissions for system access.',
    counterId: 'featureRolesCount',
    icon: '◉',
  },
  {
    title: 'Categories',
    href: '/waste-categories',
    description: 'Set waste type, average weight, price, and hazard status.',
    counterId: 'featureCategoriesCount',
    icon: '♻',
  },
  {
    title: 'Listings',
    href: '/waste-listings',
    description: 'View waste uploaded by institutions with photos and status.',
    counterId: 'featureListingsCount',
    icon: '▤',
  },
  {
    title: 'Verification',
    href: '/waste-verifications',
    description: 'Verify actual weight, condition, and final value.',
    counterId: 'featureVerificationsCount',
    icon: '✓',
  },
  {
    title: 'Offers',
    href: '/waste-offers',
    description: 'Manage recycler offers and accepted waste deals.',
    counterId: 'featureOffersCount',
    icon: '◇',
  },
  {
    title: 'Pickups',
    href: '/pickups',
    description: 'Schedule pickups, assign drivers, and track collection.',
    counterId: 'featurePickupsCount',
    icon: '▥',
  },
  {
    title: 'QR Tags',
    href: '/qr-tags',
    description: 'Generate and scan QR tags for waste tracking.',
    counterId: 'featureQrTagsCount',
    icon: '▦',
  },
  {
    title: 'Wallet',
    href: '/wallet-transactions',
    description: 'Track cash, points, credits, and debits.',
    counterId: 'featureWalletCount',
    icon: '▧',
  },
  {
    title: 'Payouts',
    href: '/payouts',
    description: 'Review and approve institution payout reports.',
    counterId: 'featurePayoutsCount',
    icon: '◈',
  },
  {
    title: 'Commissions',
    href: '/commissions',
    description: 'Track platform commission records from transactions.',
    counterId: 'featureCommissionsCount',
    icon: '%',
  },
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    description: 'Monitor security logs and admin activities.',
    counterId: 'featureAuditLogsCount',
    icon: '◎',
  },
  {
    title: 'Settings',
    href: '/settings',
    description: 'Configure system prices, security, and platform options.',
    counterId: 'featureSettingsCount',
    icon: '⚙',
  },
]

export function renderDashboardPage(): string {
  return DashboardLayout(
    'Dashboard',
    `
      <div class="space-y-4">

        <!-- TOP SUMMARY -->
        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Admin Overview
              </p>

              <h1 class="mt-2 text-2xl font-black tracking-tight">
                Smart E-Waste Tracking Platform
              </h1>

              <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Manage users, roles, e-waste categories, listings, verification,
                pickups, QR tags, wallet transactions, payouts, commissions,
                audit logs, settings, and admin support chat.
              </p>
            </div>

            <div class="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 xl:w-60">
              <p class="text-xs font-black text-slate-300">System Status</p>
              <p id="dashboardSystemStatus" class="mt-1 text-2xl font-black">Loading</p>
            </div>
          </div>
        </section>

        <!-- KPI CARDS -->
        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          ${statCard('Users', 'dashboardUsersCount', 'Registered users')}
          ${statCard('Waste Listings', 'dashboardListingsCount', 'Institution uploads')}
          ${statCard('Pickups', 'dashboardPickupsCount', 'Pickup records')}
          ${statCard('Payouts', 'dashboardPayoutsTotal', 'Total payout value')}
        </section>

        <!-- MAIN DASHBOARD CONTENT -->
        <section class="grid gap-4 xl:grid-cols-[1fr_360px]">

          <!-- LEFT SIDE -->
          <div class="space-y-4">

            <!-- ALL FEATURES -->
            <section class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-black text-[#020617]">
                    System Features
                  </h3>

                  <p class="text-xs font-semibold text-slate-400">
                    Main admin modules connected to your Laravel backend.
                  </p>
                </div>

                <button
                  id="refreshDashboard"
                  type="button"
                  class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white"
                >
                  Refresh
                </button>
              </div>

              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                ${features.map((feature) => featureCard(feature)).join('')}
              </div>
            </section>

            <!-- RECENT LISTINGS -->
            <section class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-black text-[#020617]">
                    Recent Waste Listings
                  </h3>

                  <p class="text-xs font-semibold text-slate-400">
                    Latest e-waste submissions from institutions.
                  </p>
                </div>

                <a
                  href="/waste-listings"
                  data-link
                  class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-[#020617] hover:bg-slate-50"
                >
                  View All
                </a>
              </div>

              <div id="recentListings" class="grid gap-3 md:grid-cols-2">
                ${loadingRows('Loading listings...')}
              </div>
            </section>
          </div>

          <!-- RIGHT SIDE -->
          <div class="space-y-4">

            <!-- PICKUP STATUS -->
            <section class="rounded-[24px] bg-white p-5 shadow-sm">
              <h3 class="text-lg font-black text-[#020617]">
                Pickup Status
              </h3>

              <div class="mt-4 grid grid-cols-3 gap-3 text-center">
                ${miniStat('pickupDoneCount', 'Done')}
                ${miniStat('pickupPendingCount', 'Pending')}
                ${miniStat('pickupDelayedCount', 'Delayed')}
              </div>
            </section>

            <!-- CATEGORIES + ACTIVITY -->
            <section class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="mb-4">
                <h3 class="text-lg font-black text-[#020617]">
                  Waste Categories
                </h3>

                <p class="text-xs font-semibold text-slate-400">
                  Main configured waste types.
                </p>
              </div>

              <div id="topCategories" class="space-y-3">
                ${loadingRows('Loading categories...')}
              </div>

              <div class="mt-5 border-t border-slate-100 pt-4">
                <h4 class="text-sm font-black text-[#020617]">
                  Recent Activity
                </h4>

                <div id="recentActivity" class="mt-3 space-y-3">
                  ${loadingRows('Loading activity...')}
                </div>
              </div>
            </section>

            <!-- CHAT ASSISTANT -->
            <section class="rounded-[24px] bg-[#020617] p-4 text-white shadow-lg shadow-slate-950/15">
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-black">
                    E-Waste Assistant
                  </h3>

                  <p class="text-[11px] font-semibold text-slate-400">
                    Ask about admin features.
                  </p>
                </div>

                <span class="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#020617]">
                  Chat
                </span>
              </div>

              <div id="dashboardChatMessages" class="mb-3 max-h-32 space-y-2 overflow-hidden rounded-2xl bg-white/10 p-3">
                <div class="rounded-xl bg-white px-3 py-2 text-xs font-semibold leading-5 text-[#020617]">
                  Hello 👋 I can help you understand users, waste listings, pickups, payouts, and settings.
                </div>
              </div>

              <form id="dashboardChatForm" class="flex gap-2">
                <input
                  id="dashboardChatInput"
                  type="text"
                  class="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-semibold text-white outline-none placeholder:text-slate-400 focus:bg-white/15"
                  placeholder="Ask something..."
                />

                <button
                  type="submit"
                  class="h-10 rounded-xl bg-white px-4 text-xs font-black text-[#020617]"
                >
                  Send
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    `,
  )
}

export function initDashboardPage(): void {
  loadDashboard()
  initDashboardChat()

  const refreshButton = document.querySelector<HTMLButtonElement>('#refreshDashboard')

  refreshButton?.addEventListener('click', () => {
    loadDashboard()
  })
}

async function loadDashboard(): Promise<void> {
  setText('dashboardSystemStatus', 'Loading')

  const [
    usersData,
    rolesData,
    categoriesData,
    listingsData,
    verificationsData,
    offersData,
    pickupsData,
    qrTagsData,
    walletData,
    payoutsData,
    commissionsData,
    auditLogsData,
    settingsData,
  ] = await Promise.all([
    getOrNull<UsersApiResponse>('/users'),
    getOrNull<ApiListResponse<unknown>>('/roles'),
    getOrNull<ApiListResponse<WasteCategory>>('/waste-categories'),
    getOrNull<ApiListResponse<WasteListing>>('/waste-listings'),
    getOrNull<ApiListResponse<unknown>>('/waste-verifications'),
    getOrNull<ApiListResponse<unknown>>('/waste-offers'),
    getOrNull<ApiListResponse<Pickup>>('/pickups'),
    getOrNull<ApiListResponse<unknown>>('/qr-tags'),
    getOrNull<ApiListResponse<WalletTransaction>>('/wallet-transactions'),
    getOrNull<ApiListResponse<Payout>>('/payouts'),
    getOrNull<ApiListResponse<unknown>>('/commissions'),
    getOrNull<ApiListResponse<AuditLog>>('/audit-logs'),
    getOrNull<ApiListResponse<unknown>>('/system-settings'),
  ])

  const totalUsers = countUsers(usersData)

  setText('dashboardUsersCount', formatNumber(totalUsers))
  setText('dashboardListingsCount', formatNumber(countRecords(listingsData)))
  setText('dashboardPickupsCount', formatNumber(countRecords(pickupsData)))
  setText('dashboardPayoutsTotal', `RWF ${formatNumber(sumAmounts(toArray(payoutsData), 'amount'))}`)

  setText('featureUsersCount', formatNumber(totalUsers))
  setFeatureCount('featureRolesCount', rolesData)
  setFeatureCount('featureCategoriesCount', categoriesData)
  setFeatureCount('featureListingsCount', listingsData)
  setFeatureCount('featureVerificationsCount', verificationsData)
  setFeatureCount('featureOffersCount', offersData)
  setFeatureCount('featurePickupsCount', pickupsData)
  setFeatureCount('featureQrTagsCount', qrTagsData)
  setFeatureCount('featureWalletCount', walletData)
  setFeatureCount('featurePayoutsCount', payoutsData)
  setFeatureCount('featureCommissionsCount', commissionsData)
  setFeatureCount('featureAuditLogsCount', auditLogsData)
  setFeatureCount('featureSettingsCount', settingsData)

  updatePickupStatus(toArray(pickupsData))
  renderRecentListings(toArray(listingsData).slice(0, 4))
  renderTopCategories(toArray(categoriesData).slice(0, 4))
  renderRecentActivity(toArray(auditLogsData).slice(0, 3))

  setText('dashboardSystemStatus', 'Online')
}

async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path)
  } catch {
    return null
  }
}

function countUsers(response: UsersApiResponse | null): number {
  if (!response) {
    return 0
  }

  if (typeof response.summary?.total === 'number') {
    return response.summary.total
  }

  return countRecords(response.users)
}

function initDashboardChat(): void {
  const form = document.querySelector<HTMLFormElement>('#dashboardChatForm')
  const input = document.querySelector<HTMLInputElement>('#dashboardChatInput')
  const messages = document.querySelector<HTMLDivElement>('#dashboardChatMessages')

  if (!form || !input || !messages) {
    return
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const question = input.value.trim()

    if (!question) {
      return
    }

    addChatMessage(messages, question, 'user')
    addChatMessage(messages, getAssistantReply(question), 'assistant')

    input.value = ''
  })
}

function addChatMessage(container: HTMLDivElement, message: string, type: 'user' | 'assistant'): void {
  const alignmentClass = type === 'user' ? 'ml-auto bg-white/20 text-white' : 'bg-white text-[#020617]'

  container.insertAdjacentHTML(
    'beforeend',
    `
      <div class="max-w-[92%] rounded-xl px-3 py-2 text-xs font-semibold leading-5 ${alignmentClass}">
        ${escapeHtml(message)}
      </div>
    `,
  )
}

function getAssistantReply(question: string): string {
  const text = question.toLowerCase()

  if (text.includes('user')) {
    return 'Users page helps Admin create institutions, Enviroserve staff, drivers, finance officers, and admins.'
  }

  if (text.includes('role')) {
    return 'Roles control what each user can access in the system, such as Admin, Institution, Staff, Driver, and Finance.'
  }

  if (text.includes('category')) {
    return 'Waste Categories define item type, price per kg, average weight, hazardous status, and e-waste nature.'
  }

  if (text.includes('listing')) {
    return 'Waste Listings are submissions from institutions. They can include photos, AI analysis, status, and estimated weight.'
  }

  if (text.includes('pickup')) {
    return 'Pickups manage driver assignment, schedule, location tracking, and collection confirmation.'
  }

  if (text.includes('wallet') || text.includes('payout')) {
    return 'Wallet and Payout pages help track cash, points, transactions, and institution payments.'
  }

  if (text.includes('audit') || text.includes('log')) {
    return 'Audit Logs help Admin monitor system security and important user actions.'
  }

  return 'You can use the sidebar to manage all modules: users, roles, categories, listings, verification, offers, pickups, QR tags, wallet, payouts, commissions, audit logs, and settings.'
}

function countRecords<T>(response: ApiListResponse<T> | null): number {
  if (!response) {
    return 0
  }

  if (Array.isArray(response)) {
    return response.length
  }

  if (typeof response.total === 'number') {
    return response.total
  }

  return response.data?.length || 0
}

function toArray<T>(response: ApiListResponse<T> | null): T[] {
  if (!response) {
    return []
  }

  if (Array.isArray(response)) {
    return response
  }

  return response.data || []
}

function setFeatureCount<T>(id: string, response: ApiListResponse<T> | null): void {
  setText(id, formatNumber(countRecords(response)))
}

function updatePickupStatus(pickups: Pickup[]): void {
  const done = pickups.filter((pickup) =>
    ['completed', 'done', 'collected', 'confirmed'].includes(String(pickup.status || '').toLowerCase()),
  ).length

  const delayed = pickups.filter((pickup) =>
    ['delayed', 'failed', 'cancelled'].includes(String(pickup.status || '').toLowerCase()),
  ).length

  const pending = Math.max(pickups.length - done - delayed, 0)

  setText('pickupDoneCount', String(done))
  setText('pickupPendingCount', String(pending))
  setText('pickupDelayedCount', String(delayed))
}

function renderRecentListings(listings: WasteListing[]): void {
  const container = document.querySelector<HTMLDivElement>('#recentListings')

  if (!container) {
    return
  }

  if (!listings.length) {
    container.innerHTML = emptyState('No recent waste listings found.')
    return
  }

  container.innerHTML = listings
    .map((listing) => {
      const title = listing.title || listing.waste_name || listing.name || `Waste Listing #${listing.id}`
      const weight = listing.verified_weight_kg || listing.estimated_weight_kg || '-'

      return `
        <div class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
          <div>
            <p class="text-sm font-black text-[#020617]">${escapeHtml(title)}</p>
            <p class="mt-1 text-xs font-semibold text-slate-400">Status: ${escapeHtml(String(listing.status || 'pending'))}</p>
          </div>

          <div class="text-right">
            <p class="text-sm font-black text-[#020617]">${escapeHtml(String(weight))} kg</p>
            <p class="mt-1 text-xs font-bold text-slate-400">Weight</p>
          </div>
        </div>
      `
    })
    .join('')
}

function renderTopCategories(categories: WasteCategory[]): void {
  const container = document.querySelector<HTMLDivElement>('#topCategories')

  if (!container) {
    return
  }

  if (!categories.length) {
    container.innerHTML = emptyState('No categories configured yet.')
    return
  }

  container.innerHTML = categories
    .map((category) => {
      const weight = category.average_weight_kg || '-'
      const price = category.price_per_kg || '-'

      return `
        <div class="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#020617] text-xs font-black text-white">
              ${escapeHtml(category.name.charAt(0).toUpperCase())}
            </div>

            <div>
              <p class="text-sm font-black text-[#020617]">${escapeHtml(category.name)}</p>
              <p class="text-xs font-semibold text-slate-400">Avg ${escapeHtml(String(weight))} kg</p>
            </div>
          </div>

          <p class="text-xs font-black text-slate-500">RWF ${escapeHtml(String(price))}</p>
        </div>
      `
    })
    .join('')
}

function renderRecentActivity(logs: AuditLog[]): void {
  const container = document.querySelector<HTMLDivElement>('#recentActivity')

  if (!container) {
    return
  }

  if (!logs.length) {
    container.innerHTML = emptyState('No audit activity yet.')
    return
  }

  container.innerHTML = logs
    .map((log) => {
      const text = log.description || log.action || `Audit log #${log.id}`

      return `
        <div class="rounded-2xl bg-[#f6f8fc] px-4 py-3">
          <p class="text-xs font-black text-[#020617]">${escapeHtml(text)}</p>
          <p class="mt-1 text-[11px] font-semibold text-slate-400">${escapeHtml(formatDate(log.created_at))}</p>
        </div>
      `
    })
    .join('')
}

function statCard(title: string, id: string, subtitle: string): string {
  return `
    <article class="rounded-[22px] bg-white p-4 shadow-sm">
      <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#020617] text-sm font-black text-white">
        ♻
      </div>

      <p class="text-xs font-black text-slate-400">${title}</p>

      <h3 id="${id}" class="mt-1 text-2xl font-black text-[#020617]">
        ...
      </h3>

      <p class="mt-1 text-xs font-bold text-slate-500">${subtitle}</p>
    </article>
  `
}

function featureCard(feature: FeatureCard): string {
  return `
    <a
      href="${feature.href}"
      data-link
      class="rounded-2xl border border-slate-100 bg-[#f6f8fc] p-3 transition hover:border-[#020617] hover:bg-white"
    >
      <div class="mb-3 flex items-center justify-between">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#020617] text-xs font-black text-white">
          ${feature.icon}
        </div>

        <p id="${feature.counterId}" class="text-lg font-black text-[#020617]">...</p>
      </div>

      <h4 class="text-sm font-black text-[#020617]">
        ${feature.title}
      </h4>

      <p class="mt-1 line-clamp-2 text-[11px] font-semibold leading-5 text-slate-500">
        ${feature.description}
      </p>
    </a>
  `
}

function miniStat(id: string, label: string): string {
  return `
    <div class="rounded-2xl bg-[#f6f8fc] p-3">
      <p id="${id}" class="text-lg font-black text-[#020617]">...</p>
      <p class="text-[11px] font-bold text-slate-400">${label}</p>
    </div>
  `
}

function loadingRows(text: string): string {
  return `
    <div class="rounded-2xl bg-[#f6f8fc] px-4 py-3 text-sm font-semibold text-slate-400">
      ${text}
    </div>
  `
}

function emptyState(text: string): string {
  return `
    <div class="rounded-2xl bg-[#f6f8fc] px-4 py-3 text-sm font-semibold text-slate-400">
      ${text}
    </div>
  `
}

function sumAmounts<T extends Record<string, unknown>>(items: T[], key: string): number {
  return items.reduce((total, item) => {
    const value = Number(item[key] || 0)
    return total + (Number.isNaN(value) ? 0 : value)
  }, 0)
}

function setText(id: string, value: string): void {
  const element = document.getElementById(id)

  if (element) {
    element.textContent = value
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatDate(value?: string): string {
  if (!value) {
    return 'Recent'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recent'
  }

  return date.toLocaleDateString()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
