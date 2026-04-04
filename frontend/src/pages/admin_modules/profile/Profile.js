import { useEffect, useState, useRef } from 'react'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Profile.module.css'

const SOCIALS = [
  { name: 'facebook',  prefix: 'fb.com/',  placeholder: 'yourpage' },
  { name: 'instagram', prefix: '@',        placeholder: 'instagram' },
  { name: 'twitter',   prefix: '@',        placeholder: 'twitter / x' },
]

export default function Profile() {
  const [form, setForm]       = useState({
    username: '', phoneNumber: '', bio: '',
    facebook: '', instagram: '', twitter: '',
    profilePictureUrl: '' // <-- Added for preview
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false) // <-- New state
  const [toast, setToast]     = useState('')
  const [error, setError]     = useState('')
  
  const fileInputRef = useRef(null) // <-- Ref for the hidden file input

  useEffect(() => {
    fetchProfile()
  }, [])

  function fetchProfile() {
    api.get('/admin/profile')
      .then(res => setForm({
        username:    res.data.username    ?? '',
        phoneNumber: res.data.phoneNumber ?? '',
        bio:         res.data.bio         ?? '',
        facebook:    res.data.facebook    ?? '',
        instagram:   res.data.instagram   ?? '',
        twitter:     res.data.twitter     ?? '',
        profilePictureUrl: res.data.profilePictureUrl ?? '' // <-- Load picture URL
      }))
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put('/admin/profile', form)
      showToast('Changes saved.')
    } catch {
      setError('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  // --- NEW: Handle Profile Picture Upload ---
  async function handlePictureUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPic(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/admin/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Update the form state with the new URL returned from the server
      setForm(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }))
      showToast('Profile picture updated!')
    } catch {
      showToast('Failed to upload picture.')
    } finally {
      setUploadingPic(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      
      {/* --- NEW: Profile Picture Section --- */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          {form.profilePictureUrl ? (
            <img src={form.profilePictureUrl} alt="Profile" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {form.username ? form.username.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          
          <button 
            type="button" 
            className={styles.avatarEditBtn} 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPic}
          >
            {uploadingPic ? '...' : '✎'}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handlePictureUpload} 
          />
        </div>
        <div className={styles.avatarText}>
          <h3>Profile Picture</h3>
          <p>Click the icon to upload a new picture (Max 10MB)</p>
        </div>
      </div>

      <form onSubmit={handleSave} className={styles.form} noValidate>
        {/* Account info */}
        <div className={shared.card}>
          <div className={shared.cardHeader}>
            <span className={shared.cardTitle}>Account Info</span>
          </div>
          <div className={`${shared.cardBody} ${styles.grid}`}>
            <div className={shared.field}>
              <label className={shared.label}>Username</label>
              <input
                className={shared.input}
                name="username"
                placeholder="yourname"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            <div className={shared.field}>
              <label className={shared.label}>Phone number</label>
              <input
                className={shared.input}
                name="phoneNumber"
                placeholder="+63 9xx xxx xxxx"
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className={`${shared.field} ${styles.fullWidth}`}>
              <label className={shared.label}>Bio</label>
              <textarea
                className={`${shared.input} ${shared.textarea}`}
                name="bio"
                placeholder="Tell clients about yourself and your work…"
                value={form.bio}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className={shared.card}>
          <div className={shared.cardHeader}>
            <span className={shared.cardTitle}>Social Links</span>
          </div>
          <div className={`${shared.cardBody} ${styles.grid}`}>
            {SOCIALS.map(s => (
              <div className={shared.field} key={s.name}>
                <label className={shared.label}>
                  {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
                </label>
                <div className={styles.socialField}>
                  <span className={styles.socialPrefix}>{s.prefix}</span>
                  <input
                    className={styles.socialInput}
                    name={s.name}
                    placeholder={s.placeholder}
                    value={form[s.name]}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.saveRow}>
          <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`} disabled={saving}>
            {saving ? <span className={shared.spinner} /> : 'Save changes'}
          </button>
        </div>
      </form>

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  )
}