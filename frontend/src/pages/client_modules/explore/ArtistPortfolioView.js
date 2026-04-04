import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './ArtistView.module.css';
import Modal from '../../../components/ui/Modal';
import { FaFacebook, FaInstagram, FaTwitter, FaPhone } from 'react-icons/fa';

export default function ArtistPortfolioView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // FIXED: Now holds the entire work object instead of just the image URL
  const [selectedWork, setSelectedWork] = useState(null); 

  useEffect(() => {
    // Strictly using public endpoint
    api.get(`/public/artists/${id}/portfolio`)
      .then(res => setData(res.data))
      .catch(() => navigate('/client/explore'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className={styles.loading}>Loading Artist Profile...</div>;
  if (!data) return <div className={styles.loading}>Artist data not available.</div>;

  const { profile, works, services, reviews, experiences, education, achievements } = data;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <button className={styles.backBtn} onClick={() => navigate('/client/explore')}>← Back to Artists</button>

      {/* ── 1. HERO & PROFILE ── */}
      <header className={styles.hero}>
        <img src={profile.profilePictureUrl || 'https://via.placeholder.com/150'} alt={profile.username} className={styles.avatar} />
        <div className={styles.heroInfo}>
          <h1 className={styles.username}>{profile.username}</h1>
          
          <div className={styles.stats}>
            <span className={styles.rating}>★ {profile.averageRating.toFixed(1)} ({profile.totalReviews} Reviews)</span>
          </div>

          {/* Social Icons Section */}
          <div className={styles.socialLinks}>
            {profile.phoneNumber && (
              <div className={styles.socialIcon} title="Phone Number">
                <FaPhone size={16} /> <span style={{fontSize: '14px'}}>{profile.phoneNumber}</span>
              </div>
            )}
            {profile.facebook && (
              <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noreferrer" className={styles.socialIcon} title="Facebook">
                <FaFacebook size={22} />
              </a>
            )}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer" className={styles.socialIcon} title="Instagram">
                <FaInstagram size={22} />
              </a>
            )}
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" className={styles.socialIcon} title="Twitter / X">
                <FaTwitter size={22} />
              </a>
            )}
          </div>

          <p className={styles.bio}>{profile.bio || "This artist hasn't written a bio yet."}</p>
          <div className={styles.skillCloud}>
            {profile.skills?.map(s => <span key={s} className={styles.skillBadge}>{s}</span>)}
          </div>
        </div>
      </header>

      {/* ── 2. SERVICES GRID ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Commission Services</h2>
          <p className={styles.sectionSub}>Available packages you can book right now.</p>
        </div>
        
        {services && services.length > 0 ? (
          <div className={styles.servicesGrid}>
            {services.map(s => (
              <div key={s.id} className={styles.serviceCard}>
                <div className={styles.cardCover}>
                  {s.samples && s.samples.length > 0 ? (
                    <img src={s.samples[0]} alt={s.name} />
                  ) : (
                    <div className={styles.noImage}>No Sample Image</div>
                  )}
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.serviceName}>{s.name}</h3>
                  <div className={styles.serviceDetails}>
                    <span className={styles.price}>₱ {Number(s.price).toLocaleString()}</span>
                    {s.turnaround && <span className={styles.turnaround}>• {s.turnaround}</span>}
                  </div>
                  <button 
                    className={styles.bookBtn} 
                    onClick={() => navigate(`/client/book/${s.id}`)}
                  >
                    Select & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className={styles.empty}>No services available at the moment.</p>}
      </section>

      {/* ── 3. PORTFOLIO GALLERY ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Works</h2>
        <div className={styles.workGrid}>
          {works && works.length > 0 ? works.map(work => (
            <div 
              key={work.id} 
              className={styles.workCard} 
              // Set the whole work object to trigger the Detailed Modal
              onClick={() => setSelectedWork(work)} 
            >
              <img src={work.imageUrl} alt={work.title} />
              <div className={styles.workOverlay}>
                <span className={styles.workTitle}>{work.title}</span>
                <span className={styles.workYear}>{work.category} • {work.year}</span>
              </div>
            </div>
          )) : <p className={styles.empty}>No gallery works to display.</p>}
        </div>
      </section>

      {/* ── 4. RESUME / BACKGROUND ── */}
      <section className={styles.resumeSection}>
        <div className={styles.resumeColumn}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          {experiences && experiences.length > 0 ? experiences.map(exp => (
            <div key={exp.id} className={styles.resumeItem}>
              <h4>{exp.title}</h4>
              <span className={styles.resumeMeta}>{exp.company} | {exp.startDate} – {exp.endDate || 'Present'}</span>
              <p>{exp.description}</p>
            </div>
          )) : <p className={styles.empty}>No experience listed.</p>}
        </div>

        <div className={styles.resumeColumn}>
          <h2 className={styles.sectionTitle}>Education & Awards</h2>
          
          <h4 style={{color: '#fff', marginBottom: '10px'}}>Education</h4>
          {education && education.length > 0 ? education.map(edu => (
            <div key={edu.id} className={styles.resumeItem}>
              <h4>{edu.degree}</h4>
              <span className={styles.resumeMeta}>{edu.institution} | {edu.startYear} – {edu.endYear}</span>
            </div>
          )) : <p className={styles.empty}>No education listed.</p>}

          <h4 style={{color: '#fff', marginTop: '30px', marginBottom: '10px'}}>Achievements</h4>
          {achievements && achievements.length > 0 ? achievements.map(ach => (
            <div key={ach.id} className={styles.resumeItem}>
              <h4>{ach.title}</h4>
              <span className={styles.resumeMeta}>{ach.year}</span>
              <p>{ach.description}</p>
            </div>
          )) : <p className={styles.empty}>No achievements listed.</p>}
        </div>
      </section>

      {/* ── 5. REVIEWS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Client Reviews</h2>
        <div className={styles.reviewsList}>
          {reviews && reviews.length > 0 ? reviews.map((rev, i) => (
            <div key={i} className={styles.reviewCard}>
              <div className={styles.revTop}>
                <strong>{rev.clientName}</strong>
                <span className={styles.revStars}>{'★'.repeat(rev.rating)}</span>
              </div>
              <p className={styles.revComment}>{rev.comment}</p>
              <span className={styles.revDate}>{rev.date}</span>
            </div>
          )) : <p className={styles.empty}>No reviews yet. Book a service to be the first!</p>}
        </div>
      </section>

      {/* ── DETAILED VIEW MODAL ── */}
      <Modal isOpen={!!selectedWork} onClose={() => setSelectedWork(null)} title="Artwork Details">
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
                {selectedWork.description ? (
                  selectedWork.description
                ) : (
                  <span style={{color: '#777', fontStyle: 'italic'}}>No description provided.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}