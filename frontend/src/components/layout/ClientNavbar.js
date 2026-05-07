import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import NotificationDropdown from '../notifications/NotificationDropdown';
import styles from './ClientNavbar.module.css';
import logoImg from '../../assets/logo.png';

const NAV_ITEMS = [
  { to: '/client/home',       label: 'Home',       icon: '◈' },
  { to: '/client/explore',    label: 'Artists',    icon: '◻' },
  { to: '/client/services',   label: 'Services',   icon: '◇' },
  { to: '/client/my-bookings',label: 'Bookings',   icon: '◉' },
];

export default function ClientNavbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/client/profile')
      .then(res => setUser(res.data))
      .catch(() => console.log("Guest mode"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? 'C';

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>

          {/* Brand */}
          <div className={styles.brand} onClick={() => navigate('/client/home')}>
  <img src={logoImg} alt="CRTV ZONE" className={styles.brandLogo} />

</div>

          {/* Nav Links */}
          <ul className={styles.nav}>
            {NAV_ITEMS.map((item, idx) => (
              <li key={idx}>
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

          {/* Right side */}
          <div className={styles.right}>
            <NotificationDropdown alignMenu="right" />

            <div className={styles.chip} onClick={() => setShowDropdown(!showDropdown)}>
              <div className={styles.avatar}>
                {user?.profilePictureUrl
                  ? <img src={user.profilePictureUrl} alt="" className={styles.avatarImg} />
                  : initial}
              </div>
              <div className={styles.info}>
                <div className={styles.username}>{user?.username ?? 'Client'}</div>
                <div className={styles.role}>Client</div>
              </div>
            </div>

            {showDropdown && (
              <div className={styles.dropdown} onMouseLeave={() => setShowDropdown(false)}>
                <div className={styles.dropdownItem}
                  onClick={() => { navigate('/client/profile'); setShowDropdown(false); }}>
                  <span className={styles.icon}>◎</span> My Profile
                </div>
                <div className={styles.dropdownDivider} />
                <div
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => { setShowDropdown(false); setShowLogoutModal(true); }}>
                  <span className={styles.icon}>↩</span> Log Out
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout">
        <div className={styles.modalContent}>
          <p>Are you sure you want to sign out of your account?</p>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>No</button>
            <button className={styles.confirmBtn} onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </Modal>
    </>
  );
}