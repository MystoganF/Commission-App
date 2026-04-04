import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/admin/overview',   label: 'Overview',  icon: '◈' },
  { to: '/admin/portfolio',  label: 'Portfolio', icon: '◻' },
  { to: '/admin/services',   label: 'Services',  icon: '◇' },
  { to: '/admin/bookings',   label: 'Bookings',  icon: '◉' },
  { to: '/admin/profile',    label: 'Profile',   icon: '◎' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'A'

  return (
    <nav className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.top}>
        <div className={styles.brand}>Robb App</div>
        <div className={styles.mark}>Artist Studio</div>
      </div>

      {/* Navigation */}
      <ul className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User chip + logout */}
      <div className={styles.bottom}>
        <div className={styles.chip}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.info}>
            <div className={styles.email}>{user?.email ?? '—'}</div>
            <div className={styles.role}>Artist</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          ↩
        </button>
      </div>
    </nav>
  )
}