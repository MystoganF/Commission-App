import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './ClientNavbar.module.css';

export default function ClientNavbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => navigate('/client/home')}>
          RobbApp <span className={styles.badge}>Client</span>
        </div>

        {/* Navigation Links */}
        <div className={styles.links}>
          <NavLink to="/client/home" className={({isActive}) => isActive ? styles.active : ''}>Home</NavLink>
          <NavLink to="/client/explore" className={({isActive}) => isActive ? styles.active : ''}>Artists</NavLink>
          <NavLink to="/client/services" className={({isActive}) => isActive ? styles.active : ''}>Services</NavLink>
          <NavLink to="/client/my-bookings" className={({isActive}) => isActive ? styles.active : ''}>My Bookings</NavLink>
        </div>

        {/* Account Section */}
        <div className={styles.account}>
          <button 
            className={styles.accountBtn} 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Account ▾
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownItem} onClick={() => navigate('/client/profile')}>My Profile</div>
              <div className={styles.dropdownDivider} />
              <div className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}