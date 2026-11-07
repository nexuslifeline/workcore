import { useEffect, useRef, type RefObject } from 'react'

type UseInfiniteScrollOptions = {
  /**
   * Whether the infinite scroll should be enabled
   */
  enabled?: boolean
  /**
   * Whether there is a next page to load (optional if using onLoadMore callback pattern)
   */
  hasNextPage?: boolean
  /**
   * Whether currently fetching the next page (optional if using isLoadingMore)
   */
  isFetchingNextPage?: boolean
  /**
   * Callback to fetch the next page (React Query pattern)
   */
  fetchNextPage?: () => void
  /**
   * Callback to load more (generic callback pattern)
   */
  onLoadMore?: () => void
  /**
   * Whether currently loading more (for callback pattern)
   */
  isLoadingMore?: boolean
  /**
   * Optional ref to the scrollable element. If not provided, will use the default ref.
   */
  scrollRef?: RefObject<HTMLDivElement>
  /**
   * Distance from bottom (in pixels) to trigger loading more
   * @default 50
   */
  threshold?: number
}

/**
 * Hook to handle infinite scroll loading in scrollable containers
 * 
 * @example
 * ```tsx
 * const listRef = useRef<HTMLDivElement>(null)
 * const { hasNextPage, isFetchingNextPage, fetchNextPage } = useDataInfinite()
 * 
 * useInfiniteScroll({
 *   enabled: open,
 *   hasNextPage,
 *   isFetchingNextPage,
 *   fetchNextPage,
 *   scrollRef: listRef,
 * })
 * ```
 */
export function useInfiniteScroll({
  enabled = true,
  hasNextPage = true,
  isFetchingNextPage = false,
  fetchNextPage,
  onLoadMore,
  isLoadingMore = false,
  scrollRef,
  threshold = 50,
}: UseInfiniteScrollOptions) {
  const defaultRef = useRef<HTMLDivElement>(null)
  const ref = scrollRef || defaultRef

  // Determine which callback and loading state to use
  const loadMore = fetchNextPage || onLoadMore
  const isFetching = isFetchingNextPage || isLoadingMore

  useEffect(() => {
    if (!enabled || !ref.current || !loadMore) return

    const listElement = ref.current

    const checkAndLoad = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      // Load more when scrolled to within threshold of bottom
      if (
        distanceFromBottom <= threshold &&
        !isFetching &&
        hasNextPage
      ) {
        loadMore()
      }
    }

    const handleScroll = () => checkAndLoad()

    // Run immediately so pre-scrolled/short lists can load next page without extra scroll.
    checkAndLoad()

    // Re-check after layout settles (cmdk/popover lists can finalize size after paint).
    const rafId = requestAnimationFrame(() => {
      checkAndLoad()
    })

    listElement.addEventListener('scroll', handleScroll, { passive: true })

    // Re-check whenever list height changes after new items render.
    const resizeObserver = new ResizeObserver(() => {
      checkAndLoad()
    })
    resizeObserver.observe(listElement)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      listElement.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, hasNextPage, isFetching, loadMore, threshold, ref])

  return ref
}
