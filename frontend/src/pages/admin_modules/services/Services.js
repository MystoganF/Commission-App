import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Services.module.css'

const EMPTY_FORM = {
  name: '', price: '', turnaround: '', description: '', samples: '',
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)   // service object being edited
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')

  useEffect(() => { fetchServices() }, [])

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

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(s) {
    setEditing(s)
    setForm({
      name:        s.name,
      price:       s.price,
      turnaround:  s.turnaround,
      description: s.description,
      samples:     s.samples?.join(', ') ?? '',
    })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      samples: form.samples.split(',').map(s => s.trim()).filter(Boolean),
    }
    try {
      if (editing) {
        const res = await api.put(`/admin/services/${editing.id}`, payload)
        setServices(prev => prev.map(s => s.id === editing.id ? res.data : s))
        showToast('Service updated.')
      } else {
        const res = await api.post('/admin/services', payload)
        setServices(prev => [...prev, res.data])
        showToast('Service added.')
      }
      setShowForm(false)
    } catch {
      showToast('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this service?')) return
    try {
      await api.delete(`/admin/services/${id}`)
      setServices(prev => prev.filter(s => s.id !== id))
      showToast('Service deleted.')
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
        <p className={styles.count}>{services.length} service{services.length !== 1 ? 's' : ''}</p>
        {!showForm && (
          <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={openAdd}>
            + Add Service
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className={`${shared.card} ${styles.formCard}`}>
          <div className={shared.cardHeader}>
            <span className={shared.cardTitle}>{editing ? 'Edit Service' : 'New Service'}</span>
          </div>
          <form onSubmit={handleSave} className={`${shared.cardBody} ${styles.form}`} noValidate>
            <div className={styles.formRow}>
              <div className={shared.field}>
                <label className={shared.label}>Service name</label>
                <input
                  className={shared.input}
                  placeholder="e.g. Portrait Commission"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className={shared.field}>
                <label className={shared.label}>Price</label>
                <input
                  className={shared.input}
                  placeholder="e.g. ₱1,500"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className={shared.field}>
              <label className={shared.label}>Turnaround</label>
              <input
                className={shared.input}
                placeholder="e.g. 5–7 days"
                value={form.turnaround}
                onChange={e => setForm({...form, turnaround: e.target.value})}
              />
            </div>
            <div className={shared.field}>
              <label className={shared.label}>Description</label>
              <textarea
                className={`${shared.input} ${shared.textarea}`}
                placeholder="Describe what the client will receive…"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
            <div className={shared.field}>
              <label className={shared.label}>Sample types <em style={{textTransform:'none',letterSpacing:0,fontStyle:'italic'}}>(comma-separated)</em></label>
              <input
                className={shared.input}
                placeholder="e.g. Realistic, Semi-realistic, Chibi"
                value={form.samples}
                onChange={e => setForm({...form, samples: e.target.value})}
              />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`} disabled={saving}>
                {saving ? <span className={shared.spinner} /> : editing ? 'Save changes' : 'Add service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {services.length === 0 && !showForm ? (
        <div className={shared.empty}>
          <div className={shared.emptyIcon}>◇</div>
          <p className={shared.emptyText}>No services yet.<br />Add one to start accepting bookings.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {services.map(s => (
            <ServiceCard key={s.id} service={s} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  )
}

function ServiceCard({ service, onEdit, onDelete }) {
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceHeader}>
        <div className={styles.serviceMeta}>
          <div className={styles.serviceName}>{service.name}</div>
          <div className={styles.serviceDetails}>
            <span className={styles.price}>{service.price}</span>
            {service.turnaround && (
              <span className={styles.turnaround}>Turnaround: {service.turnaround}</span>
            )}
          </div>
          {service.description && (
            <p className={styles.description}>{service.description}</p>
          )}
        </div>
        <div className={styles.serviceActions}>
          <button
            className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
            onClick={() => onEdit(service)}
          >
            Edit
          </button>
          <button
            className={`${shared.btn} ${shared.btnDanger} ${shared.btnSm}`}
            onClick={() => onDelete(service.id)}
          >
            Delete
          </button>
        </div>
      </div>
      {service.samples?.length > 0 && (
        <div className={styles.serviceBody}>
          <div className={styles.samplesLabel}>Sample types</div>
          <div className={styles.tags}>
            {service.samples.map(t => (
              <span className={styles.tag} key={t}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}