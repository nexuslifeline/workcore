import { redirect } from 'next/navigation'

export default async function EditDriverRouteLogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/driver-route-logs?action=edit&id=${id}`)
}
