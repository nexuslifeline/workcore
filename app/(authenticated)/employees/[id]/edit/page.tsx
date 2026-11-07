import { redirect } from 'next/navigation'

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/employees?action=edit&id=${id}`)
}
