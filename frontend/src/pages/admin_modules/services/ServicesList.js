import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // 1. Added useLocation
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Services.module.css'

export default function ServicesList() {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState('')
  
  const navigate = useNavigate()
  const location = useLocation() // 2. Initialize location to check for "thrown" messages

  useEffect(() => {
    fetchServices()

    // 3. Check if we just arrived here from a Delete or Add action
    if (location.state?.toastMsg) {
      showToast(location.state.toastMsg)
      
      // 4. Clean up the state so the message doesn't reappear on refresh
      window.history.replaceState({}, document.title)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  async function fetchServices() {
    try {
      const res = await api.get('/admin/services')
      setServices(res.data)
    } catch {
      showToast('Failed to load services.')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <div className={styles.toolbar}>
        <div>
          <h2 style={{color: '#fff', margin: '0 0 5px 0'}}>Your Services</h2>
          <p style={{color: 'var(--muted)', fontSize: '13px', margin: 0}}>
            Clients will see these services featured on your public portfolio.
          </p>
        </div>
        <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => navigate('/admin/services/new')}>
          + Create Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className={shared.empty}>
          <div className={shared.emptyIcon}>◇</div>
          <p className={shared.emptyText}>No services yet.<br />Add one to start accepting bookings.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {services.map(s => (
            <div key={s.id} className={styles.serviceCard} onClick={() => navigate(`/admin/services/${s.id}`)}>
              <div className={styles.cardCover}>
                {s.samples && s.samples.length > 0 ? (
                  <img src={s.samples[0]} alt={s.name} />
                ) : (
                  <div className={styles.noImage}>No Sample</div>
                )}
              </div>
              <div className={styles.cardMeta}>
                <h3 className={styles.serviceName}>{s.name}</h3>
                <div className={styles.serviceDetails}>
                  <span className={styles.price}>₱ {Number(s.price).toLocaleString()}</span>
                  {s.turnaround && <span className={styles.turnaround}>• {s.turnaround}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. The Toast UI Element */}
      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  )
}