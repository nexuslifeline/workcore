'use client'

type JournalEntryRow = {
  account: string
  debit: string | number
  credit: string | number
}

type JournalEntryTableProps = {
  rows: JournalEntryRow[]
}

export function JournalEntryTable({ rows }: JournalEntryTableProps) {
  const parseAmount = (amount: string | number): number => {
    if (amount === '-' || amount === 0) return 0
    if (typeof amount === 'number') return amount
    // Remove currency symbols and commas, then parse
    const cleaned = amount.replace(/[₱,]/g, '').trim()
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const totalDebit = rows.reduce((sum, row) => sum + parseAmount(row.debit), 0)
  const totalCredit = rows.reduce((sum, row) => sum + parseAmount(row.credit), 0)

  const formatAmount = (amount: string | number): string => {
    if (amount === '-' || amount === 0) return '-'
    if (typeof amount === 'number') {
      return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    // If it's already a formatted string, return as is
    return amount
  }

  return (
    <div className="rounded-lg border overflow-hidden my-2">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Account</th>
            <th className="px-4 py-3 text-right font-semibold">Debit</th>
            <th className="px-4 py-3 text-right font-semibold">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 font-medium">{row.account}</td>
              <td className="px-4 py-3 text-right">
                {row.debit === '-' || row.debit === 0 ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatAmount(row.debit)
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {row.credit === '-' || row.credit === 0 ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatAmount(row.credit)
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-muted/30 border-t-2">
          <tr>
            <td className="px-4 py-2 font-semibold">Total</td>
            <td className="px-4 py-2 text-right font-semibold">
              {formatAmount(totalDebit)}
            </td>
            <td className="px-4 py-2 text-right font-semibold">
              {formatAmount(totalCredit)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
