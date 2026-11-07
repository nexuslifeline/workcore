import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency } from '@/lib/constants/currencies'

interface CurrencyState {
  activeCurrency: Currency
  setActiveCurrency: (currency: Currency) => void
  reset: () => void
}

const STORAGE_KEY = 'active-currency'

// Default to Philippine Peso (PHP) at the app level.
// Overridden by OrganizationProvider from the organization's configured currency.
const DEFAULT_CURRENCY: Currency = {
  code: 'PHP',
  name: 'Philippine Peso',
  symbol: '₱',
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      activeCurrency: DEFAULT_CURRENCY,
      setActiveCurrency: (currency) => set({ activeCurrency: currency }),
      reset: () => set({ activeCurrency: DEFAULT_CURRENCY }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
)
