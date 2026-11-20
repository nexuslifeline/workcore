import { redirect } from 'next/navigation'

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/vehicles?action=edit&id=${id}`)
}
