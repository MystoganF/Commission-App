import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './ClientProfile.module.css';

export default function ClientProfile() {
  const [user, setUser] = useState({ 
    username: '', phoneNumber: '', profilePictureUrl: '', bio: '',
    facebook: '', instagram: '', twitter: '',
    gcashName: '', gcashNumber: '', paymayaName: '', paymayaNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Note: Endpoint changed from '/api/client/profile' to '/client/profile'
    api.get('/client/profile')
      .then(res => { setUser(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/client/profile', user);
      showToast("Profile information synchronized.");
    } catch { showToast("Sync failed. Check your connection."); }
    finally { setSaving(false); }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Added an empty headers object to override any JSON defaults
      const res = await api.post('/client/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }));
      showToast("Identity photo updated.");
    } catch (err) { 
      console.error(err);
      showToast("Upload failed."); 
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className={shared.loading}>Synchronizing Account...</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <h1 className={styles.title}>Account Settings</h1>
      
      <div className={styles.layout}>
        <div className={styles.picSection}>
          <div className={styles.avatarWrap}>
            <img src={user.profilePictureUrl || 'https://via.placeholder.com/150'} alt="Profile" />
            <label className={styles.uploadOverlay}>
              <span>Change Photo</span>
              <input type="file" hidden onChange={handleFile} />
            </label>
          </div>
          <p className={styles.picHint}>Square images work best.</p>
        </div>

        <form className={styles.form} onSubmit={handleUpdate}>
          {/* Section: Identity */}
          <h3 className={styles.sectionLabel}>Basic Information</h3>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>Display Name</label>
              <input className={styles.input} value={user.username} onChange={e => setUser({...user, username: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Contact Number</label>
              <input className={styles.input} value={user.phoneNumber || ''} onChange={e => setUser({...user, phoneNumber: e.target.value})} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Public Bio</label>
            <textarea className={styles.textarea} value={user.bio || ''} onChange={e => setUser({...user, bio: e.target.value})} placeholder="Tell artists a bit about your project style..." />
          </div>

          {/* Section: Socials */}
          <h3 className={styles.sectionLabel}>Social Media Links</h3>
          <div className={styles.fieldGrid}>
            <input className={styles.input} placeholder="Facebook URL" value={user.facebook || ''} onChange={e => setUser({...user, facebook: e.target.value})} />
            <input className={styles.input} placeholder="Instagram URL" value={user.instagram || ''} onChange={e => setUser({...user, instagram: e.target.value})} />
            <input className={styles.input} placeholder="Twitter/X URL" value={user.twitter || ''} onChange={e => setUser({...user, twitter: e.target.value})} />
          </div>

          {/* Section: Payments */}
          <h3 className={styles.sectionLabel}>Payment Details (For Refunds)</h3>
          <div className={styles.fieldGrid}>
            <input className={styles.input} placeholder="GCash Name" value={user.gcashName || ''} onChange={e => setUser({...user, gcashName: e.target.value})} />
            <input className={styles.input} placeholder="GCash Number" value={user.gcashNumber || ''} onChange={e => setUser({...user, gcashNumber: e.target.value})} />
            <input className={styles.input} placeholder="PayMaya Name" value={user.paymayaName || ''} onChange={e => setUser({...user, paymayaName: e.target.value})} />
            <input className={styles.input} placeholder="PayMaya Number" value={user.paymayaNumber || ''} onChange={e => setUser({...user, paymayaNumber: e.target.value})} />
          </div>

          <button className={styles.saveBtn} disabled={saving}>
            {saving ? 'Synchronizing...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  );
}