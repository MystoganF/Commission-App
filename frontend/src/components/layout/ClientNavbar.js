import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import shared from '../../styles/shared.module.css';
import styles from './ClientNavbar.module.css';

export default function ClientNavbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // FIX: Removed the extra "/api" prefix
    api.get('/client/profile')
      .then(res => setUser(res.data))
      .catch(() => console.log("Guest mode"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.logo} onClick={() => navigate('/client/home')}>
            RobbApp <span className={styles.badge}>Client</span>
          </div>

          <div className={styles.links}>
            <NavLink to="/client/home" className={({isActive}) => isActive ? styles.active : ''}>Home</NavLink>
            <NavLink to="/client/explore" className={({isActive}) => isActive ? styles.active : ''}>Artists</NavLink>
            <NavLink to="/client/services" className={({isActive}) => isActive ? styles.active : ''}>Services</NavLink>
            <NavLink to="/client/my-bookings" className={({isActive}) => isActive ? styles.active : ''}>My Bookings</NavLink>
          </div>

          <div className={styles.account}>
            <div 
              className={styles.profileTrigger} 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img 
                src={user?.profilePictureUrl || 'https://via.placeholder.com/150'} 
                alt="" // Removed "Profile" alt text to prevent overlapping text if image fails
                className={styles.avatar}
              />
            </div>

            {showDropdown && (
              <div className={styles.dropdown} onMouseLeave={() => setShowDropdown(false)}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropName}>{user?.username || 'Client'}</p>
                  <p className={styles.dropRole}>Client</p>
                </div>
                <div className={styles.dropdownDivider} />
                <div className={styles.dropdownItem} onClick={() => { navigate('/client/profile'); setShowDropdown(false); }}>
                  My Profile
                </div>
                <div className={styles.dropdownDivider} />
                <div className={`${styles.dropdownItem} ${styles.logout}`} onClick={() => setShowLogoutModal(true)}>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Modal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        title="Confirm Logout"
      >
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