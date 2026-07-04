import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'
import type { Role } from '../../types/role'

type UserStatus = 'active' | 'inactive' | 'suspended'

interface UserRecord {
  id: number
  name: string
  email: string
  role: string
  status: UserStatus
  phone?: string | null
  address?: string | null
  institution_name?: string | null
  institution_type?: string | null
  district?: string | null
  sector?: string | null
  cell?: string | null
  village?: string | null
  staff_code?: string | null
  staff_position?: string | null
  wallet_balance?: string | number
  points_balance?: string | number
  created_at?: string
}

interface CreateUserPayload {
  name: string
  email: string
  role: string
  status: UserStatus
  phone?: string
  address?: string
  institution_name?: string
  institution_type?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  staff_code?: string
  staff_position?: string
}

interface CreateUserResponse {
  user: UserRecord
}

interface UsersIndexResponse {
  users: UserRecord[] | PaginatedResponse<UserRecord>
  summary?: {
    total?: number
    active?: number
    inactive?: number
    suspended?: number
    admins?: number
    institutions?: number
    staff?: number
    drivers?: number
    finance_officers?: number
  }
}

type RoleResponse =
  | Role[]
  | PaginatedResponse<Role>
  | {
      roles?: Role[] | PaginatedResponse<Role>
      data?: Role[] | PaginatedResponse<Role>
    }

type UserResponse =
  | UserRecord[]
  | PaginatedResponse<UserRecord>
  | UsersIndexResponse

export function renderUsersPage(): string {
  return DashboardLayout(
    'Users Management',
    `
      <div class="space-y-5">

        <!-- HEADER -->
        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Admin User Management
              </p>

              <h1 class="mt-2 text-2xl font-black tracking-tight">
                Users, Roles & Access
              </h1>

              <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Create system users, assign roles, and automatically email login credentials.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              ${summaryCard('Total', 'usersTotalCount')}
              ${summaryCard('Active', 'usersActiveCount')}
              ${summaryCard('Institutions', 'usersInstitutionCount')}
              ${summaryCard('Staff', 'usersStaffCount')}
            </div>
          </div>
        </section>

        <section class="grid gap-5 xl:grid-cols-[420px_1fr]">

          <!-- CREATE USER FORM -->
          <div class="rounded-[24px] bg-white p-5 shadow-sm">
            <div>
              <h3 class="text-lg font-black text-[#020617]">
                Create User
              </h3>

              <p class="mt-1 text-xs font-semibold text-slate-400">
                Password is generated automatically and emailed to the user.
              </p>
            </div>

            <div id="userMessage" class="mt-4 hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

            <form id="userForm" class="mt-4 space-y-3">

              <div>
                <label class="mb-1.5 block text-xs font-black text-slate-600">
                  Full Name
                </label>

                <input
                  name="name"
                  class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617] focus:ring-4 focus:ring-[#020617]/10"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-black text-slate-600">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617] focus:ring-4 focus:ring-[#020617]/10"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1.5 block text-xs font-black text-slate-600">
                    Role
                  </label>

                  <select
                    id="userRole"
                    name="role"
                    class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    required
                  >
                    <option value="">Loading roles...</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-black text-slate-600">
                    Status
                  </label>

                  <select
                    name="status"
                    class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1.5 block text-xs font-black text-slate-600">
                    Phone
                  </label>

                  <input
                    name="phone"
                    class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-black text-slate-600">
                    Address
                  </label>

                  <input
                    name="address"
                    class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    placeholder="Address"
                  />
                </div>
              </div>

              <!-- INSTITUTION FIELDS -->
              <div id="institutionFields" class="hidden rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
                <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Institution Details
                </p>

                <div class="space-y-3">
                  <input
                    name="institution_name"
                    class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    placeholder="Institution name"
                  />

                  <input
                    name="institution_type"
                    class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    placeholder="Institution type"
                  />

                  <div class="grid grid-cols-2 gap-3">
                    <input name="district" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="District" />
                    <input name="sector" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Sector" />
                    <input name="cell" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Cell" />
                    <input name="village" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Village" />
                  </div>
                </div>
              </div>

              <!-- STAFF FIELDS -->
              <div id="staffFields" class="hidden rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
                <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Staff Details
                </p>

                <div class="grid grid-cols-2 gap-3">
                  <input
                    name="staff_code"
                    class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    placeholder="Staff code"
                  />

                  <input
                    name="staff_position"
                    class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                    placeholder="Staff position"
                  />
                </div>
              </div>

              <button
                id="userButton"
                type="submit"
                class="h-11 w-full rounded-xl bg-[#020617] text-sm font-black text-white transition hover:bg-[#0b1633] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create & Email Credentials
              </button>
            </form>
          </div>

          <!-- USERS LIST -->
          <div class="rounded-[24px] bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 class="text-lg font-black text-[#020617]">
                  Users From Backend
                </h3>

                <p class="mt-1 text-xs font-semibold text-slate-400">
                  Loaded from backend users endpoint.
                </p>
              </div>

              <button
                id="refreshUsersButton"
                type="button"
                class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white"
              >
                Refresh
              </button>
            </div>

            <!-- FILTERS -->
            <form id="userFilterForm" class="mt-4 grid gap-3 md:grid-cols-[1fr_170px_170px_auto]">
              <input
                id="usersSearchInput"
                class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
                placeholder="Search users..."
              />

              <select
                id="usersRoleFilter"
                class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
              >
                <option value="all">All Roles</option>
              </select>

              <select
                id="usersStatusFilter"
                class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                type="submit"
                class="h-10 rounded-xl border border-slate-200 px-4 text-xs font-black text-[#020617] hover:bg-slate-50"
              >
                Filter
              </button>
            </form>

            <!-- LATEST CREATED USER -->
            <div id="createdUserBox" class="mt-4 hidden rounded-2xl bg-green-50 p-4"></div>

            <!-- TABLE -->
            <div class="mt-4 overflow-hidden rounded-2xl border border-slate-100">
              <table class="w-full text-left text-sm">
                <thead class="bg-[#f6f8fc] text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th class="px-4 py-3">User</th>
                    <th class="px-4 py-3">Role</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Phone</th>
                    <th class="px-4 py-3">Wallet</th>
                  </tr>
                </thead>

                <tbody id="usersTable" class="divide-y divide-slate-100">
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `,
  )
}

export function initUsersPage(): void {
  bindRoleFields()
  bindUserForm()
  bindUsersFilters()
  bindButtons()

  loadRoles()
  loadUsers()
}

function bindButtons(): void {
  document.querySelector<HTMLButtonElement>('#refreshUsersButton')?.addEventListener('click', () => {
    loadUsers()
  })
}

function bindRoleFields(): void {
  const roleSelect = document.querySelector<HTMLSelectElement>('#userRole')
  const institutionFields = document.querySelector<HTMLDivElement>('#institutionFields')
  const staffFields = document.querySelector<HTMLDivElement>('#staffFields')

  if (!roleSelect || !institutionFields || !staffFields) {
    return
  }

  const updateFields = () => {
    const role = roleSelect.value

    institutionFields.classList.toggle('hidden', role !== 'institution')
    staffFields.classList.toggle('hidden', role !== 'enviroserve_staff')
  }

  if (!roleSelect.dataset.bound) {
    roleSelect.addEventListener('change', updateFields)
    roleSelect.dataset.bound = 'true'
  }

  updateFields()
}

function bindUsersFilters(): void {
  const form = document.querySelector<HTMLFormElement>('#userFilterForm')
  const roleFilter = document.querySelector<HTMLSelectElement>('#usersRoleFilter')
  const statusFilter = document.querySelector<HTMLSelectElement>('#usersStatusFilter')

  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    loadUsers()
  })

  roleFilter?.addEventListener('change', () => {
    loadUsers()
  })

  statusFilter?.addEventListener('change', () => {
    loadUsers()
  })
}

function bindUserForm(): void {
  const form = document.querySelector<HTMLFormElement>('#userForm')
  const messageBox = document.querySelector<HTMLDivElement>('#userMessage')
  const button = document.querySelector<HTMLButtonElement>('#userButton')

  if (!form || !messageBox || !button) {
    return
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    messageBox.className = 'mt-4 hidden rounded-xl px-4 py-3 text-sm font-bold'
    messageBox.textContent = ''

    button.disabled = true
    button.textContent = 'Creating & emailing...'

    try {
      const payload = buildCreateUserPayload(form)
      const response = await api.post<CreateUserResponse>('/register', payload)

      messageBox.textContent = 'User created successfully. Login credentials were emailed automatically.'
      messageBox.className =
        'mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700'

      renderCreatedUser(response.user)
      form.reset()

      await loadRoles()
      await loadUsers()
      bindRoleFields()
    } catch (error: unknown) {
      messageBox.textContent = getErrorMessage(error, 'Failed to create user.')
      messageBox.className =
        'mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700'
    } finally {
      button.disabled = false
      button.textContent = 'Create & Email Credentials'
    }
  })
}

async function loadRoles(): Promise<void> {
  const roleSelect = document.querySelector<HTMLSelectElement>('#userRole')
  const roleFilter = document.querySelector<HTMLSelectElement>('#usersRoleFilter')

  if (roleSelect) {
    roleSelect.innerHTML = `<option value="">Loading roles...</option>`
  }

  try {
    const response = await api.get<RoleResponse>('/roles')
    const roles = normalizeRoles(response)

    if (!roles.length) {
      if (roleSelect) {
        roleSelect.innerHTML = `<option value="">No roles found</option>`
      }

      return
    }

    if (roleSelect) {
      roleSelect.innerHTML = `
        <option value="">Select role</option>
        ${roles.map((role) => `<option value="${escapeHtml(role.slug)}">${escapeHtml(role.name)}</option>`).join('')}
      `
    }

    if (roleFilter) {
      roleFilter.innerHTML = `
        <option value="all">All Roles</option>
        ${roles.map((role) => `<option value="${escapeHtml(role.slug)}">${escapeHtml(role.name)}</option>`).join('')}
      `
    }

    bindRoleFields()
  } catch {
    if (roleSelect) {
      roleSelect.innerHTML = `<option value="">Failed to load roles</option>`
    }
  }
}

async function loadUsers(): Promise<void> {
  const table = document.querySelector<HTMLTableSectionElement>('#usersTable')

  if (!table) {
    return
  }

  table.innerHTML = `
    <tr>
      <td colspan="5" class="px-4 py-8 text-center text-slate-500">
        Loading users...
      </td>
    </tr>
  `

  try {
    const query = buildUsersQuery()
    const response = await api.get<UserResponse>(`/users${query}`)
    const users = normalizeUsers(response)
    const summary = extractSummary(response)

    updateSummary(summary, users)

    if (!users.length) {
      table.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-slate-500">
            No users found.
          </td>
        </tr>
      `
      return
    }

    table.innerHTML = users.map((user) => renderUserRow(user)).join('')
  } catch (error: unknown) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-red-600">
          ${escapeHtml(getErrorMessage(error, 'Failed to load users.'))}
        </td>
      </tr>
    `
  }
}

function buildUsersQuery(): string {
  const search = document.querySelector<HTMLInputElement>('#usersSearchInput')?.value.trim() || ''
  const role = document.querySelector<HTMLSelectElement>('#usersRoleFilter')?.value || 'all'
  const status = document.querySelector<HTMLSelectElement>('#usersStatusFilter')?.value || 'all'

  const params = new URLSearchParams()

  params.set('per_page', '100')

  if (search) {
    params.set('search', search)
  }

  if (role !== 'all') {
    params.set('role', role)
  }

  if (status !== 'all') {
    params.set('status', status)
  }

  return `?${params.toString()}`
}

function renderUserRow(user: UserRecord): string {
  return `
    <tr class="hover:bg-[#f6f8fc]">
      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">${escapeHtml(user.name)}</p>
        <p class="text-xs font-semibold text-slate-400">${escapeHtml(user.email)}</p>
      </td>

      <td class="px-4 py-3">
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#020617]">
          ${escapeHtml(formatRole(user.role))}
        </span>
      </td>

      <td class="px-4 py-3">
        <span class="rounded-full px-3 py-1 text-xs font-black ${
          user.status === 'active'
            ? 'bg-green-50 text-green-700'
            : user.status === 'suspended'
              ? 'bg-red-50 text-red-700'
              : 'bg-slate-100 text-slate-500'
        }">
          ${escapeHtml(user.status)}
        </span>
      </td>

      <td class="px-4 py-3 font-semibold text-slate-500">
        ${escapeHtml(user.phone || '-')}
      </td>

      <td class="px-4 py-3">
        <p class="font-black text-[#020617]">RWF ${escapeHtml(String(user.wallet_balance ?? 0))}</p>
        <p class="text-xs font-semibold text-slate-400">${escapeHtml(String(user.points_balance ?? 0))} points</p>
      </td>
    </tr>
  `
}

function buildCreateUserPayload(form: HTMLFormElement): CreateUserPayload {
  const formData = new FormData(form)

  return {
    name: getString(formData, 'name'),
    email: getString(formData, 'email'),
    role: getString(formData, 'role'),
    status: getString(formData, 'status') as UserStatus,

    phone: getOptionalString(formData, 'phone'),
    address: getOptionalString(formData, 'address'),

    institution_name: getOptionalString(formData, 'institution_name'),
    institution_type: getOptionalString(formData, 'institution_type'),
    district: getOptionalString(formData, 'district'),
    sector: getOptionalString(formData, 'sector'),
    cell: getOptionalString(formData, 'cell'),
    village: getOptionalString(formData, 'village'),

    staff_code: getOptionalString(formData, 'staff_code'),
    staff_position: getOptionalString(formData, 'staff_position'),
  }
}

function renderCreatedUser(user: UserRecord): void {
  const box = document.querySelector<HTMLDivElement>('#createdUserBox')

  if (!box) {
    return
  }

  box.classList.remove('hidden')

  box.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.16em] text-green-700">
          Latest Created User
        </p>

        <h4 class="mt-1 text-lg font-black text-[#020617]">
          ${escapeHtml(user.name)}
        </h4>

        <p class="mt-1 text-sm font-semibold text-slate-500">
          ${escapeHtml(user.email)}
        </p>
      </div>

      <span class="rounded-full bg-white px-3 py-1 text-xs font-black text-green-700">
        ${escapeHtml(user.status)}
      </span>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-3">
      ${infoItem('Role', formatRole(user.role))}
      ${infoItem('Phone', user.phone || '-')}
      ${infoItem('Institution', user.institution_name || '-')}
      ${infoItem('Credentials', 'Sent by email')}
    </div>
  `
}

function summaryCard(label: string, id: string): string {
  return `
    <div class="rounded-2xl bg-white/10 px-4 py-3">
      <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${label}</p>
      <p id="${id}" class="mt-1 text-xl font-black text-white">...</p>
    </div>
  `
}

function infoItem(label: string, value: string): string {
  return `
    <div class="rounded-xl bg-white px-4 py-3">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        ${label}
      </p>

      <p class="mt-1 text-sm font-black text-[#020617]">
        ${escapeHtml(value)}
      </p>
    </div>
  `
}

function normalizeRoles(response: RoleResponse): Role[] {
  if (Array.isArray(response)) {
    return response
  }

  if ('roles' in response && response.roles) {
    return extractItems(response.roles)
  }

  if ('data' in response && response.data) {
    return extractItems(response.data)
  }

  return []
}

function normalizeUsers(response: UserResponse): UserRecord[] {
  if (Array.isArray(response)) {
    return response
  }

  if ('users' in response) {
    return extractItems(response.users)
  }

  if ('data' in response) {
    return extractItems(response)
  }

  return []
}

function extractItems<T>(source: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(source)) {
    return source
  }

  return source.data || []
}

function extractSummary(response: UserResponse): UsersIndexResponse['summary'] | undefined {
  if (!Array.isArray(response) && 'summary' in response) {
    return response.summary
  }

  return undefined
}

function updateSummary(summary: UsersIndexResponse['summary'], users: UserRecord[]): void {
  const total = summary?.total ?? users.length
  const active = summary?.active ?? users.filter((user) => user.status === 'active').length
  const institutions =
    summary?.institutions ?? users.filter((user) => user.role === 'institution').length
  const staff =
    summary?.staff ?? users.filter((user) => user.role === 'enviroserve_staff').length

  setText('usersTotalCount', String(total))
  setText('usersActiveCount', String(active))
  setText('usersInstitutionCount', String(institutions))
  setText('usersStaffCount', String(staff))
}

function setText(id: string, value: string): void {
  const element = document.getElementById(id)

  if (element) {
    element.textContent = value
  }
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getString(formData: FormData, key: string): string {
  return String(formData.get(key) || '').trim()
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = getString(formData, key)
  return value || undefined
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}