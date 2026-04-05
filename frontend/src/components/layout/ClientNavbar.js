import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import NotificationDropdown from '../notifications/NotificationDropdown';
import styles from './ClientNavbar.module.css';

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

          {/* Account wrapper includes Bell and Avatar side-by-side */}
         
          <div className={styles.account}>
            
             <NotificationDropdown />
            <div className={styles.profileTrigger} onClick={() => setShowDropdown(!showDropdown)}>
              <img 
                src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.username || 'Client'}&background=c9b99a&color=fff`} 
                alt="" 
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