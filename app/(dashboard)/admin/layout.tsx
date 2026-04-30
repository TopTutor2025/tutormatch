import AdminDashboardLayout from '@/components/admin/DashboardLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}
