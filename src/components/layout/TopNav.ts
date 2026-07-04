import { getAuthUser } from '../../auth/auth.service'

export function TopNav(title: string): string {
  const user = getAuthUser()

  return `
    <header class="h-[72px] shrink-0 border-b border-slate-200 bg-white px-5 py-3 xl:px-6">
      <div class="flex h-full items-center justify-between gap-5">
        
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Smart E-Waste Tracking
          </p>

          <h2 class="mt-0.5 text-xl font-black tracking-tight text-[#020617]">
            ${title}
          </h2>
        </div>

        <div class="hidden flex-1 justify-center lg:flex">
          <div class="relative w-full max-w-lg">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Search
            </span>

            <input
              type="text"
              class="h-11 w-full rounded-2xl border border-slate-200 bg-[#f6f8fc] pl-20 pr-4 text-sm font-semibold text-[#020617] outline-none transition focus:border-[#020617] focus:bg-white focus:ring-4 focus:ring-[#020617]/10"
              placeholder="Search users, waste, pickups..."
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#020617] shadow-sm">
            <span class="text-lg">●</span>
            <span class="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#020617]"></span>
          </button>

          <div class="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm sm:flex">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#020617] text-xs font-black text-white">
              ${getUserInitials(user?.name || 'User')}
            </div>

            <div>
              <p class="text-sm font-black leading-4 text-[#020617]">
                ${escapeHtml(user?.name || 'User')}
              </p>

              <p class="text-[11px] font-bold capitalize text-slate-400">
                ${escapeHtml(user?.role || 'admin')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  `
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
