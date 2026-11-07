import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export function useDebouncedSearch({
  value,
  delayMs = 500,
  onDebouncedChange,
}: {
  value: string
  delayMs?: number
  onDebouncedChange: (next: string) => void
}) {
  const [inputValue, setInputValue] = useState(value)

  // Keep local input in sync when external value changes (e.g. via URL or reset)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const debounced = useDebouncedValue(inputValue, delayMs)

  // Commit debounced value back to external state only when it matches what the user
  // sees in the input. Otherwise a clear/reset leaves debounced stale for `delayMs` and
  // this effect would incorrectly push the old string back (e.g. Reset then search reappears).
  useEffect(() => {
    if (debounced !== inputValue) return
    if (debounced === value) return
    onDebouncedChange(debounced)
  }, [debounced, inputValue, value, onDebouncedChange])

  return {
    inputValue,
    setInputValue,
  }
}

