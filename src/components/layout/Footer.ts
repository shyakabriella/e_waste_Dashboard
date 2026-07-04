export function Footer(): string {
  return `
    <footer class="h-10 shrink-0 border-t border-slate-200 bg-white px-5 py-2 xl:px-6">
      <div class="flex h-full items-center justify-between text-xs font-semibold text-slate-500">
        <p>© ${new Date().getFullYear()} Smart E-Waste Platform</p>
        <p class="hidden md:block">Enviroserve Rwanda Green Park • Kigali</p>
      </div>
    </footer>
  `
}
