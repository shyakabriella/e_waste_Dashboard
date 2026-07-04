import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { Role } from '../../types/role'

export function renderRolesPage(): string {
  return DashboardLayout(
    'Roles Management',
    `
      <div class="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-black text-slate-950">Create Role</h3>
          <p class="mt-1 text-sm text-slate-500">Admin can create roles for the system.</p>

          <div id="roleMessage" class="mt-4 hidden rounded-xl px-4 py-3 text-sm font-semibold"></div>

          <form id="roleForm" class="mt-5 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-bold text-slate-700">Name</label>
              <input
                name="name"
                id="roleName"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                placeholder="Institution"
                required
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-bold text-slate-700">Slug</label>
              <input
                name="slug"
                id="roleSlug"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                placeholder="institution"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-bold text-slate-700">Description</label>
              <textarea
                name="description"
                class="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                placeholder="Role description"
              ></textarea>
            </div>

            <button
              id="roleButton"
              type="submit"
              class="w-full rounded-xl bg-[#0f172a] px-4 py-3 font-black text-white hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save Role
            </button>
          </form>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-black text-slate-950">Roles List</h3>
              <p class="text-sm text-slate-500">All roles created in the backend.</p>
            </div>

            <button
              id="refreshRoles"
              type="button"
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          <div class="overflow-hidden rounded-xl border border-slate-200">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="px-4 py-3">Name</th>
                  <th class="px-4 py-3">Slug</th>
                  <th class="px-4 py-3">Description</th>
                </tr>
              </thead>

              <tbody id="rolesTable" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="3" class="px-4 py-6 text-center text-slate-500">
                    Loading roles...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
  )
}

export function initRolesPage(): void {
  loadRoles()

  const refreshButton = document.querySelector<HTMLButtonElement>('#refreshRoles')
  const roleForm = document.querySelector<HTMLFormElement>('#roleForm')
  const roleNameInput = document.querySelector<HTMLInputElement>('#roleName')
  const roleSlugInput = document.querySelector<HTMLInputElement>('#roleSlug')

  refreshButton?.addEventListener('click', () => {
    loadRoles()
  })

  roleNameInput?.addEventListener('input', () => {
    if (!roleSlugInput) {
      return
    }

    if (roleSlugInput.value.trim() !== '') {
      return
    }

    roleSlugInput.value = makeSlug(roleNameInput.value)
  })

  if (!roleForm) {
    return
  }

  roleForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const form = event.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const name = String(formData.get('name') || '').trim()
    const rawSlug = String(formData.get('slug') || '').trim()
    const description = String(formData.get('description') || '').trim()

    const slug = rawSlug || makeSlug(name)

    const message = document.querySelector<HTMLDivElement>('#roleMessage')
    const button = document.querySelector<HTMLButtonElement>('#roleButton')

    if (!message || !button) {
      return
    }

    message.className = 'mt-4 hidden rounded-xl px-4 py-3 text-sm font-semibold'
    message.textContent = ''

    button.disabled = true
    button.textContent = 'Saving...'

    try {
      await api.post<Role>('/roles', {
        name,
        slug,
        description,
        permissions: [],
      })

      message.textContent = 'Role created successfully.'
      message.className =
        'mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700'

      form.reset()

      await loadRoles()
    } catch (error: unknown) {
      let errorMessage = 'Failed to create role.'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      message.textContent = errorMessage
      message.className =
        'mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'
    } finally {
      button.disabled = false
      button.textContent = 'Save Role'
    }
  })
}

async function loadRoles(): Promise<void> {
  const table = document.querySelector<HTMLTableSectionElement>('#rolesTable')

  if (!table) {
    return
  }

  table.innerHTML = `
    <tr>
      <td colspan="3" class="px-4 py-6 text-center text-slate-500">
        Loading roles...
      </td>
    </tr>
  `

  try {
    const roles = await api.get<Role[]>('/roles')

    if (!roles.length) {
      table.innerHTML = `
        <tr>
          <td colspan="3" class="px-4 py-6 text-center text-slate-500">
            No roles found.
          </td>
        </tr>
      `
      return
    }

    table.innerHTML = roles
      .map(
        (role) => `
          <tr>
            <td class="px-4 py-3 font-bold text-slate-900">${escapeHtml(role.name)}</td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(role.slug)}</td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(role.description || '-')}</td>
          </tr>
        `,
      )
      .join('')
  } catch (error: unknown) {
    let errorMessage = 'Failed to load roles.'

    if (error instanceof Error) {
      errorMessage = error.message
    }

    table.innerHTML = `
      <tr>
        <td colspan="3" class="px-4 py-6 text-center text-red-600">
          ${escapeHtml(errorMessage)}
        </td>
      </tr>
    `
  }
}

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}