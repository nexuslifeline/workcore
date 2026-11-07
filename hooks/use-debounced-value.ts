import { useEffect, useRef, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = null
    }
  }, [value, delayMs])

  return debouncedValue
}

