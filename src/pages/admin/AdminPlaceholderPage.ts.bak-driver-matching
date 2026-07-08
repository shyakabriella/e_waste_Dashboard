import { DashboardLayout } from '../../layouts/DashboardLayout'

export function renderAdminPlaceholderPage(title: string, description: string, endpoint: string): string {
  return DashboardLayout(
    title,
    `
      <div class="flex h-full items-center justify-center">
        <section class="w-full max-w-2xl rounded-[26px] bg-white p-8 text-center shadow-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#020617] text-2xl font-black text-white">
            EW
          </div>

          <h1 class="mt-5 text-2xl font-black text-[#020617]">
            ${title}
          </h1>

          <p class="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500">
            ${description}
          </p>

          <div class="mx-auto mt-6 max-w-md rounded-2xl bg-[#f6f8fc] px-5 py-4 text-left">
            <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Backend API
            </p>

            <p class="mt-2 font-mono text-sm font-bold text-[#020617]">
              ${endpoint}
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
