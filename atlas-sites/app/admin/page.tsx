import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  // Redirect to lead board for now - dashboard will be built later
  redirect('/admin/leads');
}
