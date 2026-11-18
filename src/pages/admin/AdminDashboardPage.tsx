import { type FC } from 'react'
import { getCachedUser } from '@/lib/api'
import { AdminOverviewPage } from './AdminOverviewPage'
import { AdminOfficialDashboardPage } from './AdminOfficialDashboardPage'

export const AdminDashboardPage: FC = () => {
  const currentUser = getCachedUser()
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('ecobyte_user_role') : ''
  const isSuperAdmin = (currentUser?.role || storedRole || '').toUpperCase() === 'ADMIN'

  if (isSuperAdmin) {
    return <AdminOverviewPage />
  }

  return <AdminOfficialDashboardPage />
}
