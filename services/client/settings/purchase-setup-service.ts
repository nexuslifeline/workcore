import { api } from '@/lib/api'

export type PurchaseSetup = {
    id?: string
    organizationId?: string
    defaultApAccountId: string | null
    defaultInventoryPurchaseAccountId: string | null
    defaultExpensePurchaseAccountId: string | null
    defaultPurchaseDiscountAccountId: string | null
    defaultPurchaseReturnAccountId: string | null
    defaultInputVatAccountId: string | null
    defaultPaymentAccountId: string | null
    defaultCwtPayableAccountId: string | null
    purchaseOrderPrefix: string
    lastPurchaseOrderNumber: number
    purchaseOrderNumberPadding: number
    purchaseInvoicePrefix: string
    lastPurchaseInvoiceNumber: number
    purchaseInvoiceNumberPadding: number
    supplierPaymentPrefix: string
    lastSupplierPaymentNumber: number
    supplierPaymentNumberPadding: number
    defaultPaymentTerms: string | null

    // Nested account objects for pre-resolved account details
    defaultApAccount?: { id: string; code: string; name: string } | null
    defaultInventoryPurchaseAccount?: { id: string; code: string; name: string } | null
    defaultExpensePurchaseAccount?: { id: string; code: string; name: string } | null
    defaultPurchaseDiscountAccount?: { id: string; code: string; name: string } | null
    defaultPurchaseReturnAccount?: { id: string; code: string; name: string } | null
    defaultInputVatAccount?: { id: string; code: string; name: string } | null
    defaultPaymentAccount?: { id: string; code: string; name: string } | null
    defaultCwtPayableAccount?: { id: string; code: string; name: string } | null
}

type UpdatePurchaseSetupPayload = Partial<
    Omit<
        PurchaseSetup,
        | 'id'
        | 'organizationId'
        | 'defaultApAccount'
        | 'defaultInventoryPurchaseAccount'
        | 'defaultExpensePurchaseAccount'
        | 'defaultPurchaseDiscountAccount'
        | 'defaultPurchaseReturnAccount'
        | 'defaultInputVatAccount'
        | 'defaultPaymentAccount'
        | 'defaultCwtPayableAccount'
    >
>

/**
 * Fetch the purchase setup for the current organization
 */
export async function getPurchaseSetup(): Promise<PurchaseSetup> {
    const { data } = await api.get<PurchaseSetup>('/purchases/setup')
    return data
}

/**
 * Update the purchase setup
 */
export async function updatePurchaseSetup(
    payload: UpdatePurchaseSetupPayload
): Promise<PurchaseSetup> {
    const { data } = await api.put<PurchaseSetup>('/purchases/setup', payload)
    return data
}
