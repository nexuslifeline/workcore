import { api } from '@/lib/api'

export type SalesSetup = {
    id?: string
    organizationId?: string
    defaultArAccountId: string | null
    defaultSalesRevenueAccountId: string | null
    defaultServiceRevenueAccountId: string | null
    defaultSalesDiscountAccountId: string | null
    defaultSalesReturnAccountId: string | null
    defaultOutputVatAccountId: string | null
    defaultCollectionAccountId: string | null
    defaultCwtReceivableAccountId: string | null
    defaultBankChargesAccountId: string | null
    defaultUndepositedFundsAccountId: string | null
    isInventoryTracked: boolean
    defaultCogsAccountId: string | null
    defaultInventoryAccountId: string | null
    estimatePrefix: string
    lastEstimateNumber: number
    estimateNumberPadding: number
    salesOrderPrefix: string
    lastSalesOrderNumber: number
    salesOrderNumberPadding: number
    invoicePrefix: string
    lastInvoiceNumber: number
    invoiceNumberPadding: number
    paymentPrefix: string
    lastPaymentNumber: number
    paymentNumberPadding: number
    defaultPaymentTerms: string | null
    defaultDueDays: number

    // Nested account objects for pre-resolved account details
    defaultArAccount?: { id: string; code: string; name: string } | null
    defaultSalesRevenueAccount?: { id: string; code: string; name: string } | null
    defaultServiceRevenueAccount?: { id: string; code: string; name: string } | null
    defaultSalesDiscountAccount?: { id: string; code: string; name: string } | null
    defaultSalesReturnAccount?: { id: string; code: string; name: string } | null
    defaultOutputVatAccount?: { id: string; code: string; name: string } | null
    defaultCogsAccount?: { id: string; code: string; name: string } | null
    defaultInventoryAccount?: { id: string; code: string; name: string } | null
    defaultCollectionAccount?: { id: string; code: string; name: string } | null
    defaultCwtReceivableAccount?: { id: string; code: string; name: string } | null
    defaultBankChargesAccount?: { id: string; code: string; name: string } | null
    defaultUndepositedFundsAccount?: { id: string; code: string; name: string } | null
}

type UpdateSalesSetupPayload = Partial<
    Omit<
        SalesSetup,
        | 'id'
        | 'organizationId'
        | 'defaultArAccount'
        | 'defaultSalesRevenueAccount'
        | 'defaultServiceRevenueAccount'
        | 'defaultSalesDiscountAccount'
        | 'defaultSalesReturnAccount'
        | 'defaultOutputVatAccount'
        | 'defaultCogsAccount'
        | 'defaultInventoryAccount'
        | 'defaultCollectionAccount'
        | 'defaultCwtReceivableAccount'
        | 'defaultBankChargesAccount'
        | 'defaultUndepositedFundsAccount'
    >
>

/**
 * Fetch the sales setup for the current organization
 */
export async function getSalesSetup(): Promise<SalesSetup> {
    const { data } = await api.get<SalesSetup>('/sales/setup')
    return data
}

/**
 * Update the sales setup
 */
export async function updateSalesSetup(
    payload: UpdateSalesSetupPayload
): Promise<SalesSetup> {
    const { data } = await api.put<SalesSetup>('/sales/setup', payload)
    return data
}
