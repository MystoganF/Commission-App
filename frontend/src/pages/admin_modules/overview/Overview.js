import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Overview.module.css'

export default function Overview() {
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [bookings, setBookings] = useState([])
  const [works, setWorks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, bookingsRes, worksRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/bookings?limit=5'),
          api.get('/admin/portfolio?limit=3'),
        ])
        setStats(statsRes.data)
        setBookings(bookingsRes.data)
        setWorks(worksRes.data)
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className={styles.loading}>Loading…</div>
  if (error)   return <div className={shared.empty}><p className={shared.emptyText}>{error}</p></div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        {[
          { label: 'Portfolio Works',  value: stats.totalWorks,    sub: 'pieces published' },
          { label: 'Services Offered', value: stats.totalServices, sub: 'active listings' },
          { label: 'Total Bookings',   value: stats.totalBookings, sub: 'all time' },
          { label: 'Pending Requests', value: stats.pendingCount,  sub: 'awaiting response' },
        ].map(s => (
          <div className={styles.statCard} key={s.label}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value ?? 0}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className={styles.grid}>
        {/* Recent bookings */}
        <div className={shared.card}>
          <div className={shared.cardHeader}>
            <span className={shared.cardTitle}>Recent Bookings</span>
            <button
              className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
              onClick={() => navigate('/admin/bookings')}
            >
              View all
            </button>
          </div>
          <div className={styles.bookingList}>
            {bookings.length === 0 && (
              <div className={shared.empty}>
                <p className={shared.emptyText}>No bookings yet.</p>
              </div>
            )}
            {bookings.map(b => (
              <div className={styles.bookingRow} key={b.id}>
                <div>
                  <div className={styles.bookingClient}>{b.clientName}</div>
                  <div className={styles.bookingService}>{b.serviceName}</div>
                </div>
                <div className={styles.bookingRight}>
                  <span className={styles.bookingPrice}>{b.price}</span>
                  {/* Changed 'shared' to 'styles', and added the underscore replace trick! */}
                  <span className={`${styles.badge} ${styles[`badge${cap(b.status)}`]}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                    </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio snapshot */}
        <div className={shared.card}>
          <div className={shared.cardHeader}>
            <span className={shared.cardTitle}>Portfolio Snapshot</span>
            <button
              className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
              onClick={() => navigate('/admin/portfolio')}
            >
              Manage
            </button>
          </div>
          <div className={`${shared.cardBody} ${styles.snapshotList}`}>
            {works.length === 0 && (
              <div className={shared.empty}>
                <p className={shared.emptyText}>No works uploaded yet.</p>
              </div>
            )}
            {works.map(w => (
              <div className={styles.snapshotRow} key={w.id}>
                <div className={styles.snapshotThumb}>◻</div>
                <div>
                  <div className={styles.snapshotTitle}>{w.title}</div>
                  <div className={styles.snapshotMeta}>{w.category} · {w.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''
}