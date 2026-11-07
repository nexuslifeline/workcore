/**
 * Extracts the organization ID from request headers
 * Returns the organization ID string or null if header is missing
 * @param request - The request object
 * @returns Organization ID string or null
 */
export function extractOrganizationId(request: Request): string | null {
  const headersList = request.headers
  return headersList.get('x-organization-id') || headersList.get('X-Organization-Id')
}

