import QRCode from 'qrcode'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { api } from '../../lib/api'
import type { PaginatedResponse } from '../../types/api'

interface UserSummary {
  id?: number
  name?: string
  email?: string
  role?: string
  institution_name?: string | null
  phone?: string | null
}

interface WasteListing {
  id: number
  title?: string
  status?: string
  estimated_weight_kg?: number | string | null
  verified_weight_kg?: number | string | null
  final_price?: number | string | null
  currency?: string
  institution?: UserSummary
}

interface QrTag {
  id: number
  waste_listing_id?: number
  pickup_id?: number | null
  qr_code?: string
  qr_type?: string
  qr_image_path?: string | null
  status?: string
  notes?: string | null
  scan_purpose?: string | null
  scan_latitude?: number | string | null
  scan_longitude?: number | string | null
  created_at?: string
  printed_at?: string | null
  scanned_at?: string | null
  waste_listing?: WasteListing
  wasteListing?: WasteListing
  created_by?: UserSummary
  createdBy?: UserSummary
  printed_by?: UserSummary
  printedBy?: UserSummary
  scanned_by?: UserSummary
  scannedBy?: UserSummary
}

type ListingResponse = WasteListing[] | PaginatedResponse<WasteListing>
type QrTagResponse = QrTag[] | PaginatedResponse<QrTag>

let selectedListing: WasteListing | null = null

export function renderQrTagsPage(): string {
  return DashboardLayout(
    'QR Tags',
    `
      <div class="space-y-5">
        <section class="rounded-[24px] bg-[#020617] p-5 text-white shadow-lg shadow-slate-950/15">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            QR Waste Tracking
          </p>

          <h1 class="mt-2 text-2xl font-black tracking-tight">
            Generate, Print, Attach & Scan Real QR Tags
          </h1>

          <p class="mt-2 max-w-3xl text-sm font-medium text-slate-300">
            Generate real scannable QR tracking codes after verification or accepted offer. Print the tag, attach it to waste, then scan during pickup or collection.
          </p>
        </section>

        <section class="grid gap-5 xl:grid-cols-[430px_1fr]">
          <div class="space-y-5">
            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-lg font-black text-[#020617]">
                    Ready for QR
                  </h3>
                  <p class="mt-1 text-xs font-semibold text-slate-400">
                    Verified or offer accepted listings.
                  </p>
                </div>

                <button id="refreshQrListings" class="rounded-xl bg-[#020617] px-4 py-2 text-xs font-black text-white">
                  Refresh
                </button>
              </div>

              <div id="qrMessage" class="mt-4 hidden rounded-xl px-4 py-3 text-sm font-bold"></div>

              <div id="qrListingsList" class="mt-4 space-y-3">
                ${infoBox('Loading listings...')}
              </div>
            </div>

            <div class="rounded-[24px] bg-white p-5 shadow-sm">
              <h3 class="text-lg font-black text-[#020617]">
                QR Tags
              </h3>

              <form id="qrFilterForm" class="mt-4 grid grid-cols-[1fr_auto] gap-3">
                <select id="qrStatusFilter" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
                  <option value="all">All Tags</option>
                  <option value="generated">Generated</option>
                  <option value="printed">Printed</option>
                  <option value="attached">Attached</option>
                  <option value="scanned">Scanned</option>
                  <option value="used">Used</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button class="h-10 rounded-xl border border-slate-200 px-4 text-xs font-black text-[#020617] hover:bg-slate-50">
                  Filter
                </button>
              </form>

              <div id="qrTagsList" class="mt-4 space-y-3">
                ${infoBox('Loading QR tags...')}
              </div>
            </div>
          </div>

          <div class="rounded-[24px] bg-white p-5 shadow-sm">
            <div id="qrPanel">
              <div class="rounded-2xl bg-[#f6f8fc] p-6 text-center">
                <h3 class="text-lg font-black text-[#020617]">
                  Select listing or QR tag
                </h3>

                <p class="mt-2 text-sm font-semibold text-slate-500">
                  Select a listing to generate QR tag, or select an existing tag to print and scan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  )
}

export function initQrTagsPage(): void {
  document.querySelector<HTMLButtonElement>('#refreshQrListings')?.addEventListener('click', () => {
    loadQrListings()
    loadQrTags()
  })

  document.querySelector<HTMLFormElement>('#qrFilterForm')?.addEventListener('submit', (event) => {
    event.preventDefault()
    loadQrTags()
  })

  document.querySelector<HTMLSelectElement>('#qrStatusFilter')?.addEventListener('change', () => {
    loadQrTags()
  })

  loadQrListings()
  loadQrTags()
}

async function loadQrListings(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#qrListingsList')

  if (!container) {
    return
  }

  container.innerHTML = infoBox('Loading listings ready for QR...')

  try {
    const verified = await api.get<ListingResponse>('/waste-listings?per_page=100&status=verified')
    const accepted = await api.get<ListingResponse>('/waste-listings?per_page=100&status=offer_accepted')

    const listings = [
      ...normalizeList(verified),
      ...normalizeList(accepted),
    ]

    const uniqueListings = Array.from(
      new Map(listings.map((listing) => [listing.id, listing])).values(),
    )

    if (!uniqueListings.length) {
      container.innerHTML = infoBox('No verified or offer accepted listings ready for QR.')
      return
    }

    container.innerHTML = uniqueListings.map(renderListingCard).join('')

    container.querySelectorAll<HTMLButtonElement>('[data-select-qr-listing]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.selectQrListing)
        const listing = uniqueListings.find((item) => item.id === id)

        if (listing) {
          selectedListing = listing
          renderGeneratePanel(listing)
          showMessage('Listing selected. Generate QR tag now.', 'success')
        }
      })
    })
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load listings.'))
  }
}

async function loadQrTags(): Promise<void> {
  const container = document.querySelector<HTMLDivElement>('#qrTagsList')

  if (!container) {
    return
  }

  const status = document.querySelector<HTMLSelectElement>('#qrStatusFilter')?.value || 'all'
  const params = new URLSearchParams()
  params.set('per_page', '100')

  if (status !== 'all') {
    params.set('status', status)
  }

  container.innerHTML = infoBox('Loading QR tags...')

  try {
    const response = await api.get<QrTagResponse>(`/qr-tags?${params.toString()}`)
    const tags = normalizeList(response)

    if (!tags.length) {
      container.innerHTML = infoBox('No QR tags found.')
      return
    }

    container.innerHTML = tags.map(renderQrTagCard).join('')

    container.querySelectorAll<HTMLButtonElement>('[data-view-qr-tag]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.viewQrTag)
        const tag = tags.find((item) => item.id === id)

        if (tag) {
          renderQrTagPanel(tag)
        }
      })
    })
  } catch (error: unknown) {
    container.innerHTML = errorBox(getErrorMessage(error, 'Failed to load QR tags.'))
  }
}

function renderGeneratePanel(listing: WasteListing): void {
  const panel = document.querySelector<HTMLDivElement>('#qrPanel')

  if (!panel) {
    return
  }

  const weight = listing.verified_weight_kg || listing.estimated_weight_kg || 0
  const price = listing.final_price || 0

  panel.innerHTML = `
    <div>
      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        Generate QR Tag
      </p>

      <h2 class="mt-1 text-2xl font-black text-[#020617]">
        ${escapeHtml(listing.title || `Listing #${listing.id}`)}
      </h2>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        ${summaryCard('Status', listing.status || '-')}
        ${summaryCard('Weight', `${weight} kg`)}
        ${summaryCard('Final Price', `${listing.currency || 'RWF'} ${price}`)}
      </div>

      <form id="generateQrForm" class="mt-5 rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          QR Details
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">QR Type</label>
            <select name="qr_type" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="waste_tracking">Waste Tracking</option>
              <option value="pickup_tracking">Pickup Tracking</option>
              <option value="verification_tracking">Verification Tracking</option>
              <option value="collection_tracking">Collection Tracking</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Pickup ID optional</label>
            <input name="pickup_id" type="number" min="1" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Optional" />
          </div>
        </div>

        <div class="mt-3">
          <label class="mb-1 block text-xs font-black text-slate-600">Notes</label>
          <textarea name="notes" class="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="QR tag notes"></textarea>
        </div>

        <button type="submit" class="mt-4 h-11 w-full rounded-xl bg-[#020617] text-sm font-black text-white transition hover:bg-[#0b1633]">
          Generate Real QR Tag
        </button>
      </form>
    </div>
  `

  bindGenerateQrForm()
}

function bindGenerateQrForm(): void {
  const form = document.querySelector<HTMLFormElement>('#generateQrForm')

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!selectedListing) {
      showMessage('Select listing first.', 'error')
      return
    }

    const formData = new FormData(form)

    const body = {
      waste_listing_id: selectedListing.id,
      pickup_id: numberOrNull(formData.get('pickup_id')),
      qr_type: String(formData.get('qr_type') || 'waste_tracking'),
      notes: String(formData.get('notes') || ''),
    }

    showMessage('Generating real QR tag...', 'info')

    try {
      const tag = await api.post<QrTag>('/qr-tags', body)
      showMessage('QR tag generated successfully.', 'success')
      await renderQrTagPanel(tag)
      await loadQrTags()
    } catch (error: unknown) {
      showMessage(getErrorMessage(error, 'Failed to generate QR tag.'), 'error')
    }
  })
}

async function renderQrTagPanel(tag: QrTag): Promise<void> {
  const panel = document.querySelector<HTMLDivElement>('#qrPanel')

  if (!panel) {
    return
  }

  const listing = tag.wasteListing || tag.waste_listing
  const institution = listing?.institution
  const qrPayload = buildQrPayload(tag)
  const qrImage = await generateQrImage(qrPayload)

  panel.innerHTML = `
    <div>
      <div id="printableQrTag" class="rounded-[24px] border-2 border-dashed border-slate-300 bg-white p-6">
        <p class="text-center text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          E-Waste Tracking Tag
        </p>

        <h2 class="mt-2 break-all text-center text-2xl font-black text-[#020617]">
          ${escapeHtml(tag.qr_code || '-')}
        </h2>

        <div class="mx-auto mt-5 flex h-64 w-64 items-center justify-center rounded-2xl border-4 border-[#020617] bg-white p-3">
          <img
            src="${qrImage}"
            alt="Real QR Code"
            class="h-full w-full object-contain"
          />
        </div>

        <div class="mt-5 space-y-2 text-sm font-semibold text-slate-600">
          <p><span class="font-black text-[#020617]">Listing:</span> ${escapeHtml(listing?.title || '-')}</p>
          <p><span class="font-black text-[#020617]">Institution:</span> ${escapeHtml(institution?.institution_name || institution?.name || '-')}</p>
          <p><span class="font-black text-[#020617]">Status:</span> ${escapeHtml(tag.status || '-')}</p>
          <p><span class="font-black text-[#020617]">Type:</span> ${escapeHtml(tag.qr_type || '-')}</p>
          <p><span class="font-black text-[#020617]">Payload:</span> ${escapeHtml(qrPayload)}</p>
        </div>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <button id="printQrButton" class="h-11 rounded-xl bg-[#020617] text-sm font-black text-white">
          Print Tag
        </button>

        <button id="markPrintedButton" class="h-11 rounded-xl border border-slate-200 text-sm font-black text-[#020617]">
          Mark Printed
        </button>

        <button id="markAttachedButton" class="h-11 rounded-xl border border-slate-200 text-sm font-black text-[#020617]">
          Mark Attached
        </button>
      </div>

      <form id="scanQrForm" class="mt-5 rounded-2xl border border-slate-100 bg-[#f6f8fc] p-4">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Scan QR Tag
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Scan Purpose</label>
            <select name="scan_purpose" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="verification">Verification</option>
              <option value="pickup">Pickup</option>
              <option value="collection_confirmation">Collection Confirmation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-black text-slate-600">Status</label>
            <select name="status" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]">
              <option value="scanned">Scanned</option>
              <option value="used">Used</option>
            </select>
          </div>

          <input name="scan_latitude" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Latitude optional" />
          <input name="scan_longitude" class="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#020617]" placeholder="Longitude optional" />
        </div>

        <button type="submit" class="mt-4 h-11 w-full rounded-xl bg-[#020617] text-sm font-black text-white">
          Save Scan
        </button>
      </form>
    </div>
  `

  document.querySelector<HTMLButtonElement>('#printQrButton')?.addEventListener('click', () => {
    printQrTag()
  })

  document.querySelector<HTMLButtonElement>('#markPrintedButton')?.addEventListener('click', () => {
    updateQrStatus(tag.id, 'printed')
  })

  document.querySelector<HTMLButtonElement>('#markAttachedButton')?.addEventListener('click', () => {
    updateQrStatus(tag.id, 'attached')
  })

  bindScanQrForm(tag.id)
}

function bindScanQrForm(tagId: number): void {
  const form = document.querySelector<HTMLFormElement>('#scanQrForm')

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)

    const body = {
      scan_purpose: String(formData.get('scan_purpose') || 'verification'),
      status: String(formData.get('status') || 'scanned'),
      scan_latitude: numberOrNull(formData.get('scan_latitude')),
      scan_longitude: numberOrNull(formData.get('scan_longitude')),
    }

    showMessage('Saving QR scan...', 'info')

    try {
      const tag = await api.post<QrTag>(`/qr-tags/${tagId}/scan`, body)
      showMessage('QR tag scanned successfully.', 'success')
      await renderQrTagPanel(tag)
      await loadQrTags()
      await loadQrListings()
    } catch (error: unknown) {
      showMessage(getErrorMessage(error, 'Failed to scan QR tag.'), 'error')
    }
  })
}

async function updateQrStatus(id: number, status: string): Promise<void> {
  showMessage(`Updating QR tag to ${status}...`, 'info')

  try {
    const tag = await api.put<QrTag>(`/qr-tags/${id}`, { status })
    showMessage('QR tag updated successfully.', 'success')
    await renderQrTagPanel(tag)
    await loadQrTags()
  } catch (error: unknown) {
    showMessage(getErrorMessage(error, 'Failed to update QR tag.'), 'error')
  }
}

function buildQrPayload(tag: QrTag): string {
  const listing = tag.wasteListing || tag.waste_listing

  return JSON.stringify({
    type: 'e_waste_qr_tag',
    qr_code: tag.qr_code,
    qr_tag_id: tag.id,
    waste_listing_id: tag.waste_listing_id || listing?.id,
    listing_title: listing?.title || null,
    status: tag.status,
  })
}

async function generateQrImage(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}

function printQrTag(): void {
  const printable = document.querySelector<HTMLDivElement>('#printableQrTag')

  if (!printable) {
    return
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700')

  if (!printWindow) {
    window.print()
    return
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>E-Waste QR Tag</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
          }

          .tag {
            max-width: 520px;
            margin: 0 auto;
          }

          img {
            max-width: 260px;
          }
        </style>
      </head>
      <body>
        <div class="tag">
          ${printable.innerHTML}
        </div>

        <script>
          window.onload = function () {
            window.print()
          }
        </script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

function renderListingCard(listing: WasteListing): string {
  const weight = listing.verified_weight_kg || listing.estimated_weight_kg || 0
  const finalPrice = listing.final_price || 0

  return `
    <article class="rounded-2xl border border-slate-100 p-4 transition hover:bg-[#f6f8fc]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-black text-[#020617]">${escapeHtml(listing.title || `Listing #${listing.id}`)}</h4>
          <p class="mt-1 text-xs font-semibold text-slate-400">
            ${escapeHtml(listing.institution?.institution_name || listing.institution?.name || 'Institution')}
          </p>
          <p class="mt-2 text-xs font-black text-slate-600">
            ${escapeHtml(String(weight))} kg • ${escapeHtml(listing.currency || 'RWF')} ${escapeHtml(String(finalPrice))}
          </p>
        </div>

        <button data-select-qr-listing="${listing.id}" class="rounded-xl bg-[#020617] px-3 py-2 text-xs font-black text-white">
          Generate
        </button>
      </div>
    </article>
  `
}

function renderQrTagCard(tag: QrTag): string {
  const listing = tag.wasteListing || tag.waste_listing

  return `
    <article class="rounded-2xl border border-slate-100 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-black text-[#020617]">${escapeHtml(tag.qr_code || `QR #${tag.id}`)}</p>
          <p class="mt-1 text-xs font-semibold text-slate-400">
            ${escapeHtml(listing?.title || '-')}
          </p>
          <p class="mt-2 text-xs font-black text-slate-600">
            ${escapeHtml(tag.qr_type || 'waste_tracking')}
          </p>
        </div>

        <span class="rounded-full px-3 py-1 text-xs font-black ${statusClass(tag.status)}">
          ${escapeHtml(tag.status || '-')}
        </span>
      </div>

      <button data-view-qr-tag="${tag.id}" class="mt-3 h-9 w-full rounded-xl bg-[#020617] text-xs font-black text-white">
        View Real QR / Print / Scan
      </button>
    </article>
  `
}

function summaryCard(label: string, value: string): string {
  return `
    <div class="rounded-xl bg-[#f6f8fc] px-4 py-3">
      <p class="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">${label}</p>
      <p class="mt-1 text-sm font-black text-[#020617]">${escapeHtml(value)}</p>
    </div>
  `
}

function statusClass(status?: string): string {
  if (status === 'attached' || status === 'scanned' || status === 'used') {
    return 'bg-green-50 text-green-700'
  }

  if (status === 'cancelled') {
    return 'bg-red-50 text-red-700'
  }

  if (status === 'printed') {
    return 'bg-blue-50 text-blue-700'
  }

  return 'bg-slate-100 text-slate-600'
}

function normalizeList<T>(response: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.data || []
}

function infoBox(message: string): string {
  return `<div class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">${escapeHtml(message)}</div>`
}

function errorBox(message: string): string {
  return `<div class="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">${escapeHtml(message)}</div>`
}

function showMessage(message: string, type: 'success' | 'error' | 'info'): void {
  const messageBox = document.querySelector<HTMLDivElement>('#qrMessage')

  if (!messageBox) {
    return
  }

  const colorClass =
    type === 'success'
      ? 'bg-green-50 text-green-700'
      : type === 'error'
        ? 'bg-red-50 text-red-700'
        : 'bg-blue-50 text-blue-700'

  messageBox.textContent = message
  messageBox.className = `mt-4 rounded-xl px-4 py-3 text-sm font-bold ${colorClass}`
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : null
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
