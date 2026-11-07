'use client'

import { formatYyyyMmDdLabel } from '@/lib/utils/date'

/** Match on-screen {@link BalanceSheetContent} report title. */
export const REPORT_EXPORT_TITLE_BALANCE_SHEET = 'Balance Sheet'

/** Match on-screen {@link ProfitAndLossContent} report title. */
export const REPORT_EXPORT_TITLE_PROFIT_AND_LOSS = 'PROFIT & LOSS'

/** Match on-screen {@link TrialBalanceContent} report title. */
export const REPORT_EXPORT_TITLE_TRIAL_BALANCE = 'TRIAL BALANCE'

/** Match on-screen Inventory report export title. */
export const REPORT_EXPORT_TITLE_INVENTORY = 'INVENTORY REPORT'

/** Match on-screen Sales report document title (`SALES REPORT`). */
export const REPORT_EXPORT_TITLE_SALES = 'SALES REPORT'

/** Match on-screen Subsidiary Ledger report title. */
export const REPORT_EXPORT_TITLE_SUBSIDIARY_LEDGER = 'SUBSIDIARY LEDGER'

/** Match on-screen General Ledger report title. */
export const REPORT_EXPORT_TITLE_GENERAL_LEDGER = 'GENERAL LEDGER'

/** PDF/Excel title when the detailed (by invoice) view is exported. */
export const REPORT_EXPORT_TITLE_AR_AGING_BY_INVOICE = 'A/R Aging by Invoice'

/** PDF/Excel title when the summary (by customer) view is exported. */
export const REPORT_EXPORT_TITLE_AR_AGING_BY_CUSTOMER = 'A/R Aging by Customer'

/**
 * Subtitle for balance sheet exports: as-of line only.
 * Location scope is sent separately as `header.description` in the export POST body.
 */
export function buildBalanceSheetExportSubtitle(asOfDate: string): string {
  const label = formatYyyyMmDdLabel(asOfDate)
  return label ? `As of ${label}` : 'As of —'
}

/**
 * Subtitle for trial balance exports: as-of line only.
 * Location scope is sent as `header.description`.
 */
export function buildTrialBalanceExportSubtitle(asOfDate: string): string {
  return buildBalanceSheetExportSubtitle(asOfDate)
}

/** Subsidiary Ledger: same as-of line as trial balance; filters use `header.description`. */
export function buildSubsidiaryLedgerExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/**
 * Optional multiline export description: locations, party, chart of accounts scope.
 * Pass the same lines shown under the on-screen report header (omit empty).
 */
export function buildSubsidiaryLedgerExportDescription(params: {
  locationLine?: string
  partyLine?: string
  accountLine?: string
}): string | undefined {
  const lines = [params.locationLine, params.partyLine, params.accountLine].filter(
    (s): s is string => Boolean(s?.trim())
  )
  return lines.length > 0 ? lines.join('\n') : undefined
}

/** Subtitle for inventory exports: as-of line only. Filters use `header.description`. */
export function buildInventoryExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Purchases by Supplier report document title. */
export const REPORT_EXPORT_TITLE_PURCHASES_BY_SUPPLIER = 'PURCHASES BY SUPPLIER'

/** Subtitle for purchases-by-supplier exports: as-of line only. Locations use `header.description`. */
export function buildPurchasesBySupplierExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Purchases by Product report document title. */
export const REPORT_EXPORT_TITLE_PURCHASES_BY_PRODUCT = 'PURCHASES BY PRODUCT'

/** Subtitle for purchases-by-product exports: as-of line only. Locations use `header.description`. */
export function buildPurchasesByProductExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Product List report document title. */
export const REPORT_EXPORT_TITLE_PRODUCT_LIST = 'PRODUCT LIST'

/** Subtitle for product-list exports: as-of line for the generated snapshot date. */
export function buildProductListExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Supplier List report document title. */
export const REPORT_EXPORT_TITLE_SUPPLIER_LIST = 'SUPPLIER LIST'

/** Subtitle for supplier-list exports: as-of line for the generated snapshot date. */
export function buildSupplierListExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Customer List report document title. */
export const REPORT_EXPORT_TITLE_CUSTOMER_LIST = 'CUSTOMER LIST'

/** Subtitle for customer-list exports: as-of line for the generated snapshot date. */
export function buildCustomerListExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Sales by Product report document title. */
export const REPORT_EXPORT_TITLE_SALES_BY_PRODUCT = 'SALES BY PRODUCT'

/** Subtitle for sales-by-product exports: as-of line only. Locations use `header.description`. */
export function buildSalesByProductExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/** Match on-screen Sales by Customer report document title. */
export const REPORT_EXPORT_TITLE_SALES_BY_CUSTOMER = 'SALES BY CUSTOMER'

/** Subtitle for sales-by-customer exports: as-of line only. Locations use `header.description`. */
export function buildSalesByCustomerExportSubtitle(asOfDate: string): string {
  return buildTrialBalanceExportSubtitle(asOfDate)
}

/**
 * Subtitle for A/R aging exports: as-of line only (same rules as balance sheet).
 * Optional customer filter uses `reportDescription` on the export request.
 */
export function buildArAgingExportSubtitle(asOfDate: string): string {
  return buildBalanceSheetExportSubtitle(asOfDate)
}

/** Optional export description when a customer filter is applied (no view line — title encodes invoice vs customer). */
export function buildArAgingExportDescription(params: { customerId?: string }): string {
  if (params.customerId?.trim()) {
    return 'Filtered by customer'
  }
  return ''
}

/** PDF/Excel title when the detailed (by bill) view is exported. */
export const REPORT_EXPORT_TITLE_AP_AGING_BY_BILL = 'A/P Aging by Bill'

/** PDF/Excel title when the summary (by supplier) view is exported. */
export const REPORT_EXPORT_TITLE_AP_AGING_BY_SUPPLIER = 'A/P Aging by Supplier'

/**
 * Subtitle for A/P aging exports: as-of line only (same rules as balance sheet).
 * Optional supplier filter uses `reportDescription` on the export request.
 */
export function buildApAgingExportSubtitle(asOfDate: string): string {
  return buildBalanceSheetExportSubtitle(asOfDate)
}

/** Optional export description when a supplier filter is applied (no view line — title encodes bill vs supplier). */
export function buildApAgingExportDescription(params: { supplierId?: string }): string {
  if (params.supplierId?.trim()) {
    return 'Filtered by supplier'
  }
  return ''
}

/** Subtitle for P&amp;L exports: `Period: …` only. Locations use `header.description`. */
export function buildProfitAndLossExportSubtitle(from: string, to: string): string {
  const fromLabel = formatYyyyMmDdLabel(from)
  const toLabel = formatYyyyMmDdLabel(to)
  if (!fromLabel || !toLabel) {
    return 'Period: —'
  }
  return `Period: ${fromLabel} – ${toLabel}`
}

/** Subtitle for sales exports: same period line as on-screen sales report / P&amp;L. */
export function buildSalesExportSubtitle(from: string, to: string): string {
  return buildProfitAndLossExportSubtitle(from, to)
}

/** Match on-screen Customer Payments report document title. */
export const REPORT_EXPORT_TITLE_CUSTOMER_PAYMENTS = 'CUSTOMER PAYMENTS'

/** Subtitle for customer-payments exports: period line only. */
export function buildCustomerPaymentsExportSubtitle(
  from: string,
  to: string
): string {
  return buildSalesExportSubtitle(from, to)
}

/** Match on-screen Bills Report document title (`BILLS REPORT`). */
export const REPORT_EXPORT_TITLE_BILLS = 'BILLS REPORT'

/** Subtitle for bills exports: same period line as sales / customer payments. */
export function buildBillsExportSubtitle(from: string, to: string): string {
  return buildSalesExportSubtitle(from, to)
}

/** Subtitle for book of accounts exports: same period line as P&L. */
export function buildBookOfAccountsExportSubtitle(from: string, to: string): string {
  return buildProfitAndLossExportSubtitle(from, to)
}

/** Subtitle for general ledger exports: period line only. */
export function buildGeneralLedgerExportSubtitle(from: string, to: string): string {
  return buildProfitAndLossExportSubtitle(from, to)
}

/** Optional multiline export description for account/search scope lines. */
export function buildGeneralLedgerExportDescription(params: {
  accountLine?: string
  searchLine?: string
}): string | undefined {
  const lines = [params.accountLine, params.searchLine].filter(
    (s): s is string => Boolean(s?.trim())
  )
  return lines.length > 0 ? lines.join('\n') : undefined
}

/** Match on-screen Journal Entries Listing report document title. */
export const REPORT_EXPORT_TITLE_JOURNAL_ENTRIES_LISTING =
  'JOURNAL ENTRIES LISTING'

/** Subtitle for journal entries listing exports: period line only. */
export function buildJournalEntriesListingExportSubtitle(
  from: string,
  to: string
): string {
  return buildProfitAndLossExportSubtitle(from, to)
}
