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

  function openModal(type, item = null) {
    if (type === 'profile') {
      setFormData(data.profile || {})
    } else if (item) {
      setFormData({ ...item, isCurrent: item.endDate === 'Present' })
    } else {
      setFormData({})
    }
    setActiveModal(type)
  }
  
  function closeModal() { setActiveModal(null) }

  function openUploadModal() {
    setNewWork({ title: '', description: '', categoryOption: ART_STYLES[0], customCategory: '', year: new Date().getFullYear(), file: null })
    setIsUploadModalOpen(true)
  }

  function handleViewItem(item, type) {
    if (type === 'portfolio') {
      setSelectedWork({ ...item, itemType: 'portfolio' });
    } else if (type === 'education') {
      setSelectedWork({
        id: item.id, imageUrl: item.imageUrl, title: item.degree, category: item.institution,
        year: `${item.startYear} – ${item.endYear || 'Present'}`, description: null, itemType: 'education'
      });
    } else if (type === 'achievement') {
      setSelectedWork({
        id: item.id, imageUrl: item.imageUrl, title: item.title, category: 'Achievement & Award',
        year: item.year, description: item.description, itemType: 'achievement'
      });
    }
    setIsViewModalOpen(true);
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
  
  async function handleSaveExperience(e) { 
    e.preventDefault(); 
    const payload = { ...formData, endDate: formData.isCurrent ? 'Present' : formData.endDate };
    try { 
      if (formData.id) {
        const res = await api.put(`/admin/experiences/${formData.id}`, payload);
        setData(prev => ({ ...prev, experiences: prev.experiences.map(x => x.id === formData.id ? res.data : x) }));
        showToast('Experience updated.');
      } else {
        const res = await api.post('/admin/experiences', payload); 
        setData(prev => ({ ...prev, experiences: [res.data, ...prev.experiences] })); 
        showToast('Experience added.'); 
      }
      closeModal(); 
    } catch { showToast('Error saving experience.'); } 
  }

  // FIXED: Removed manual headers for FormData
  async function handleSaveEducation(e) { 
    e.preventDefault(); 
    setUploading(true);
    try { 
      const uploadData = new FormData();
      uploadData.append('degree', formData.degree);
      uploadData.append('institution', formData.institution);
      uploadData.append('startYear', formData.startYear);
      uploadData.append('endYear', formData.endYear || '');
      if (formData.file) uploadData.append('file', formData.file);

      if (formData.id) {
        const res = await api.put(`/admin/education/${formData.id}`, uploadData);
        setData(prev => ({ ...prev, education: prev.education.map(x => x.id === formData.id ? res.data : x) }));
      } else {
        const res = await api.post('/admin/education', uploadData); 
        setData(prev => ({ ...prev, education: [res.data, ...prev.education] })); 
      }
      closeModal(); showToast('Education saved.');
    } catch { showToast('Error saving education.'); } finally { setUploading(false); }
  }

  // FIXED: Removed manual headers for FormData
  async function handleSaveAchievement(e) { 
    e.preventDefault(); 
    setUploading(true);
    try { 
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('year', formData.year);
      uploadData.append('description', formData.description || '');
      if (formData.file) uploadData.append('file', formData.file);

      if (formData.id) {
        const res = await api.put(`/admin/achievements/${formData.id}`, uploadData);
        setData(prev => ({ ...prev, achievements: prev.achievements.map(x => x.id === formData.id ? res.data : x) }));
      } else {
        const res = await api.post('/admin/achievements', uploadData); 
        setData(prev => ({ ...prev, achievements: [res.data, ...prev.achievements] })); 
      }
      closeModal(); showToast('Achievement saved.');
    } catch { showToast('Error saving achievement.'); } finally { setUploading(false); }
  }

  // FIXED: Removed manual headers for FormData
  async function handleSubmitUpload(e) {
    e.preventDefault()
    if (!newWork.file) { showToast('Image is mandatory!'); return; }
    const finalCategory = newWork.categoryOption === 'Other...' ? (newWork.customCategory || 'Uncategorized') : newWork.categoryOption;
    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('title', newWork.title || newWork.file.name); uploadData.append('description', newWork.description || ''); 
      uploadData.append('category', finalCategory); uploadData.append('year', newWork.year.toString()); uploadData.append('file', newWork.file)
      
      const res = await api.post('/admin/portfolio', uploadData);
      
      setData(prev => ({ ...prev, works: [res.data, ...prev.works] }))
      setIsUploadModalOpen(false); showToast('Work uploaded.');
    } catch { showToast('Upload failed.') } finally { setUploading(false) }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    const finalCategory = newWork.categoryOption === 'Other...' ? (newWork.customCategory || 'Uncategorized') : newWork.categoryOption;
    setUploading(true);
    try {
      const res = await api.put(`/admin/portfolio/${selectedWork.id}`, { title: newWork.title, description: newWork.description, category: finalCategory, year: newWork.year.toString() });
      setData(prev => ({ ...prev, works: prev.works.map(w => w.id === selectedWork.id ? res.data : w) }));
      setSelectedWork(res.data); setIsEditModalOpen(false); setIsViewModalOpen(true); showToast('Work updated.');
    } catch { showToast('Update failed.'); } finally { setUploading(false); }
  }

  function requestDelete(type, id) { setConfirmDialog({ isOpen: true, type, id }) }

  async function executeDelete() {
    const { type, id } = confirmDialog; setConfirmDialog({ isOpen: false, type: '', id: null })
    try {
      await api.delete(`/admin/${type}/${id}`)
      const stateKey = type === 'portfolio' ? 'works' : type;
      setData(prev => ({ ...prev, [stateKey]: prev[stateKey].filter(item => item.id !== id) }))
      if (type === 'portfolio' && selectedWork?.id === id) setIsViewModalOpen(false)
      showToast('Item removed.')
    } catch { showToast('Failed to delete.') }
  }

  if (loading) return <div className={styles.loading}>Loading Profile...</div>

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <div className={styles.header}><h2>Artist Portfolio</h2></div>

      <div className={styles.layout}>
        {/* ── MAIN FEED ── */}
        <div className={styles.mainFeed}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>About Me</h3><button className={styles.addTextBtn} onClick={() => openModal('profile')}>✎ Edit</button></div>
            <p className={styles.itemDesc}>{data.profile?.bio || "No bio added yet."}</p>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Experience</h3><button className={styles.addTextBtn} onClick={() => openModal('experience')}>+ Add</button></div>
            <div className={styles.listContainer}>
              {data.experiences.length === 0 && <p className={shared.emptyText}>No experience added.</p>}
              {data.experiences.map(exp => (
                <div key={exp.id} className={styles.listItem}>
                  <div className={styles.itemMain}><h4 className={styles.itemTitle}>{exp.title}</h4><p className={styles.itemSubtitle}>{exp.company}</p><p className={styles.itemDates}>{exp.startDate} – {exp.endDate || 'Present'}</p></div>
                  <div className={styles.itemActions}><button className={styles.editBtn} onClick={() => openModal('experience', exp)}>✎ Edit</button><button className={styles.deleteBtn} onClick={() => requestDelete('experiences', exp.id)}>Remove</button></div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Education</h3><button className={styles.addTextBtn} onClick={() => openModal('education')}>+ Add</button></div>
            <div className={styles.listContainer}>
              {data.education.map(edu => (
                <div key={edu.id} className={styles.listItem}>
                  <div className={styles.itemMain}><h4 className={styles.itemTitle}>{edu.degree}</h4><p className={styles.itemSubtitle}>{edu.institution}</p><p className={styles.itemDates}>{edu.startYear} – {edu.endYear}</p>
                  {edu.imageUrl && <img src={edu.imageUrl} className={styles.miniThumb} style={{width: '180px', height: '110px', marginTop: '10px'}} onClick={() => handleViewItem(edu, 'education')} />}</div>
                  <div className={styles.itemActions}><button className={styles.editBtn} onClick={() => openModal('education', edu)}>✎ Edit</button><button className={styles.deleteBtn} onClick={() => requestDelete('education', edu.id)}>Remove</button></div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Achievements</h3><button className={styles.addTextBtn} onClick={() => openModal('achievement')}>+ Add</button></div>
            <div className={styles.listContainer}>
              {data.achievements.map(ach => (
                <div key={ach.id} className={styles.listItem}>
                  <div className={styles.itemMain}><h4 className={styles.itemTitle}>{ach.title}</h4><p className={styles.itemDates}>{ach.year}</p>
                  {ach.imageUrl && <img src={ach.imageUrl} className={styles.miniThumb} style={{width: '180px', height: '110px', marginTop: '10px'}} onClick={() => handleViewItem(ach, 'achievement')} />}</div>
                  <div className={styles.itemActions}><button className={styles.editBtn} onClick={() => openModal('achievement', ach)}>✎ Edit</button><button className={styles.deleteBtn} onClick={() => requestDelete('achievements', ach.id)}>Remove</button></div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Featured Works</h3><button className={styles.addTextBtn} onClick={openUploadModal}>+ Add Work</button></div>
            <div className={styles.grid}>{data.works.map(w => <WorkCard key={w.id} work={w} onCardClick={() => handleViewItem(w, 'portfolio')} />)}</div>
          </div>
        </div>

        {/* ── SIDE PANEL ── */}
        <div className={styles.sidePanel}>
          {/* Contact Box */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Contact Info</h3><button className={styles.addTextBtn} onClick={() => openModal('profile')}>✎ Edit</button></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Name</p><p className={styles.contactValue}>{data.profile?.username || '—'}</p></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Phone</p><p className={styles.contactValue}>{data.profile?.phoneNumber || '—'}</p></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Facebook</p><p className={styles.contactValue}>{data.profile?.facebook || '—'}</p></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Instagram</p><p className={styles.contactValue}>{data.profile?.instagram || '—'}</p></div>
            <div className={styles.contactItem}><p className={styles.contactLabel}>Twitter / X</p><p className={styles.contactValue}>{data.profile?.twitter || '—'}</p></div>
          </div>

          {/* Payment Box */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Payment Details</h3><button className={styles.addTextBtn} onClick={() => openModal('profile')}>✎ Edit</button></div>
            <div className={styles.contactItem}>
              <p className={styles.contactLabel}>GCash Account</p>
              <p className={styles.contactValue}>{data.profile?.gcashNumber || '—'}</p>
              <p className={styles.contactValue} style={{fontSize: '12px', color: '#888'}}>{data.profile?.gcashName || ''}</p>
            </div>
            <div className={styles.contactItem}>
              <p className={styles.contactLabel}>Paymaya Account</p>
              <p className={styles.contactValue}>{data.profile?.paymayaNumber || '—'}</p>
              <p className={styles.contactValue} style={{fontSize: '12px', color: '#888'}}>{data.profile?.paymayaName || ''}</p>
            </div>
          </div>

          <div className={styles.sectionCard}>
             <div className={styles.sectionHeader}><h3 className={styles.sectionTitle}>Skills</h3><button className={styles.addTextBtn} onClick={() => openModal('skill')}>+ Add</button></div>
             <div className={styles.skillGrid}>{data.skills.map(skill => (
                <div key={skill.id} className={styles.skillTag}>{skill.name}<span className={styles.skillDelete} onClick={() => requestDelete('skills', skill.id)}>&times;</span></div>
              ))}</div>
          </div>
        </div>
      </div>

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}

      {/* ── PROFILE MODAL (Including Payments) ── */}
      <Modal isOpen={activeModal === 'profile'} onClose={closeModal} title="Edit Profile & Payment">
        <form onSubmit={handleUpdateProfile}>
          <div className={styles.formGroup}><label className={styles.label}>Display Name</label><input className={styles.input} value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Bio / About Me</label><textarea className={styles.textarea} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Phone Number</label><input className={styles.input} value={formData.phoneNumber || ''} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Facebook Link</label><input className={styles.input} value={formData.facebook || ''} onChange={e => setFormData({ ...formData, facebook: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Instagram Link</label><input className={styles.input} value={formData.instagram || ''} onChange={e => setFormData({ ...formData, instagram: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Twitter / X Link</label><input className={styles.input} value={formData.twitter || ''} onChange={e => setFormData({ ...formData, twitter: e.target.value })} /></div>
          
          <h4 style={{color: '#fff', margin: '20px 0 10px 0', borderTop: '1px solid #333', paddingTop: '15px'}}>Payment Channels</h4>
          <div style={{display:'flex', gap:'12px'}}>
             <div className={styles.formGroup} style={{flex:1}}><label className={styles.label}>GCash Name</label><input className={styles.input} value={formData.gcashName || ''} onChange={e => setFormData({...formData, gcashName: e.target.value})} /></div>
             <div className={styles.formGroup} style={{flex:1}}><label className={styles.label}>GCash Number</label><input className={styles.input} value={formData.gcashNumber || ''} onChange={e => setFormData({...formData, gcashNumber: e.target.value})} /></div>
          </div>
          <div style={{display:'flex', gap:'12px'}}>
             <div className={styles.formGroup} style={{flex:1}}><label className={styles.label}>Paymaya Name</label><input className={styles.input} value={formData.paymayaName || ''} onChange={e => setFormData({...formData, paymayaName: e.target.value})} /></div>
             <div className={styles.formGroup} style={{flex:1}}><label className={styles.label}>Paymaya Number</label><input className={styles.input} value={formData.paymayaNumber || ''} onChange={e => setFormData({...formData, paymayaNumber: e.target.value})} /></div>
          </div>

          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button><button type="submit" className={`${shared.btn} ${shared.btnPrimary}`}>Save Changes</button></div>
        </form>
      </Modal>

      {/* ── SKILL MODAL ── */}
      <Modal isOpen={activeModal === 'skill'} onClose={closeModal} title="Add Skill">
        <form onSubmit={handleAddSkill}>
          <div className={styles.formGroup}><label className={styles.label}>Skill Name</label><input required className={styles.input} value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button><button type="submit" className={`${shared.btn} ${shared.btnPrimary}`}>Save Skill</button></div>
        </form>
      </Modal>

      {/* ── EXPERIENCE MODAL ── */}
      <Modal isOpen={activeModal === 'experience'} onClose={closeModal} title={formData.id ? "Edit Experience" : "Add Experience"}>
        <form onSubmit={handleSaveExperience}>
          <div className={styles.formGroup}><label className={styles.label}>Job Title</label><input required className={styles.input} value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Company</label><input required className={styles.input} value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Start Date</label><input type="date" required className={styles.input} value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} /></div>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>End Date</label><input type="date" className={styles.input} disabled={formData.isCurrent} value={formData.isCurrent ? '' : (formData.endDate || '')} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            <label style={{display:'flex', alignItems:'center', gap:'8px', color:'#fff', fontSize:'12px', marginTop:'8px'}}><input type="checkbox" checked={formData.isCurrent || false} onChange={e => setFormData({...formData, isCurrent: e.target.checked})} /> Present</label></div>
          </div>
          <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button><button type="submit" className={`${shared.btn} ${shared.btnPrimary}`}>Save Experience</button></div>
        </form>
      </Modal>

      {/* ── EDUCATION MODAL (ADDED) ── */}
      <Modal isOpen={activeModal === 'education'} onClose={closeModal} title={formData.id ? "Edit Education" : "Add Education"}>
        <form onSubmit={handleSaveEducation}>
          <div className={styles.formGroup}><label className={styles.label}>Degree / Program</label><input required className={styles.input} value={formData.degree || ''} onChange={e => setFormData({ ...formData, degree: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Institution</label><input required className={styles.input} value={formData.institution || ''} onChange={e => setFormData({ ...formData, institution: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>Start Year</label><input required className={styles.input} value={formData.startYear || ''} onChange={e => setFormData({ ...formData, startYear: e.target.value })} /></div>
            <div className={styles.formGroup} style={{ flex: 1 }}><label className={styles.label}>End Year</label><input className={styles.input} value={formData.endYear || ''} onChange={e => setFormData({ ...formData, endYear: e.target.value })} /></div>
          </div>
          <div className={styles.formGroup}><label className={styles.label}>Image / Logo</label><input type="file" className={styles.input} onChange={e => setFormData({ ...formData, file: e.target.files[0] })} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button><button type="submit" disabled={uploading} className={`${shared.btn} ${shared.btnPrimary}`}>{uploading ? 'Saving...' : 'Save Education'}</button></div>
        </form>
      </Modal>

      {/* ── ACHIEVEMENT MODAL (ADDED) ── */}
      <Modal isOpen={activeModal === 'achievement'} onClose={closeModal} title={formData.id ? "Edit Achievement" : "Add Achievement"}>
        <form onSubmit={handleSaveAchievement}>
          <div className={styles.formGroup}><label className={styles.label}>Title</label><input required className={styles.input} value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Year</label><input required className={styles.input} value={formData.year || ''} onChange={e => setFormData({ ...formData, year: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Image / Certificate</label><input type="file" className={styles.input} onChange={e => setFormData({ ...formData, file: e.target.files[0] })} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={closeModal}>Cancel</button><button type="submit" disabled={uploading} className={`${shared.btn} ${shared.btnPrimary}`}>{uploading ? 'Saving...' : 'Save Achievement'}</button></div>
        </form>
      </Modal>

      {/* ── UPLOAD WORK MODAL (ADDED) ── */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Add Featured Work">
        <form onSubmit={handleSubmitUpload}>
          <div className={styles.formGroup}><label className={styles.label}>Title</label><input required className={styles.input} value={newWork.title} onChange={e => setNewWork({ ...newWork, title: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Category</label>
            <select className={styles.input} value={newWork.categoryOption} onChange={e => setNewWork({ ...newWork, categoryOption: e.target.value })}>
              {ART_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
              <option value="Other...">Other...</option>
            </select>
          </div>
          {newWork.categoryOption === 'Other...' && <div className={styles.formGroup}><label className={styles.label}>Custom Category</label><input required className={styles.input} value={newWork.customCategory} onChange={e => setNewWork({ ...newWork, customCategory: e.target.value })} /></div>}
          <div className={styles.formGroup}><label className={styles.label}>Year</label><input type="number" required className={styles.input} value={newWork.year} onChange={e => setNewWork({ ...newWork, year: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} /></div>
          <div className={styles.formGroup}><label className={styles.label}>Upload File</label><input required type="file" className={styles.input} onChange={e => setNewWork({ ...newWork, file: e.target.files[0] })} /></div>
          <div className={styles.formActions}><button type="button" className={`${shared.btn} ${shared.btnGhost}`} onClick={() => setIsUploadModalOpen(false)}>Cancel</button><button type="submit" disabled={uploading} className={`${shared.btn} ${shared.btnPrimary}`}>{uploading ? 'Uploading...' : 'Upload Work'}</button></div>
        </form>
      </Modal>

      {/* ── VIEW MODAL ── */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={selectedWork?.itemType === 'portfolio' ? "Work Details" : "Attached Document"}>
        {selectedWork && (
          <div className={styles.viewDetails}>
            <div className={styles.viewImageWrapper}><img src={selectedWork.imageUrl} className={styles.viewImage} /></div>
            <div className={styles.viewContent}><h3 className={styles.viewTitle}>{selectedWork.title}</h3><div className={styles.viewBadges}><span className={styles.badge}>{selectedWork.category}</span><span className={styles.badge}>{selectedWork.year}</span></div>
            <div className={styles.viewDesc}>{selectedWork.description || <span style={{color:'#777', fontStyle:'italic'}}>No description provided.</span>}</div>
            {selectedWork.itemType === 'portfolio' && <div className={styles.viewActions}><button className={`${shared.btn} ${shared.btnGhost}`} onClick={openEditModal}>✎ Edit</button><button className={`${shared.btn} ${shared.btnGhost}`} style={{color:'#e74c3c'}} onClick={() => requestDelete('portfolio', selectedWork.id)}>Remove</button></div>}
            </div>
          </div>
        )}
      </Modal>

      {/* ── CONFIRMATION ── */}
      <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({isOpen: false})} title="Confirm Action">
        <p style={{color:'#fff', marginBottom:'24px', textAlign:'center'}}>Are you sure you want to remove this? <br/>This action cannot be undone.</p>
        <div style={{display:'flex', justifyContent:'center', gap:'12px'}}><button className={`${shared.btn} ${shared.btnGhost}`} onClick={() => setConfirmDialog({isOpen: false})}>Cancel</button><button className={shared.btn} style={{backgroundColor:'#e74c3c', color:'#fff', border:'none'}} onClick={executeDelete}>Yes, Delete</button></div>
      </Modal>
    </div>
  )
}

function WorkCard({ work, onCardClick }) {
  return (
    <div className={styles.card} onClick={() => onCardClick(work)}>
      <div className={styles.thumb}><img src={work.imageUrl} className={styles.img} /></div>
      <div className={styles.meta}><div className={styles.title}>{work.title}</div><div className={styles.tag}>{work.category} · {work.year}</div></div>
    </div>
  )
}