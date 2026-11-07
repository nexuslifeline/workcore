import { redirect } from 'next/navigation'

export default function NewEmployeePage() {
  redirect('/employees?action=new')
}
