import { DashboardLayout } from '../../layouts/DashboardLayout'

export function renderAccessDeniedPage(): string {
  return DashboardLayout(
    'Access Denied',
    `
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h3 class="text-xl font-black">Access denied</h3>
        <p class="mt-2">You do not have permission to open this page.</p>
      </div>
    `,
  )
}