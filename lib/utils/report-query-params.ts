/**
 * Shared helpers for report API query strings (balance sheet, P&L, exports).
 */

/** Comma-separated location UUIDs from `?locationIds=`. */
export function parseLocationIdsParam(param: string | null): string[] | undefined {
  if (param == null || !param.trim()) return undefined
  const parts = param
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

/** Stable fragment for React Query keys. */
export function locationIdsQueryKeyPart(ids: string[] | undefined): string {
  if (!ids?.length) return ''
  return [...ids].sort().join(',')
}

export function appendLocationIds(
  searchParams: URLSearchParams,
  locationIds: string[] | undefined
): void {
  if (locationIds?.length) {
    searchParams.set('locationIds', locationIds.join(','))
  }
}

/**
 * `locationIds=id1,id2` (standard) or repeated `locationId` (legacy trial balance).
 */
export function parseLocationIdsFromSearchParams(
  searchParams: URLSearchParams
): string[] | undefined {
  const comma = parseLocationIdsParam(searchParams.get('locationIds'))
  if (comma?.length) return comma
  const repeated = searchParams
    .getAll('locationId')
    .map((s) => s.trim())
    .filter(Boolean)
  return repeated.length > 0 ? repeated : undefined
}

/**
 * Point-in-time reports (e.g. A/R aging): prefer `asOfDate`, accept legacy `asofdate`.
 */
export function parseReportAsOfDateParam(
  searchParams: URLSearchParams
): string | null {
  const camel = searchParams.get('asOfDate')?.trim()
  if (camel) return camel
  return searchParams.get('asofdate')?.trim() || null
}

const MAX_REPORT_HEADER_LENGTH = 500

/** Strip dangerous control chars; keep newlines for multi-line subtitles. */
function sanitizeReportHeaderInput(raw: string): string {
  return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Optional display title/subtitle from `?reportTitle=` / `?reportSubtitle=` (e.g. PDF/Excel exports).
 * `searchParams.get` already URL-decodes once.
 */
export function parseOptionalReportHeaderParam(param: string | null): string | undefined {
  if (param == null) return undefined
  const cleaned = sanitizeReportHeaderInput(param).trim()
  if (!cleaned) return undefined
  return cleaned.slice(0, MAX_REPORT_HEADER_LENGTH)
}

export function appendReportExportHeaders(
  searchParams: URLSearchParams,
  reportTitle?: string,
  reportSubtitle?: string
): void {
  const t = reportTitle?.trim()
  if (t) {
    searchParams.set(
      'reportTitle',
      sanitizeReportHeaderInput(t).slice(0, MAX_REPORT_HEADER_LENGTH)
    )
  }
  const s = reportSubtitle?.trim()
  if (s) {
    searchParams.set(
      'reportSubtitle',
      sanitizeReportHeaderInput(s).slice(0, MAX_REPORT_HEADER_LENGTH)
    )
  }
}

export type ReportExportPostBodyInput = {
  from: string
  to: string
  locationIds?: string[]
  reportTitle: string
  reportSubtitle: string
  /** Optional third header line (e.g. `Locations: …` from {@link ReportLocationFilter}). */
  reportDescription?: string
}

export type ReportExportPostBody = {
  from: string
  to: string
  locationIds?: string[]
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for balance sheet / P&amp;L PDF and Excel export POST routes. */
export function buildReportExportPostBody(input: ReportExportPostBodyInput): ReportExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: ReportExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: ReportExportPostBody = {
    from: input.from.trim(),
    to: input.to.trim(),
    header,
  }
  if (input.locationIds?.length) {
    body.locationIds = input.locationIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  }
  return body
}

export type CustomerPaymentsExportPostBodyInput = {
  from: string
  to: string
  customerId?: string
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type CustomerPaymentsExportPostBody = {
  from: string
  to: string
  customerId?: string
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for customer payments PDF and Excel export POST routes. */
export function buildCustomerPaymentsExportPostBody(
  input: CustomerPaymentsExportPostBodyInput
): CustomerPaymentsExportPostBody {
  const base = buildReportExportPostBody(input)
  const body: CustomerPaymentsExportPostBody = {
    from: base.from,
    to: base.to,
    header: base.header,
  }
  const cid = input.customerId?.trim()
  if (cid) {
    body.customerId = cid
  }
  return body
}

export type TrialBalanceExportPostBodyInput = {
  asOfDate: string
  locationIds?: string[]
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type TrialBalanceExportPostBody = {
  asOfDate: string
  locationIds?: string[]
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for trial balance PDF and Excel export POST routes. */
export function buildTrialBalanceExportPostBody(
  input: TrialBalanceExportPostBodyInput
): TrialBalanceExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: TrialBalanceExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: TrialBalanceExportPostBody = {
    asOfDate: input.asOfDate.trim(),
    header,
  }
  if (input.locationIds?.length) {
    body.locationIds = input.locationIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  }
  return body
}

export type ArAgingExportPostBodyInput = {
  asOfDate: string
  customerId?: string
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type ArAgingExportPostBody = {
  asOfDate: string
  customerId?: string
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for A/R aging PDF and Excel export POST routes. */
export function buildArAgingExportPostBody(
  input: ArAgingExportPostBodyInput
): ArAgingExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: ArAgingExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: ArAgingExportPostBody = {
    asOfDate: input.asOfDate.trim(),
    header,
  }
  const cid = input.customerId?.trim()
  if (cid) {
    body.customerId = cid
  }
  return body
}

export type ApAgingExportPostBodyInput = {
  asOfDate: string
  supplierId?: string
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type ApAgingExportPostBody = {
  asOfDate: string
  supplierId?: string
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for A/P aging PDF and Excel export POST routes. */
export function buildApAgingExportPostBody(
  input: ApAgingExportPostBodyInput
): ApAgingExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: ApAgingExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: ApAgingExportPostBody = {
    asOfDate: input.asOfDate.trim(),
    header,
  }
  const sid = input.supplierId?.trim()
  if (sid) {
    body.supplierId = sid
  }
  return body
}

export type InventoryExportPostBodyInput = {
  asOfDate: string
  locationIds?: string[]
  productId?: string
  categoryIds?: string[]
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type InventoryExportPostBody = {
  asOfDate: string
  locationIds?: string[]
  productId?: string
  categoryIds?: string[]
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for inventory report PDF and Excel export POST routes. */
export function buildInventoryExportPostBody(
  input: InventoryExportPostBodyInput
): InventoryExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: InventoryExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: InventoryExportPostBody = {
    asOfDate: input.asOfDate.trim(),
    header,
  }

  if (input.locationIds?.length) {
    body.locationIds = input.locationIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  }

  const productId = input.productId?.trim()
  if (productId) {
    body.productId = productId
  }

  if (input.categoryIds?.length) {
    body.categoryIds = input.categoryIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  }

  return body
}

export type SubsidiaryLedgerExportPostBodyInput = {
  asOfDate: string
  locationIds?: string[]
  partyType: 'customer' | 'supplier'
  partyId: string
  accountIds?: string[]
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type SubsidiaryLedgerExportPostBody = {
  asOfDate: string
  locationIds?: string[]
  partyType: 'customer' | 'supplier'
  partyId: string
  accountIds?: string[]
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for subsidiary ledger PDF and Excel export POST routes. */
export function buildSubsidiaryLedgerExportPostBody(
  input: SubsidiaryLedgerExportPostBodyInput
): SubsidiaryLedgerExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: SubsidiaryLedgerExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: SubsidiaryLedgerExportPostBody = {
    asOfDate: input.asOfDate.trim(),
    partyType: input.partyType,
    partyId: input.partyId.trim(),
    header,
  }

  if (input.locationIds?.length) {
    body.locationIds = input.locationIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  }

  if (input.accountIds?.length) {
    body.accountIds = input.accountIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  }

  return body
}

export type HeaderOnlyExportPostBodyInput = {
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type HeaderOnlyExportPostBody = {
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

export type ProductListExportPostBodyInput = HeaderOnlyExportPostBodyInput
export type ProductListExportPostBody = HeaderOnlyExportPostBody
export type SupplierListExportPostBodyInput = HeaderOnlyExportPostBodyInput
export type SupplierListExportPostBody = HeaderOnlyExportPostBody
export type CustomerListExportPostBodyInput = HeaderOnlyExportPostBodyInput
export type CustomerListExportPostBody = HeaderOnlyExportPostBody

/** JSON body for catalog list PDF/Excel export POST routes (header only). */
export function buildHeaderOnlyExportPostBody(
  input: HeaderOnlyExportPostBodyInput
): HeaderOnlyExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: HeaderOnlyExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  return { header }
}

/** JSON body for product list PDF and Excel export POST routes (header only). */
export function buildProductListExportPostBody(
  input: ProductListExportPostBodyInput
): ProductListExportPostBody {
  return buildHeaderOnlyExportPostBody(input)
}

/** JSON body for supplier list PDF and Excel export POST routes (header only). */
export function buildSupplierListExportPostBody(
  input: SupplierListExportPostBodyInput
): SupplierListExportPostBody {
  return buildHeaderOnlyExportPostBody(input)
}

/** JSON body for customer list PDF and Excel export POST routes (header only). */
export function buildCustomerListExportPostBody(
  input: CustomerListExportPostBodyInput
): CustomerListExportPostBody {
  return buildHeaderOnlyExportPostBody(input)
}

export type GeneralLedgerExportPostBodyInput = {
  from: string
  to: string
  accountId?: string
  search?: string
  reportTitle: string
  reportSubtitle: string
  reportDescription?: string
}

export type GeneralLedgerExportPostBody = {
  from: string
  to: string
  accountId?: string
  search?: string
  header: {
    title: string
    subtitle: string
    description?: string
  }
}

/** JSON body for general ledger PDF export POST route. */
export function buildGeneralLedgerExportPostBody(
  input: GeneralLedgerExportPostBodyInput
): GeneralLedgerExportPostBody {
  const title = parseOptionalReportHeaderParam(input.reportTitle?.trim() ?? null)
  const subtitle = parseOptionalReportHeaderParam(input.reportSubtitle?.trim() ?? null)
  if (!title || !subtitle) {
    throw new Error('reportTitle and reportSubtitle are required for export')
  }

  const description = input.reportDescription?.trim()
    ? parseOptionalReportHeaderParam(input.reportDescription.trim())
    : undefined

  const header: GeneralLedgerExportPostBody['header'] = { title, subtitle }
  if (description) {
    header.description = description
  }

  const body: GeneralLedgerExportPostBody = {
    from: input.from.trim(),
    to: input.to.trim(),
    header,
  }

  const accountId = input.accountId?.trim()
  if (accountId) {
    body.accountId = accountId
  }

  const search = input.search?.trim()
  if (search) {
    body.search = search
  }

  return body
}
