import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import shared from '../../../styles/shared.module.css'
import styles from './Portfolio.module.css'
import Modal from '../../../components/ui/Modal'

const ART_STYLES = [
  "Cubism", "Digital Art", "Fine Art", "Graphite", "Impressionism", "Oil Painting", "Photography", "Sculpture", "Street Art", "Surrealism", "Water Color"
];

export default function Portfolio() {
  const [data, setData] = useState({ profile: null, works: [], skills: [], experiences: [], education: [], achievements: [] })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Modal States
  const [activeModal, setActiveModal] = useState(null) 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null })

  const [selectedWork, setSelectedWork] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({})
  
  const [newWork, setNewWork] = useState({ 
    title: '', description: '', categoryOption: ART_STYLES[0], customCategory: '', year: new Date().getFullYear(), file: null 
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [profRes, worksRes, skillsRes, expRes, eduRes, achRes] = await Promise.all([
        api.get('/admin/profile'), api.get('/admin/portfolio'), api.get('/admin/skills'),
        api.get('/admin/experiences'), api.get('/admin/education'), api.get('/admin/achievements')
      ])
      setData({ profile: profRes.data, works: worksRes.data, skills: skillsRes.data, experiences: expRes.data, education: eduRes.data, achievements: achRes.data })
    } catch { showToast('Failed to load portfolio data.') } finally { setLoading(false) }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function openModal(type) {
    if (type === 'profile') setFormData(data.profile || {})
    else setFormData({})
    setActiveModal(type)
  }
  function closeModal() { setActiveModal(null) }

  function openUploadModal() {
    setNewWork({ title: '', description: '', categoryOption: ART_STYLES[0], customCategory: '', year: new Date().getFullYear(), file: null })
    setIsUploadModalOpen(true)
  }

  function handleCardClick(work) {
    setSelectedWork(work)
    setIsViewModalOpen(true)
  }

  function openEditModal() {
    const isStandardStyle = ART_STYLES.includes(selectedWork.category);
    setNewWork({
      ...selectedWork,
      categoryOption: isStandardStyle ? selectedWork.category : 'Other...',
      customCategory: isStandardStyle ? '' : selectedWork.category,
      file: null 
    });
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  }

  // --- Submissions ---
  async function handleUpdateProfile(e) { e.preventDefault(); try { const res = await api.put('/admin/profile', formData); setData(prev => ({ ...prev, profile: res.data })); closeModal(); showToast('Profile updated.'); } catch { showToast('Error updating profile.'); } }
  async function handleAddSkill(e) { e.preventDefault(); try { const res = await api.post('/admin/skills', formData); setData(prev => ({ ...prev, skills: [...prev.skills, res.data] })); closeModal(); showToast('Skill added.'); } catch { showToast('Error adding skill.'); } }
  async function handleAddExperience(e) { e.preventDefault(); try { const res = await api.post('/admin/experiences', formData); setData(prev => ({ ...prev, experiences: [res.data, ...prev.experiences] })); closeModal(); showToast('Experience added.'); } catch { showToast('Error adding experience.'); } }

  async function handleSubmitUpload(e) {
    e.preventDefault()
    if (!newWork.file) { showToast('Image is mandatory!'); return; }
    const finalCategory = newWork.categoryOption === 'Other...' ? (newWork.customCategory || 'Uncategorized') : newWork.categoryOption;

    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('title', newWork.title || newWork.file.name)
      uploadData.append('description', newWork.description || '') 
      uploadData.append('category', finalCategory)
      uploadData.append('year', newWork.year.toString())
      uploadData.append('file', newWork.file)

      const res = await api.post('/admin/portfolio', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setData(prev => ({ ...prev, works: [res.data, ...prev.works] }))
      showToast('Work uploaded successfully.')
      setIsUploadModalOpen(false)
    } catch { showToast('Upload failed.') } finally { setUploading(false) }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    const finalCategory = newWork.categoryOption === 'Other...' ? (newWork.customCategory || 'Uncategorized') : newWork.categoryOption;

    setUploading(true);
    try {
      const res = await api.put(`/admin/portfolio/${selectedWork.id}`, {
        title: newWork.title,
        description: newWork.description,
        category: finalCategory,
        year: newWork.year.toString()
      });

      setData(prev => ({ ...prev, works: prev.works.map(w => w.id === selectedWork.id ? res.data : w) }));
      setSelectedWork(res.data); 
      showToast('Work updated successfully.');
      setIsEditModalOpen(false);
      setIsViewModalOpen(true); 
    } catch { showToast('Update failed.'); } finally { setUploading(false); }
  }

  function requestDelete(type, id) { setConfirmDialog({ isOpen: true, type, id }) }

  async function executeDelete() {
    const { type, id } = confirmDialog
    setConfirmDialog({ isOpen: false, type: '', id: null })
    try {
      await api.delete(`/admin/${type}/${id}`)
      const stateKey = type === 'portfolio' ? 'works' : type;
      setData(prev => ({ ...prev, [stateKey]: prev[stateKey].filter(item => item.id !== id) }))
      showToast('Item removed.')
      if (type === 'portfolio' && selectedWork?.id === id) setIsViewModalOpen(false)
    } catch { showToast('Failed to delete.') }
  }

  if (loading) return <div className={styles.loading}>Loading Profile...</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <div className={styles.header}><h2>Professional Portfolio</h2></div>

      <div className={styles.layout}>
        <div className={styles.mainFeed}>
          
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>About Me</h3>
              <button className={styles.addTextBtn} onClick={() => openModal('profile')}>✎ Edit</button>
            </div>
            <p className={styles.itemDesc}>{data.profile?.bio || "No bio added yet."}</p>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Experience</h3>
              <button className={styles.addTextBtn} onClick={() => openModal('experience')}>+ Add</button>
            </div>
            <div className={styles.listContainer}>
              {data.experiences.length === 0 && <p className={shared.emptyText}>No experience added.</p>}
              {data.experiences.map(exp => (
                <div key={exp.id} className={styles.listItem}>
                  <div className={styles.itemMain}>
                    <h4 className={styles.itemTitle}>{exp.title}</h4>
                    <p className={styles.itemSubtitle}>{exp.company}</p>
                    <p className={styles.itemDates}>{exp.startDate} – {exp.endDate || 'Present'}</p>
                    <p className={styles.itemDesc}>{exp.description}</p>
                  </div>
                  <button className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`} onClick={() => requestDelete('experiences', exp.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Skills</h3>
              <button className={styles.addTextBtn} onClick={() => openModal('skill')}>+ Add</button>
            </div>
            {data.skills.length === 0 && <p className={shared.emptyText}>No skills added.</p>}
            <div className={styles.skillGrid}>
              {data.skills.map(skill => (
                <div key={skill.id} className={styles.skillTag}>
                  {skill.name}
                  <span className={styles.skillDelete} onClick={() => requestDelete('skills', skill.id)}>&times;</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Featured Works</h3>
              <button className={styles.addTextBtn} onClick={openUploadModal}>+ Add Work</button>
            </div>
            {data.works.length === 0 && <p className={shared.emptyText}>No works uploaded yet.</p>}
            <div className={styles.grid}>
              {data.works.map(w => (
                <WorkCard key={w.id} work={w} onCardClick={handleCardClick} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Contact Info</h3>
              <button className={styles.addTextBtn} onClick={() => openModal('profile')}>✎ Edit</button>
            </div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Name</p><p className={styles.contactValue}>{data.profile?.username || '—'}</p></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Phone</p><p className={styles.contactValue}>{data.profile?.phoneNumber || '—'}</p></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Social Links</p><p className={styles.contactValue}>{data.profile?.facebook || '—'}</p><p className={styles.contactValue}>{data.profile?.instagram || '—'}</p></div>
          </div>
        </div>
      </div>

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}

      {/* ── PROFILE MODAL ── */}
      <Modal isOpen={activeModal === 'profile'} onClose={closeModal} title="Edit Profile & Contact">
        <form onSubmit={handleUpdateProfile}>
          <div className={styles.formGroup}><label className={styles.label}>Display Name</label><input className={styles.input} value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Bio / About Me</label><textarea className={styles.textarea} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Phone Number</label><input className={styles.input} value={formData.phoneNumber || ''} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Facebook Link</label><input className={styles.input} value={formData.facebook || ''} onChange={e => setFormData({ ...formData, facebook: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Instagram Link</label><input className={styles.input} value={formData.instagram || ''} onChange={e => setFormData({ ...formData, instagram: e.target.value })} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button><button type="submit" className={`${shared.btn} ${shared.btnPrimary}`}>Save Changes</button></div>
        </form>
      </Modal>

      {/* ── SKILL MODAL ── */}
      <Modal isOpen={activeModal === 'skill'} onClose={closeModal} title="Add Skill">
        <form onSubmit={handleAddSkill}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Skill Name</label>
            <input required className={styles.input} placeholder="e.g. Acrylic Painting, Cubism" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button>
            <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`}>Save Skill</button>
          </div>
        </form>
      </Modal>

      {/* ── EXPERIENCE MODAL ── */}
      <Modal isOpen={activeModal === 'experience'} onClose={closeModal} title="Add Experience">
        <form onSubmit={handleAddExperience}>
          <div className={styles.formGroup}><label className={styles.label}>Job Title</label><input required className={styles.input} value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Company / Client</label><input required className={styles.input} value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Start Date</label><input required className={styles.input} placeholder="e.g. Jan 2022" value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} /></div>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>End Date</label><input className={styles.input} placeholder="e.g. Present" value={formData.endDate || ''} onChange={e => setFormData({ ...formData, endDate: e.target.value })} /></div>
          </div>
          <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className={styles.formActions}>
            <button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button>
            <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`}>Save Experience</button>
          </div>
        </form>
      </Modal>

      {/* ── UPLOAD WORK MODAL ── */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Add New Portfolio Work">
        <form onSubmit={handleSubmitUpload}>
          <div className={styles.formGroup}><label className={styles.label}>Title</label><input required className={styles.input} value={newWork.title} onChange={e => setNewWork({ ...newWork, title: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} placeholder="Tell the story behind this piece..." value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Category</label><select required className={styles.input} value={newWork.categoryOption} onChange={e => setNewWork({ ...newWork, categoryOption: e.target.value, customCategory: '' })}>{ART_STYLES.map(style => <option key={style} value={style}>{style}</option>)}<option value="Other...">Other / Custom Style...</option></select></div>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Year</label><input type="number" required className={styles.input} value={newWork.year} onChange={e => setNewWork({ ...newWork, year: e.target.value })} /></div>
          </div>
          {newWork.categoryOption === 'Other...' && ( <div className={styles.formGroup}><label className={styles.label}>Custom Style</label><input required className={styles.input} value={newWork.customCategory} onChange={e => setNewWork({ ...newWork, customCategory: e.target.value })} /></div> )}
          <div className={styles.formGroup}><label className={styles.label}>Work Image <span style={{color: '#e74c3c'}}>* mandatory</span></label><input type="file" required accept="image/*" onChange={e => setNewWork({ ...newWork, file: e.target.files?.[0] })} className={styles.input} style={{padding: '7px'}} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancel</button><button type="submit" className={`${shared.btn} ${shared.btnPrimary}`} disabled={uploading}>{uploading ? 'Uploading...' : 'Save Work'}</button></div>
        </form>
      </Modal>

      {/* ── EDIT WORK MODAL ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Work Details">
        <form onSubmit={handleEditSubmit}>
          <div className={styles.formGroup}><label className={styles.label}>Title</label><input required className={styles.input} value={newWork.title} onChange={e => setNewWork({ ...newWork, title: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Category</label><select required className={styles.input} value={newWork.categoryOption} onChange={e => setNewWork({ ...newWork, categoryOption: e.target.value, customCategory: '' })}>{ART_STYLES.map(style => <option key={style} value={style}>{style}</option>)}<option value="Other...">Other / Custom Style...</option></select></div>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Year</label><input type="number" required className={styles.input} value={newWork.year} onChange={e => setNewWork({ ...newWork, year: e.target.value })} /></div>
          </div>
          {newWork.categoryOption === 'Other...' && ( <div className={styles.formGroup}><label className={styles.label}>Custom Style</label><input required className={styles.input} value={newWork.customCategory} onChange={e => setNewWork({ ...newWork, customCategory: e.target.value })} /></div> )}
          <div className={styles.formActions}>
             <button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={() => { setIsEditModalOpen(false); setIsViewModalOpen(true); }}>Cancel</button>
             <button type="submit" className={`${shared.btn} ${shared.btnPrimary}`} disabled={uploading}>{uploading ? 'Saving...' : 'Update Details'}</button>
          </div>
        </form>
      </Modal>

      {/* ── REDESIGNED VIEW MODAL ── */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Work Details">
        {selectedWork && (
          <div className={styles.viewDetails}>
            <div className={styles.viewImageWrapper}>
              <img src={selectedWork.imageUrl} className={styles.viewImage} alt={selectedWork.title} />
            </div>
            <div className={styles.viewContent}>
              <h3 className={styles.viewTitle}>{selectedWork.title}</h3>
              <div className={styles.viewBadges}>
                <span className={styles.badge}>{selectedWork.category}</span>
                <span className={styles.badge}>{selectedWork.year}</span>
              </div>
              <div className={styles.viewDesc}>
                {selectedWork.description ? selectedWork.description : <span style={{color: '#777', fontStyle: 'italic'}}>No description provided.</span>}
              </div>
              <div className={styles.viewActions}>
                <button className={`${shared.btn} ${shared.btnGhost}`} onClick={openEditModal}>✎ Edit Details</button>
                <button className={`${shared.btn} ${shared.btnGhost}`} style={{color: '#e74c3c'}} onClick={() => requestDelete('portfolio', selectedWork.id)}>Remove Work</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── CONFIRMATION MODAL ── */}
      <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({isOpen: false})} title="Confirm Action">
        <p style={{color: '#fff', marginBottom: '24px', textAlign: 'center'}}>Are you sure you want to remove this? <br/><br/>This action cannot be undone.</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '12px'}}>
          <button className={`${shared.btn} ${shared.btnGhost}`} onClick={() => setConfirmDialog({isOpen: false})}>Cancel</button>
          <button className={shared.btn} style={{backgroundColor: '#e74c3c', color: '#fff', border: 'none'}} onClick={executeDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  )
}

function WorkCard({ work, onCardClick }) {
  return (
    <div className={styles.card} onClick={() => onCardClick(work)}>
      <div className={styles.thumb}><img src={work.imageUrl} alt={work.title} className={styles.img} /></div>
      <div className={styles.meta}><div className={styles.title}>{work.title}</div><div className={styles.tag}>{work.category} · {work.year}</div></div>
    </div>
  )
}