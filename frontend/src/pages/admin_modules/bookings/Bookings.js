import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Bookings.module.css'

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'DECLINED', 'COMPLETED']

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [toast, setToast]       = useState('')

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    try {
      const res = await api.get('/admin/bookings')
      setBookings(res.data)
    } catch {
      showToast('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await api.patch(`/admin/bookings/${id}/status`, { status })
      setBookings(prev => prev.map(b => b.id === id ? res.data : b))
      showToast(`Booking marked as ${status.toLowerCase()}.`)
    } catch {
      showToast('Update failed.')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const visible = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter)

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      {/* Filter tabs */}
      <div className={styles.filters}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== 'ALL' && (
              <span className={styles.filterCount}>
                {bookings.filter(b => b.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className={shared.empty}>
          <div className={shared.emptyIcon}>◉</div>
          <p className={shared.emptyText}>No bookings here yet.</p>
        </div>
      ) : (
        <div className={`${shared.card} ${styles.tableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(b => (
                <BookingRow key={b.id} booking={b} onUpdate={updateStatus} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  )
}

function BookingRow({ booking: b, onUpdate }) {
  const statusClass = {
    PENDING:   shared.badgePending,
    APPROVED:  shared.badgeApproved,
    DECLINED:  shared.badgeDeclined,
    COMPLETED: shared.badgeCompleted,
  }[b.status] ?? shared.badgePending

  return (
    <tr>
      <td>
        <div className={styles.clientName}>{b.clientName}</div>
        <div className={styles.clientEmail}>{b.clientEmail}</div>
      </td>
      <td>{b.serviceName}</td>
      <td className={styles.dateCell}>{formatDate(b.createdAt)}</td>
      <td className={styles.priceCell}>{b.price}</td>
      <td>
        <span className={`${shared.badge} ${statusClass}`}>{cap(b.status)}</span>
      </td>
      <td>
        <div className={styles.rowActions}>
          {b.status === 'PENDING' && (
            <>
              <button
                className={`${shared.btn} ${shared.btnPrimary} ${shared.btnSm}`}
                onClick={() => onUpdate(b.id, 'APPROVED')}
              >
                Approve
              </button>
              <button
                className={`${shared.btn} ${shared.btnDanger} ${shared.btnSm}`}
                onClick={() => onUpdate(b.id, 'DECLINED')}
              >
                Decline
              </button>
            </>
          )}
          {b.status === 'APPROVED' && (
            <button
              className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
              onClick={() => onUpdate(b.id, 'COMPLETED')}
            >
              Complete
            </button>
          )}
          {(b.status === 'DECLINED' || b.status === 'COMPLETED') && (
            <span className={styles.noAction}>—</span>
          )}
        </div>
      </td>
    </tr>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function cap(str) {
  return str ? str.charAt(0) + str.slice(1).toLowerCase() : ''
}