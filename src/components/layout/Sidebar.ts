interface SidebarLink {
  label: string
  href: string
  icon: string
}

interface SidebarGroup {
  title: string
  links: SidebarLink[]
}

const sidebarGroups: SidebarGroup[] = [
  {
    title: 'Overview',
    links: [
      { label: 'Dashboard', href: '/dashboard', icon: '▦' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Users', href: '/users', icon: '▣' },
      { label: 'Roles', href: '/roles', icon: '◉' },
    ],
  },
  {
    title: 'Waste',
    links: [
      { label: 'Categories', href: '/waste-categories', icon: '♻' },
      { label: 'Listings', href: '/waste-listings', icon: '▤' },
      { label: 'Verification', href: '/waste-verifications', icon: '✓' },
      { label: 'Offers', href: '/waste-offers', icon: '◇' },
      { label: 'QR Tags', href: '/qr-tags', icon: '▣' },
    ],
  },
  {
    title: 'Operations',
    links: [
      { label: 'Pickups', href: '/pickups', icon: '▥' },
      { label: 'Wallet', href: '/wallet-transactions', icon: '▧' },
      { label: 'Payouts', href: '/payouts', icon: '◈' },
    ],
  },
  {
    title: 'System',
    links: [
      { label: 'Commissions', href: '/commissions', icon: '%' },
      { label: 'Audit Logs', href: '/audit-logs', icon: '◎' },
      { label: 'Settings', href: '/settings', icon: '⚙' },
    ],
  },
]

export function Sidebar(): string {
  const currentPath = window.location.pathname

  return `
    <aside class="fixed left-0 top-0 z-40 hidden h-screen w-[260px] overflow-hidden border-r border-slate-200 bg-white xl:block">
      <div class="relative flex h-full flex-col px-4 py-4">

        <div class="mb-4 flex items-center gap-3 px-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#020617] text-sm font-black text-white shadow-lg shadow-slate-950/20">
            EW
          </div>

          <div>
            <h1 class="text-base font-black leading-5 text-[#020617]">
              E-Waste
            </h1>
            <p class="text-[11px] font-bold text-slate-400">
              Admin Platform
            </p>
          </div>
        </div>

        <div class="pb-14">
          ${sidebarGroups.map((group) => renderGroup(group, currentPath)).join('')}
        </div>

        <div class="absolute bottom-4 left-4 right-4">
          <button
            id="logoutButton"
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl bg-[#020617] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-red-600"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#020617]">
              ⎋
            </span>

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  `
}

function renderGroup(group: SidebarGroup, currentPath: string): string {
  return `
    <div class="mb-3">
      <div class="mb-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
        ${group.title}
      </div>

      <nav class="space-y-1">
        ${group.links.map((link) => renderLink(link, currentPath)).join('')}
      </nav>
    </div>
  `
}

function renderLink(link: SidebarLink, currentPath: string): string {
  const active = isActiveLink(currentPath, link.href)

  return `
    <a
      href="${link.href}"
      data-link
      class="group flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] font-black transition ${
        active
          ? 'bg-[#020617] text-white shadow-lg shadow-slate-950/10'
          : 'text-slate-500 hover:bg-slate-100 hover:text-[#020617]'
      }"
    >
      <span class="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] ${
        active
          ? 'bg-white text-[#020617]'
          : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#020617]'
      }">
        ${link.icon}
      </span>

      <span>${link.label}</span>
    </a>
  `
}

function isActiveLink(currentPath: string, href: string): boolean {
  if (href === '/dashboard') {
    return currentPath === '/dashboard'
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}
