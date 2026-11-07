'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/common/sheet'
import { formatShortDate } from '@/lib/utils'
import { toYyyyMmDdLocal } from '@/lib/utils/date'
import { toCurrency } from '@/lib/utils/currency'
import { appendLocationIds } from '@/lib/utils/report-query-params'
import { useCurrencyStore } from '@/stores/currency-store'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/common/skeletons/skeleton'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

type DateValue = Date | string

type AccountTransactionDateRange = {
  from: DateValue
  to: DateValue
}

type AccountTransactionFilterMode = 'dateRange' | 'asOfDate'

type AccountTransaction = {
  id: string
  journalEntryId: string | null
  transaction_date: string | Date | null
  reference_number: string | null
  debit: number | null
  credit: number | null
  balance: number
}

type AccountSummary = {
  code: string
  name: string
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type AccountTransactionPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  dateRange: AccountTransactionDateRange
  asOfDate: DateValue
  locationIds?: string[]
  locationFilterSubtitle?: string
  filterMode?: AccountTransactionFilterMode
  title?: string
  description?: string
  children?: ReactNode
}

const DEFAULT_TITLE = 'Account transactions'
const DEFAULT_DESCRIPTION = 'Review account activity for the selected period.'

function formatDate(value: DateValue) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function toQueryDate(value: DateValue) {
  if (value instanceof Date) {
    return toYyyyMmDdLocal(value)
  }
  return value
}

export function AccountTransactionPanel({
  open,
  onOpenChange,
  accountId,
  dateRange,
  asOfDate,
  locationIds,
  locationFilterSubtitle,
  filterMode = 'dateRange',
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  children,
}: AccountTransactionPanelProps) {
  const { activeCurrency } = useCurrencyStore()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<AccountTransaction[]>([])
  const [account, setAccount] = useState<AccountSummary | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  /** True when the last fetched page was full (more journal rows may exist). */
  const [hasNextPage, setHasNextPage] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))

    if (filterMode === 'asOfDate') {
      params.set('asOfDate', toQueryDate(asOfDate))
    } else {
      params.set('from', toQueryDate(dateRange.from))
      params.set('to', toQueryDate(dateRange.to))
    }
    appendLocationIds(params, locationIds)

    return params.toString()
  }, [asOfDate, dateRange.from, dateRange.to, filterMode, locationIds, page, pageSize])

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()

    async function run() {
      isLoadingRef.current = true
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await api.get(
          `/accounts/${encodeURIComponent(accountId)}/transactions?${queryString}`,
          { signal: controller.signal }
        )

        const next = Array.isArray(data?.transactions)
          ? (data.transactions as AccountTransaction[])
          : []

        // Beginning-balance row is synthetic; only journal lines count toward page fullness.
        const journalRowCount = next.filter((row) => row.journalEntryId != null).length
        const paginationData = (data?.pagination as Pagination | null) ?? null
        const nextPageAvailable =
          journalRowCount >= pageSize &&
          (paginationData ? paginationData.page < paginationData.totalPages : true)

        setTransactions((prev) => (page <= 1 ? next : [...prev, ...next]))
        setHasNextPage(nextPageAvailable)
        const accountData = data?.account
        setAccount(
          accountData?.code && accountData?.name
            ? { code: accountData.code, name: accountData.name }
            : null
        )
        setPagination(paginationData)
      } catch (e) {
        const errorLike = e as { name?: string; code?: string }
        if (errorLike?.name === 'CanceledError') return
        if (errorLike?.code === 'ERR_CANCELED') return
        if (controller.signal.aborted) return
        if (page <= 1) {
          setTransactions([])
          setPagination(null)
          setHasNextPage(false)
        }
        setError(e instanceof Error ? e.message : 'Failed to fetch account transactions')
      } finally {
        // Don't clear loading state for an aborted request — a newer page fetch may be in flight.
        if (!controller.signal.aborted) {
          isLoadingRef.current = false
          setIsLoading(false)
        }
      }
    }

    run()
    return () => {
      controller.abort()
    }
  }, [open, accountId, page, pageSize, queryString])

  // Reset list when the filter changes (but keep current pageSize).
  useEffect(() => {
    setPage(1)
    setTransactions([])
    setPagination(null)
    setHasNextPage(false)
  }, [accountId, filterMode, dateRange.from, dateRange.to, asOfDate, locationIds])

  const showInitialSkeleton =
    open && transactions.length === 0 && !error && pagination == null
  const showDetailsSkeleton = showInitialSkeleton || (isLoading && !account && !pagination)

  const displayTotal =
    pagination == null
      ? null
      : filterMode === 'asOfDate'
        ? pagination.total + 1
        : pagination.total

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isLoadingRef.current) return
    setPage((p) => p + 1)
  }, [hasNextPage])

  useInfiniteScroll({
    enabled: open,
    hasNextPage,
    isLoadingMore: isLoading,
    onLoadMore: handleLoadMore,
    scrollRef,
    threshold: 120,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden sm:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b pb-4">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4 text-sm">
          {showDetailsSkeleton ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-64" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-56" />
                </div>
              </div>
              {locationIds?.length ? (
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-48" />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Account</p>
                  <p className="font-medium text-foreground">
                    {account ? `${account.code} - ${account.name}` : accountId}
                  </p>
                </div>

                {filterMode === 'dateRange' ? (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium text-foreground">
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">As of date</p>
                    <p className="font-medium text-foreground">{formatDate(asOfDate)}</p>
                  </div>
                )}
              </div>

              {locationIds?.length ? (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Locations</p>
                  <p className="font-medium text-foreground">
                    {locationFilterSubtitle?.trim() || `${locationIds.length} selected`}
                  </p>
                </div>
              ) : null}
            </>
          )}

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">Transactions</p>
            </div>

            {displayTotal != null ? (
              <p className="text-xs text-muted-foreground">
                Showing {transactions.length} of {displayTotal}
              </p>
            ) : null}

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground">
                      Reference
                    </th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                      Debit
                    </th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                      Credit
                    </th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(showInitialSkeleton || (isLoading && transactions.length === 0)) ? (
                    Array.from({ length: 6 }).map((_, rowIndex) => (
                      <tr key={`sk-${rowIndex}`} className="border-b last:border-b-0">
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                          <td
                            key={`sk-${rowIndex}-${colIndex}`}
                            className="px-2 py-2 align-top"
                          >
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td className="px-2 py-3 text-muted-foreground" colSpan={5}>
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-b-0">
                        <td className="px-2 py-2 align-top text-foreground">
                          {t.transaction_date ? formatShortDate(t.transaction_date) : ''}
                        </td>
                        <td className="px-2 py-2 align-top text-foreground">
                          {t.reference_number || ''}
                        </td>
                        <td className="px-2 py-2 align-top text-right tabular-nums">
                          {typeof t.debit === 'number' && t.debit !== 0
                            ? toCurrency(t.debit, activeCurrency.code)
                            : ''}
                        </td>
                        <td className="px-2 py-2 align-top text-right tabular-nums">
                          {typeof t.credit === 'number' && t.credit !== 0
                            ? toCurrency(t.credit, activeCurrency.code)
                            : ''}
                        </td>
                        <td className="px-2 py-2 align-top text-right tabular-nums font-medium">
                          {toCurrency(t.balance, activeCurrency.code)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isLoading && page > 1 ? (
              <p className="pt-1 text-center text-xs text-muted-foreground">Loading…</p>
            ) : null}

            {!isLoading && !hasNextPage && transactions.length > 0 ? (
              <p className="pt-1 text-center text-xs text-muted-foreground">
                No more transactions to load
              </p>
            ) : null}
          </div>

          {children ? <div className="pt-2">{children}</div> : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
