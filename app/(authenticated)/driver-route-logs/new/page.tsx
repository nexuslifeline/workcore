import { redirect } from 'next/navigation'

export default function NewDriverRouteLogPage() {
  redirect('/driver-route-logs?action=new')
}
