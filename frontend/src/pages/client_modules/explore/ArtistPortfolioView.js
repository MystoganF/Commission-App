import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './ArtistView.module.css';
import Modal from '../../../components/ui/Modal';
import { FaFacebook, FaInstagram, FaTwitter, FaPhone, FaWallet, FaGraduationCap, FaTrophy, FaBriefcase } from 'react-icons/fa';

export default function ArtistPortfolioView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); 

  useEffect(() => {
    api.get(`/public/artists/${id}/portfolio`)
      .then(res => setData(res.data))
      .catch(() => navigate('/client/explore'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleViewItem = (item, type) => {
    if (type === 'work') {
      setSelectedItem({ ...item, modalTitle: "Artwork Details" });
    } else if (type === 'education') {
      setSelectedItem({
        imageUrl: item.imageUrl,
        title: item.degree,
        category: item.institution,
        year: `${item.startYear} – ${item.endYear || 'Present'}`,
        description: null,
        modalTitle: "Education Certificate"
      });
    } else if (type === 'achievement') {
      setSelectedItem({
        imageUrl: item.imageUrl,
        title: item.title,
        category: "Achievement & Award",
        year: item.year,
        description: item.description,
        modalTitle: "Award Recognition"
      });
    }
  };

  if (loading) return <div className={styles.loading}>Loading Artist Profile...</div>;
  if (!data) return <div className={styles.loading}>Artist data not available.</div>;

  const { profile, works, services, reviews, experiences, education, achievements } = data;

  // ── FIX: Filter out soft-deleted services ──
  // This ensures that even if the backend sends them, they won't appear to the client.
  const activeServices = services?.filter(s => s.active !== false);

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <button className={styles.backBtn} onClick={() => navigate('/client/explore')}>← Back to Artists</button>

      {/* ── 1. HERO & PROFILE ── */}
      <header className={styles.hero}>
        <img 
          src={profile.profilePictureUrl || 'https://via.placeholder.com/150'} 
          alt={profile.username} 
          className={styles.avatar} 
        />
        <div className={styles.heroInfo}>
          <h1 className={styles.username}>{profile.username}</h1>
          <div className={styles.stats}>
            <span className={styles.rating}>★ {profile.averageRating.toFixed(1)} ({profile.totalReviews} Reviews)</span>
          </div>

          <div className={styles.socialLinks}>
            {profile.phoneNumber && <div className={styles.socialIcon}><FaPhone size={16} /> <span>{profile.phoneNumber}</span></div>}
            {profile.facebook && <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noreferrer" className={styles.socialIcon}><FaFacebook size={22} /></a>}
            {profile.instagram && <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer" className={styles.socialIcon}><FaInstagram size={22} /></a>}
            {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" className={styles.socialIcon}><FaTwitter size={22} /></a>}
          </div>

          <p className={styles.bio}>{profile.bio || "No bio available."}</p>
          <div className={styles.skillCloud}>
            {profile.skills?.map(s => <span key={s} className={styles.skillBadge}>{s}</span>)}
          </div>
        </div>
      </header>

      {/* ── 2. PAYMENT DETAILS ── */}
      {(profile.gcashNumber || profile.paymayaNumber) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Payment Details</h2>
          <div className={styles.paymentGrid}>
            {profile.gcashNumber && (
              <div className={styles.paymentCard}>
                <div className={styles.payHeader}><FaWallet color="#2196F3" /> <span>GCash</span></div>
                <p className={styles.payNumber}>{profile.gcashNumber}</p>
                <p className={styles.payName}>{profile.gcashName}</p>
              </div>
            )}
            {profile.paymayaNumber && (
              <div className={styles.paymentCard}>
                <div className={styles.payHeader}><FaWallet color="#6200EE" /> <span>Paymaya</span></div>
                <p className={styles.payNumber}>{profile.paymayaNumber}</p>
                <p className={styles.payName}>{profile.paymayaName}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. COMMISSION SERVICES (Filtered) ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Commission Services</h2>
        {activeServices?.length > 0 ? (
          <div className={styles.servicesGrid}>
            {activeServices.map(s => (
              <div key={s.id} className={styles.serviceCard}>
                <div className={styles.cardCover}>
                  {s.samples?.[0] ? <img src={s.samples[0]} alt={s.name} /> : <div className={styles.noImage}>No Sample</div>}
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.serviceName}>{s.name}</h3>
                  <span className={styles.price}>₱ {Number(s.price).toLocaleString()}</span>
                  <button className={styles.bookBtn} onClick={() => navigate(`/client/book/${s.id}`)}>Select & Book</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMsg}>This artist is currently not accepting new commission requests.</p>
        )}
      </section>

      {/* ── 4. FEATURED WORKS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Works</h2>
        <div className={styles.workGrid}>
          {works?.map(work => (
            <div key={work.id} className={styles.workCard} onClick={() => handleViewItem(work, 'work')}>
              <img src={work.imageUrl} alt={work.title} />
              <div className={styles.workOverlay}>
                <span className={styles.workTitle}>{work.title}</span>
                <span className={styles.workYear}>{work.category} • {work.year}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. EXPERIENCE ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaBriefcase style={{marginRight: '10px'}} /> Experience</h2>
        <div className={styles.itemsGrid}>
          {experiences?.map(exp => (
            <div key={exp.id} className={styles.infoCard}>
              <h4>{exp.title}</h4>
              <p className={styles.cardSubtitle}>{exp.company}</p>
              <span className={styles.cardDate}>{exp.startDate} – {exp.endDate}</span>
              <p className={styles.cardDesc}>{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. EDUCATION & AWARDS ── */}
      <section className={styles.section}>
        <div className={styles.dualGrid}>
          <div className={styles.gridColumn}>
            <h2 className={styles.sectionTitle}><FaGraduationCap style={{marginRight: '10px'}} /> Education</h2>
            <div className={styles.verticalItems}>
              {education?.map(edu => (
                <div key={edu.id} className={styles.infoCard}>
                  <h4>{edu.degree}</h4>
                  <p className={styles.cardSubtitle}>{edu.institution}</p>
                  <span className={styles.cardDate}>{edu.startYear} – {edu.endYear}</span>
                  {edu.imageUrl && <img src={edu.imageUrl} className={styles.miniThumb} onClick={() => handleViewItem(edu, 'education')} alt="Cert" />}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.gridColumn}>
            <h2 className={styles.sectionTitle}><FaTrophy style={{marginRight: '10px'}} /> Achievements</h2>
            <div className={styles.verticalItems}>
              {achievements?.map(ach => (
                <div key={ach.id} className={styles.infoCard}>
                  <h4>{ach.title}</h4>
                  <span className={styles.cardDate}>{ach.year}</span>
                  <p className={styles.cardDesc}>{ach.description}</p>
                  {ach.imageUrl && <img src={ach.imageUrl} className={styles.miniThumb} onClick={() => handleViewItem(ach, 'achievement')} alt="Award" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL ── */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.modalTitle}>
        {selectedItem && (
          <div className={styles.viewDetails}>
            <div className={styles.viewImageWrapper}><img src={selectedItem.imageUrl} className={styles.viewImage} alt="Details" /></div>
            <div className={styles.viewContent}>
              <h3 className={styles.viewTitle}>{selectedItem.title}</h3>
              <div className={styles.viewBadges}><span className={styles.badge}>{selectedItem.category}</span><span className={styles.badge}>{selectedItem.year}</span></div>
              {selectedItem.description && <div className={styles.viewDesc}>{selectedItem.description}</div>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}