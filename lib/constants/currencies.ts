export type Currency = {
  code: string
  name: string
  symbol: string
}

export const COMMON_CURRENCIES: Currency[] = [
  {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
  },
]

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return COMMON_CURRENCIES.find((currency) => currency.code === code)
}