import { Footer } from '../components/layout/Footer'
import { Sidebar } from '../components/layout/Sidebar'
import { TopNav } from '../components/layout/TopNav'

export function DashboardLayout(title: string, content: string): string {
  return `
    <main class="min-h-screen bg-[#f6f8fc] text-[#020617]">
      ${Sidebar()}

      <!-- MAIN AREA: scrollable page, sidebar fixed -->
      <section class="min-h-screen xl:ml-[260px]">
        ${TopNav(title)}

        <section class="px-5 py-5 xl:px-6">
          ${content}
        </section>

        ${Footer()}
      </section>
    </main>
  `
}
