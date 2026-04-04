import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Services.module.css'

export default function AddService() {
  const navigate = useNavigate()
  const fileInputRef = useRef()
  
  const [form, setForm] = useState({ name: '', price: '', turnaround: '', description: '' })
  const [selectedFiles, setSelectedFiles] = useState([]) 
  const [availableSkills, setAvailableSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('') // TOAST STATE

  useEffect(() => {
    api.get('/admin/skills').then(res => setAvailableSkills(res.data)).catch(console.error)
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleFileSelect(e) {
    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)])
  }

  function toggleSkill(skillName) {
    setSelectedSkills(prev => 
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    )
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const uploadedUrls = []
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await api.post('/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        uploadedUrls.push(uploadRes.data.url)
      }

      await api.post('/admin/services', { ...form, samples: uploadedUrls, skills: selectedSkills })
      showToast('Service created successfully!') // SUCCESS TOAST
      setTimeout(() => navigate('/admin/services'), 1000) // Redirect slightly after toast
    } catch {
      showToast('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <div className={styles.toolbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={{color: '#fff', margin: 0}}>Create New Service</h2>
      </div>

      <div className={`${shared.card} ${styles.formWrapper}`}>
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formRow}>
            <div className={shared.field}>
              <label className={shared.label}>Service name</label>
              <input required className={shared.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className={shared.field}>
              <label className={shared.label}>Price (PHP)</label>
              <div className={styles.priceInputWrapper}>
                <span className={styles.currencySymbol}>₱</span>
                <input required type="number" className={styles.priceInput} value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
            </div>
          </div>

          <div className={shared.field}>
            <label className={shared.label}>Turnaround Time</label>
            <input required className={shared.input} value={form.turnaround} onChange={e => setForm({...form, turnaround: e.target.value})} />
          </div>

          <div className={shared.field}>
            <label className={shared.label}>Description</label>
            <textarea required className={`${shared.input} ${shared.textarea}`} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          {/* REQUIREMENT: Detailed Skills Label */}
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
            <label className={shared.label}>Sample Images</label>
            <input type="file" multiple accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
            <div className={styles.imageGrid}>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className={styles.imagePreview}>
                  <img src={URL.createObjectURL(file)} alt="preview" />
                  <button type="button" className={styles.removeImgBtn} onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}>&times;</button>
                </div>
              ))}
              <div className={styles.addImageBox} onClick={() => fileInputRef.current?.click()}>+ Add Images</div>
            </div>
          </div>

          <div className={styles.formActions}>
             <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`} disabled={saving}>{saving ? 'Saving...' : 'Publish Service'}</button>
          </div>
        </form>
      </div>

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  )
}