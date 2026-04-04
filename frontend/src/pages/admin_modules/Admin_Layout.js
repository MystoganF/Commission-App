import { Outlet, useLocation, Navigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import { useAuth } from '../../hooks/useAuth'
import styles from './AdminLayout.module.css'

const PAGE_TITLES = {
  '/admin/overview':  'Dashboard',
  '/admin/portfolio': 'My Portfolio',
  '/admin/services':  'My Services',
  '/admin/bookings':  'Bookings',
  '/admin/profile':   'Profile',
}

export default function AdminLayout() {
  const { isAdmin, isExpired } = useAuth()
  const location = useLocation()

  // Role guard — redirect non-admins
  if (isExpired || !isAdmin) {
    return <Navigate to="/" replace />
  }

  const title = PAGE_TITLES[location.pathname] ?? 'Admin'

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.body}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{title}</h1>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}