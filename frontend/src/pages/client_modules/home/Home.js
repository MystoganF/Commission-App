import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import styles from './Home.module.css';

export default function Home() {
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // FIXED: Removed the extra /api from the path
    api.get('/public/services/top')
      .then(res => setTrendingServices(res.data))
      .catch(err => console.error("Error fetching trending services:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Commission Unique Art <br/> from Top-Tier Artists</h1>
        <p className={styles.heroSub}>The premier platform for professional commissions and artist portfolios.</p>
        <button className={styles.ctaBtn} onClick={() => navigate('/client/explore')}>Explore All Artists</button>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Trending Services</h2>
          <p className={styles.sectionSub}>Highly-rated services from our community</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading trends...</div>
        ) : (
          <div className={styles.serviceGrid}>
            {trendingServices.length > 0 ? trendingServices.map(service => (
              <div 
                key={service.id} 
                className={styles.serviceCard}
                onClick={() => navigate(`/client/artist/${service.artistId}`)}
              >
                <div className={styles.cardThumb}>
                  {service.samples?.[0] ? <img src={service.samples[0]} alt={service.name} /> : <div className={styles.noPreview}>No Preview</div>}
                  <div className={styles.ratingBadge}>★ {service.averageRating.toFixed(1)}</div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <p className={styles.artistName}>by {service.artistName}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>₱ {Number(service.price).toLocaleString()}</span>
                    <button className={styles.viewBtn}>View Portfolio</button>
                  </div>
                </div>
              </div>
            )) : <p className={styles.emptyText}>No services found yet.</p>}
          </div>
        )}
      </section>
    </div>
  );
}