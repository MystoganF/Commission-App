import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Services.module.css'
import Modal from '../../../components/ui/Modal'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Edit Form States
  const [editForm, setEditForm] = useState({ name: '', price: '', turnaround: '', description: '' })
  const [availableSkills, setAvailableSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [existingSamples, setExistingSamples] = useState([]) 
  const [newFiles, setNewFiles] = useState([]) 

  // Modal States
  const [selectedImage, setSelectedImage] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchData() {
    try {
      const [serviceRes, skillsRes] = await Promise.all([
        api.get(`/admin/services/${id}`),
        api.get('/admin/skills')
      ])
      const s = serviceRes.data
      setService(s)
      setAvailableSkills(skillsRes.data)
      
      // Sync form states with fetched data
      setEditForm({ name: s.name, price: s.price, turnaround: s.turnaround, description: s.description })
      setSelectedSkills(s.skills || [])
      setExistingSamples(s.samples || [])
    } catch {
      showToast('Failed to load service.')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleToggleEdit = () => {
    if (isEditing) {
      // Reset form to original service data if canceling
      setEditForm({ name: service.name, price: service.price, turnaround: service.turnaround, description: service.description })
      setSelectedSkills(service.skills || [])
      setExistingSamples(service.samples || [])
      setNewFiles([])
    }
    setIsEditing(!isEditing)
  }

  const handleFileSelect = (e) => setNewFiles(prev => [...prev, ...Array.from(e.target.files)])
  const removeExistingSample = (url) => setExistingSamples(prev => prev.filter(item => item !== url))
  const removeNewFile = (index) => setNewFiles(prev => prev.filter((_, i) => i !== index))

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    )
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const uploadedUrls = []
      for (const file of newFiles) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await api.post('/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        uploadedUrls.push(uploadRes.data.url)
      }

      const res = await api.put(`/admin/services/${id}`, {
        ...editForm,
        samples: [...existingSamples, ...uploadedUrls],
        skills: selectedSkills
      })
      
      setService(res.data)
      setIsEditing(false)
      setNewFiles([])
      showToast('Service updated successfully!')
    } catch {
      showToast('Update failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageClick = (url) => { setSelectedImage(url); setIsImageModalOpen(true); }
  
  const executeDelete = async () => {
    try { 
      await api.delete(`/admin/services/${id}`); 
      // REQUIREMENT: Pass success message to the list page state
      navigate('/admin/services', { 
        state: { toastMsg: 'Service removed successfully.' } 
      }); 
    } catch { 
      showToast("Failed to delete."); 
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>
  if (!service) return <div className={styles.loading}>Service not found.</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <div className={styles.toolbar}>
        <button className={styles.backBtn} onClick={() => navigate('/admin/services')}>← Back to Services</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing ? (
            <>
              <button className={`${shared.btn} ${shared.btnGhost}`} onClick={handleToggleEdit}>✎ Edit Details</button>
              <button className={`${shared.btn} ${shared.btnGhost}`} style={{color: '#e74c3c'}} onClick={() => setIsDeleteModalOpen(true)}>Delete</button>
            </>
          ) : (
            <button className={`${shared.btn} ${shared.btnGhost}`} onClick={handleToggleEdit}>Cancel Edit</button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* ── EDIT VIEW ── */
        <div className={`${shared.card} ${styles.formWrapper}`}>
          <form onSubmit={handleUpdate} className={styles.form}>
            <div className={styles.formRow}>
              <div className={shared.field}>
                <label className={shared.label}>Service name</label>
                <input required className={shared.input} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className={shared.field}>
                <label className={shared.label}>Price (PHP)</label>
                <div className={styles.priceInputWrapper}>
                  <span className={styles.currencySymbol}>₱</span>
                  <input required type="number" className={styles.priceInput} value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                </div>
              </div>
            </div>

            <div className={shared.field}>
              <label className={shared.label}>Turnaround Time</label>
              <input required className={shared.input} value={editForm.turnaround} onChange={e => setEditForm({...editForm, turnaround: e.target.value})} />
            </div>

            <div className={shared.field}>
              <label className={shared.label}>Description</label>
              <textarea required className={`${shared.input} ${shared.textarea}`} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>

            <div className={shared.field}>
              <label className={shared.label}>
                Related Skills 
                <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px', textTransform: 'none' }}>
                  (Pulled from your Portfolio skills)
                </span>
              </label>
              <div className={styles.skillSelector}>
                {availableSkills.map(skill => (
                  <div 
                    key={skill.id} 
                    className={`${styles.skillPill} ${selectedSkills.includes(skill.name) ? styles.skillActive : ''}`} 
                    onClick={() => toggleSkill(skill.name)}
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.field}>
              <label className={shared.label}>Gallery (Sample Images)</label>
              <input type="file" multiple accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
              <div className={styles.imageGrid}>
                {existingSamples.map((url, idx) => (
                  <div key={idx} className={styles.imagePreview}>
                    <img src={url} alt="existing" />
                    <button type="button" className={styles.removeImgBtn} onClick={() => removeExistingSample(url)}>&times;</button>
                  </div>
                ))}
                {newFiles.map((file, idx) => (
                  <div key={idx} className={styles.imagePreview} style={{ border: '2px solid var(--accent)' }}>
                    <img src={URL.createObjectURL(file)} alt="new" />
                    <button type="button" className={styles.removeImgBtn} onClick={() => removeNewFile(idx)}>&times;</button>
                  </div>
                ))}
                <div className={styles.addImageBox} onClick={() => fileInputRef.current?.click()}>+ Add Images</div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── DISPLAY VIEW ── */
        <>
          <div className={styles.detailHeader}>
            <h1 className={styles.detailTitle}>{service.name}</h1>
            <div className={styles.detailMeta}>
              <span className={styles.detailPrice}>₱ {Number(service.price).toLocaleString()}</span>
              <span className={styles.detailTurnaround}>• {service.turnaround}</span>
            </div>
          </div>

          <div className={styles.detailBody}>
            <div className={styles.detailMain}>
              <div className={styles.section}>
                <h3>Description</h3>
                <p className={styles.itemDesc}>{service.description}</p>
              </div>

              <div className={styles.section}>
                <h3>Included Skills</h3>
                <div className={styles.skillSelector}>
                  {service.skills?.length > 0 ? service.skills.map(s => (
                    <span key={s} className={`${styles.skillPill} ${styles.skillActive}`}>{s}</span>
                  )) : <span style={{color: '#888'}}>No skills associated.</span>}
                </div>
              </div>

              <div className={styles.section}>
                <h3>Sample Services</h3>
                <div className={styles.gallery}>
                  {service.samples?.length > 0 ? service.samples.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt="Sample" 
                      className={styles.galleryImg} 
                      onClick={() => handleImageClick(url)} 
                    />
                  )) : <span style={{color: '#888'}}>No samples uploaded.</span>}
                </div>
              </div>

              <div className={styles.section} style={{marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333'}}>
                <h3>Recent Requests</h3>
                <p style={{color: '#888', fontStyle: 'italic'}}>Feature coming soon: View clients who requested this specific service here.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SUCCESS TOAST */}
      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}

      {/* IMAGE ZOOM MODAL */}
      <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} title="Sample View">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={selectedImage} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <p style={{ color: '#fff', marginBottom: '24px', lineHeight: '1.5' }}>
            Are you sure you want to delete <strong>{service.name}</strong>?<br />
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className={shared.btn} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className={shared.btn} style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none' }} onClick={executeDelete}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}