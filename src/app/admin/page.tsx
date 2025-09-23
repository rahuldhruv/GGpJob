
import { redirect } from 'next/navigation';

export default function AdminPage() {
    // Default redirect for admin, can be customized based on role
    redirect('/admin/dashboard');
}
