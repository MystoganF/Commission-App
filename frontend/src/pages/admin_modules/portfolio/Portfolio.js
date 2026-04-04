import { useEffect, useRef, useState } from 'react'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Portfolio.module.css'

export default function Portfolio() {
  const [works, setWorks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast]       = useState('')
  const [error, setError]       = useState('')
  const fileRef = useRef()

  useEffect(() => { fetchWorks() }, [])

  async function fetchWorks() {
    try {
      const res = await api.get('/admin/portfolio')
      setWorks(res.data)
    } catch {
      setError('Failed to load portfolio.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    // Prompt user for title/category — kept simple; can be a modal later
    const title    = window.prompt('Work title?')    || file.name
    const category = window.prompt('Category?')      || 'Uncategorized'
    formData.append('title',    title)
    formData.append('category', category)
    formData.append('year',     new Date().getFullYear())

    setUploading(true)
    try {
      const res = await api.post('/admin/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setWorks(prev => [res.data, ...prev])
      showToast('Work uploaded.')
    } catch {
      showToast('Upload failed. Try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this work?')) return
    try {
      await api.delete(`/admin/portfolio/${id}`)
      setWorks(prev => prev.filter(w => w.id !== id))
      showToast('Work removed.')
    } catch {
      showToast('Delete failed.')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <p className={styles.count}>{works.length} work{works.length !== 1 ? 's' : ''}</p>
        <button
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <span className={shared.spinner} /> : '+ Upload Work'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Grid */}
      {works.length === 0 ? (
        <div className={shared.empty}>
          <div className={shared.emptyIcon}>◻</div>
          <p className={shared.emptyText}>
            No works yet.<br />Upload your first piece to get started.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {works.map(w => (
            <WorkCard key={w.id} work={w} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  )
}

function WorkCard({ work, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        {work.imageUrl
          ? <img src={work.imageUrl} alt={work.title} className={styles.img} />
          : <span className={styles.placeholder}>◻</span>
        }
      </div>
      <div className={styles.meta}>
        <div className={styles.title}>{work.title}</div>
        <div className={styles.tag}>{work.category} · {work.year}</div>
        <div className={styles.actions}>
          <button
            className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
            onClick={() => onDelete(work.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}