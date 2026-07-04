import {
  initLoginPage,
  renderLoginPage,
} from '../pages/auth/LoginPage'

import {
  initDashboardPage,
  renderDashboardPage,
} from '../pages/dashboard/DashboardPage'

import {
  initRolesPage,
  renderRolesPage,
} from '../pages/roles/RolesPage'

import {
  initUsersPage,
  renderUsersPage,
} from '../pages/users/UsersPage'

import {
  initWasteCategoriesPage,
  renderWasteCategoriesPage,
} from '../pages/waste-categories/WasteCategoriesPage'

import {
  initWasteListingsPage,
  initWasteVerificationsPage,
  initWasteOffersPage,
  initQrTagsPage,
  renderAuditLogsPage,
  renderCommissionsPage,
  renderPayoutsPage,
  renderPickupLocationsPage,
  renderPickupsPage,
  renderQrTagsPage,
  renderSettingsPage,
  renderWalletTransactionsPage,
  renderWasteAiAnalysesPage,
  renderWasteListingsPage,
  renderWasteOffersPage,
  renderWastePhotosPage,
  renderWasteVerificationsPage,
} from '../pages/admin/AdminPages'

export interface AppRoute {
  path: string
  title: string
  auth: boolean
  roles?: string[]
  render: () => string
  afterRender?: () => void
}

export const routes: AppRoute[] = [
  /*
  |--------------------------------------------------------------------------
  | Public Routes
  |--------------------------------------------------------------------------
  */

  {
    path: '/login',
    title: 'Login',
    auth: false,
    render: renderLoginPage,
    afterRender: initLoginPage,
  },

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  {
    path: '/',
    title: 'Dashboard',
    auth: true,
    roles: ['admin'],
    render: renderDashboardPage,
    afterRender: initDashboardPage,
  },

  {
    path: '/dashboard',
    title: 'Dashboard',
    auth: true,
    roles: ['admin'],
    render: renderDashboardPage,
    afterRender: initDashboardPage,
  },

  /*
  |--------------------------------------------------------------------------
  | Users & Roles
  |--------------------------------------------------------------------------
  */

  {
    path: '/users',
    title: 'Users',
    auth: true,
    roles: ['admin'],
    render: renderUsersPage,
    afterRender: initUsersPage,
  },

  {
    path: '/roles',
    title: 'Roles',
    auth: true,
    roles: ['admin'],
    render: renderRolesPage,
    afterRender: initRolesPage,
  },

  /*
  |--------------------------------------------------------------------------
  | Waste Category Library
  |--------------------------------------------------------------------------
  */

  {
    path: '/waste-categories',
    title: 'Waste Categories',
    auth: true,
    roles: ['admin'],
    render: renderWasteCategoriesPage,
    afterRender: initWasteCategoriesPage,
  },

  /*
  |--------------------------------------------------------------------------
  | AI Waste Listing
  |--------------------------------------------------------------------------
  */

  {
    path: '/waste-listings',
    title: 'Waste Listings',
    auth: true,
    roles: ['admin'],
    render: renderWasteListingsPage,
    afterRender: initWasteListingsPage,
  },

  {
    path: '/waste-photos',
    title: 'Waste Photos',
    auth: true,
    roles: ['admin'],
    render: renderWastePhotosPage,
  },

  {
    path: '/waste-ai-analyses',
    title: 'Waste AI Analyses',
    auth: true,
    roles: ['admin'],
    render: renderWasteAiAnalysesPage,
  },

  /*
  |--------------------------------------------------------------------------
  | Real Staff Verification
  |--------------------------------------------------------------------------
  */

  {
    path: '/waste-verifications',
    title: 'Waste Verification',
    auth: true,
    roles: ['admin'],
    render: renderWasteVerificationsPage,
    afterRender: initWasteVerificationsPage,
  initWasteOffersPage,
  initQrTagsPage,
  },

  /*
  |--------------------------------------------------------------------------
  | Offers & Collection
  |--------------------------------------------------------------------------
  */

  {
    path: '/waste-offers',
    title: 'Waste Offers',
    auth: true,
    roles: ['admin'],
    render: renderWasteOffersPage,
    afterRender: initWasteOffersPage,
  initQrTagsPage,
  },

  {
    path: '/pickups',
    title: 'Pickups',
    auth: true,
    roles: ['admin'],
    render: renderPickupsPage,
  },

  {
    path: '/pickup-locations',
    title: 'Pickup Locations',
    auth: true,
    roles: ['admin'],
    render: renderPickupLocationsPage,
  },

  {
    path: '/qr-tags',
    title: 'QR Tags',
    auth: true,
    roles: ['admin'],
    render: renderQrTagsPage,
    afterRender: initQrTagsPage,
  },

  /*
  |--------------------------------------------------------------------------
  | Wallet, Payouts & Commission
  |--------------------------------------------------------------------------
  */

  {
    path: '/wallet-transactions',
    title: 'Wallet Transactions',
    auth: true,
    roles: ['admin'],
    render: renderWalletTransactionsPage,
  },

  {
    path: '/payouts',
    title: 'Payout Reports',
    auth: true,
    roles: ['admin'],
    render: renderPayoutsPage,
  },

  {
    path: '/commissions',
    title: 'Commissions',
    auth: true,
    roles: ['admin'],
    render: renderCommissionsPage,
  },

  /*
  |--------------------------------------------------------------------------
  | System
  |--------------------------------------------------------------------------
  */

  {
    path: '/audit-logs',
    title: 'Audit Logs',
    auth: true,
    roles: ['admin'],
    render: renderAuditLogsPage,
  },

  {
    path: '/settings',
    title: 'System Settings',
    auth: true,
    roles: ['admin'],
    render: renderSettingsPage,
  },

  {
    path: '/system-settings',
    title: 'System Settings',
    auth: true,
    roles: ['admin'],
    render: renderSettingsPage,
  },
]

export function findRoute(pathname: string): AppRoute | undefined {
  const normalizedPath = normalizePath(pathname)

  return routes.find((route) => normalizePath(route.path) === normalizedPath)
}

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  const cleanPath = pathname.split('?')[0].split('#')[0]
  const withoutTrailingSlash = cleanPath.replace(/\/+$/, '')

  return withoutTrailingSlash || '/'
}
