/**
 * Type for navigation function used in table components
 * to update URL search parameters
 */
export type NavigateFn = (args: {
  search:
    | Record<string, unknown>
    | ((current: Record<string, unknown>) => Record<string, unknown>)
  replace?: boolean
}) => void
