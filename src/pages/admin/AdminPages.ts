import { renderAdminPlaceholderPage } from './AdminPlaceholderPage'

/*
|--------------------------------------------------------------------------
| Real Integrated Pages
|--------------------------------------------------------------------------
*/

export {
  initWasteListingsPage,
  renderWasteListingsPage,
} from '../waste-listings/WasteListingsPage'

export {
  initWasteVerificationsPage,
  renderWasteVerificationsPage,
} from '../waste-verifications/WasteVerificationsPage'

export {
  initWasteOffersPage,
  renderWasteOffersPage,
} from '../waste-offers/WasteOffersPage'

export {
  initQrTagsPage,
  renderQrTagsPage,
} from '../qr-tags/QrTagsPage'

/*
|--------------------------------------------------------------------------
| Placeholder Pages
|--------------------------------------------------------------------------
*/

export function renderWastePhotosPage(): string {
  return renderAdminPlaceholderPage(
    'Waste Photos',
    'Manage uploaded waste photos used for proof, AI analysis, verification, and listing details.',
    '/api/waste-photos',
  )
}

export function renderWasteAiAnalysesPage(): string {
  return renderAdminPlaceholderPage(
    'Waste AI Analyses',
    'Review AI analysis results, detected items, category prediction, item breakdown, confidence score, estimated kilograms, and estimated value.',
    '/api/waste-ai-analyses',
  )
}

export function renderPickupsPage(): string {
  return renderAdminPlaceholderPage(
    'Pickups',
    'Schedule pickups, assign drivers, track pickup status, and handle confirmation by institution and Enviroserve staff.',
    '/api/pickups',
  )
}

export function renderPickupLocationsPage(): string {
  return renderAdminPlaceholderPage(
    'Pickup Locations',
    'Track pickup movement, GPS location history, driver route updates, and collection progress.',
    '/api/pickup-locations',
  )
}

export function renderWalletTransactionsPage(): string {
  return renderAdminPlaceholderPage(
    'Wallet Transactions',
    'View institution wallet cash, points, credits, debits, payout deductions, and payment history.',
    '/api/wallet-transactions',
  )
}

export function renderPayoutsPage(): string {
  return renderAdminPlaceholderPage(
    'Payout Reports',
    'Review and approve institution payout requests, payout status, and payment reporting.',
    '/api/payouts',
  )
}

export function renderCommissionsPage(): string {
  return renderAdminPlaceholderPage(
    'Commissions',
    'Track platform commission records from completed waste transactions and approved payouts.',
    '/api/commissions',
  )
}

export function renderAuditLogsPage(): string {
  return renderAdminPlaceholderPage(
    'Audit Logs',
    'Monitor system security logs, user actions, admin activities, updates, deletes, approvals, and failed operations.',
    '/api/audit-logs',
  )
}

export function renderSettingsPage(): string {
  return renderAdminPlaceholderPage(
    'System Settings',
    'Configure system prices, AI options, wallet rules, commission rules, pickup options, security, and system behavior.',
    '/api/system-settings',
  )
}
