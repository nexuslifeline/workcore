import type React from 'react'

export type DetailItem = {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
}

export function DetailsTable({ items }: { items: DetailItem[] }) {
  const rows: { left: DetailItem; right?: DetailItem }[] = []
  for (let i = 0; i < items.length; i += 2) {
    rows.push({ left: items[i], right: items[i + 1] })
  }

  return (
    <div className='mb-3 overflow-hidden border border-border bg-background'>
      <table className='w-full text-xs sm:text-sm border-collapse'>
        <tbody>
          {rows.map(({ left, right }, idx) => (
            <tr
              key={`${String(left.label)}-${idx}`}
              className='border-b border-border/40 last:border-b-0'
            >
              <td className='py-1.5 px-3 text-muted-foreground whitespace-nowrap align-baseline border-r border-border/40'>
                <div className='flex items-center gap-1.5'>
                  {left.icon && (
                    <span className='inline-flex items-center justify-center text-muted-foreground'>
                      {left.icon}
                    </span>
                  )}
                  <span>{left.label}</span>
                </div>
              </td>
              <td className='py-1.5 pl-3 pr-6 text-right align-baseline border-r border-border/40'>
                {left.value}
              </td>
              {right ? (
                <>
                  <td className='py-1.5 px-3 text-muted-foreground whitespace-nowrap align-baseline hidden sm:table-cell border-r border-border/40'>
                    <div className='flex items-center gap-1.5'>
                      {right.icon && (
                        <span className='inline-flex items-center justify-center text-muted-foreground'>
                          {right.icon}
                        </span>
                      )}
                      <span>{right.label}</span>
                    </div>
                  </td>
                  <td className='py-1.5 px-3 text-right align-baseline hidden sm:table-cell'>
                    {right.value}
                  </td>
                </>
              ) : (
                <>
                  <td className='hidden sm:table-cell' />
                  <td className='hidden sm:table-cell' />
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
