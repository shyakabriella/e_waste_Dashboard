import { login } from '../../auth/auth.service'
import { AuthLayout } from '../../layouts/AuthLayout'
import { ApiError } from '../../lib/api'
import { navigateTo } from '../../router/navigation'

export function renderLoginPage(): string {
  return AuthLayout(`
    <div class="w-full max-w-sm">
      <div class="mb-10 text-center">
        <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0b1633] text-2xl font-black text-white shadow-lg shadow-blue-950/20">
          EW
        </div>

        <h1 class="text-4xl font-black tracking-tight text-[#0b1633]">
          Welcome
        </h1>

        <p class="mt-3 text-sm font-medium leading-6 text-slate-500">
          Login to access the Smart E-Waste Tracking and Monetization Dashboard.
        </p>
      </div>

      <div
        id="loginError"
        class="mb-5 hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
      ></div>

      <form id="loginForm" class="space-y-5">
        <div>
          <label for="email" class="mb-2 block text-xs font-black uppercase tracking-wide text-[#0b1633]">
            Username / Email
          </label>

          <div class="relative">
            <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">
              @
            </span>

            <input
              id="email"
              name="email"
              type="email"
              value="admin@ewaste.com"
              class="w-full border-b-2 border-slate-300 bg-transparent py-3 pl-7 pr-3 text-sm font-semibold text-[#0b1633] outline-none transition placeholder:text-slate-400 focus:border-[#0b1633]"
              placeholder="admin@ewaste.com"
              required
            />
          </div>
        </div>

        <div>
          <label for="password" class="mb-2 block text-xs font-black uppercase tracking-wide text-[#0b1633]">
            Password
          </label>

          <div class="relative">
            <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">
              🔒
            </span>

            <input
              id="password"
              name="password"
              type="password"
              value="Admin@12345"
              class="w-full border-b-2 border-slate-300 bg-transparent py-3 pl-7 pr-3 text-sm font-semibold text-[#0b1633] outline-none transition placeholder:text-slate-400 focus:border-[#0b1633]"
              placeholder="Enter password"
              required
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              checked
            />
            Remember me
          </label>

          <button
            type="button"
            class="text-xs font-black text-blue-900 hover:text-blue-700"
          >
            Forgot Password?
          </button>
        </div>

        <button
          id="loginButton"
          type="submit"
          class="w-full rounded-lg bg-[#0b1633] px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Login
        </button>
      </form>

      <div class="mt-8 text-center">
        <p class="text-xs font-black uppercase tracking-wide text-[#0b1633]">
          Platform access
        </p>

        <div class="mt-4 flex justify-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-[#0b1633]">
            A
          </span>
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-[#0b1633]">
            S
          </span>
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-[#0b1633]">
            D
          </span>
        </div>

        <p class="mt-4 text-xs text-slate-400">
          Admin • Staff • Driver • Institution • Finance
        </p>
      </div>
    </div>
  `)
}

export function initLoginPage(): void {
  const form = document.querySelector<HTMLFormElement>('#loginForm')
  const errorBox = document.querySelector<HTMLDivElement>('#loginError')
  const button = document.querySelector<HTMLButtonElement>('#loginButton')

  if (!form || !errorBox || !button) {
    return
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)

    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '').trim()

    errorBox.classList.add('hidden')
    errorBox.textContent = ''

    button.disabled = true
    button.textContent = 'Logging in...'

    try {
      await login(email, password)
      navigateTo('/dashboard')
    } catch (error: unknown) {
      errorBox.textContent = getLoginErrorMessage(error)
      errorBox.classList.remove('hidden')
    } finally {
      button.disabled = false
      button.textContent = 'Login'
    }
  })
}

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Login failed. Please try again.'
}
