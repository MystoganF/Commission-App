import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { FaBell } from 'react-icons/fa';
import styles from './Notification.module.css';

export default function NotificationDropdown({ alignMenu = 'right' }) {
  const [notifs, setNotifs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Allows us to detect page changes

  const fetchNotifs = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return; 

    api.get('/notifications')
      .then(res => setNotifs(res.data))
      .catch(err => console.error("Notification fetch failed", err));
  }, []);

  useEffect(() => {
    // 1. Fetch immediately on load
    fetchNotifs();

    // 2. SHORT POLLING: Fetch every 5 seconds (instead of 60) for near real-time updates
    const interval = setInterval(fetchNotifs, 5000);

    // 3. Fetch immediately when the user switches back to this browser tab
    const handleFocus = () => fetchNotifs();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifs]);

  // 4. Fetch immediately if the user navigates to a new page within the app
  useEffect(() => {
    fetchNotifs();
  }, [location.pathname, fetchNotifs]);

  const handleAction = async (n) => {
    if (n.read === false) {
      try {
        // Optimistically update UI so the badge disappears instantly
        setNotifs(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
        await api.patch(`/notifications/${n.id}/read`);
      } catch (err) {
        console.error("Could not mark as read", err);
      }
    }
    setIsOpen(false);
    navigate(n.link); 
  };

  const unreadCount = notifs.filter(n => n.read === false).length;

  return (
    <div className={styles.container}>
      <div className={styles.bellWrapper} onClick={() => setIsOpen(!isOpen)}>
        <FaBell size={20} className={unreadCount > 0 ? styles.activeBell : ''} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </div>

      {isOpen && (
        <div 
          className={`${styles.dropdown} ${alignMenu === 'left' ? styles.alignLeft : styles.alignRight}`} 
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className={styles.header}>
            <span>Notifications</span>
            {unreadCount > 0 && <span className={styles.unreadCount}>{unreadCount} New</span>}
          </div>
          
          <div className={styles.list}>
            {notifs.length > 0 ? (
              notifs.map(n => (
                <div 
                  key={n.id} 
                  className={`${styles.item} ${n.read === false ? styles.unread : ''}`} 
                  onClick={() => handleAction(n)}
                >
                  <p className={styles.msg}>{n.message}</p>
                  <small className={styles.time}>
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                <p>No alerts yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}