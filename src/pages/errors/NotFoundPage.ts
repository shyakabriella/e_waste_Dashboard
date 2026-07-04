export function renderNotFoundPage(): string {
  return `
    <main class="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div class="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 class="text-4xl font-black text-slate-950">404</h1>
        <p class="mt-2 text-slate-500">Page not found.</p>
        <a
          href="/dashboard"
          data-link
          class="mt-6 inline-block rounded-xl bg-[#0f172a] px-5 py-3 font-bold text-white"
        >
          Go Dashboard
        </a>
      </div>
    </main>
  `
}