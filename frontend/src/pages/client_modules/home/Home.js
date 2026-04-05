import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './Home.module.css';

export default function Home() {
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/public/services/top')
      .then(res => setTrendingServices(res.data))
      .catch(err => console.error("Error fetching trending services:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroEyebrow}>Featured Platform</div>
        <h1 className={styles.heroTitle}>
          Commission Unique Art<br />from Top-Tier Artists
        </h1>
        <p className={styles.heroSub}>
          The premier platform for professional commissions and artist portfolios.
        </p>
        <button className={styles.ctaBtn} onClick={() => navigate('/client/explore')}>
          Explore All Artists
        </button>
      </header>

      {/* ── Trending Services ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>Trending Services</h2>
            <p className={styles.sectionSub}>Highly-rated services from our community</p>
          </div>
          <button className={styles.viewAllBtn} onClick={() => navigate('/client/explore')}>
            View all
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : trendingServices.length === 0 ? (
          <p className={styles.emptyText}>No services found yet.</p>
        ) : (
          <div className={styles.serviceGrid}>
            {trendingServices.map(service => (
              <div
                key={service.id}
                className={styles.serviceCard}
                onClick={() => navigate(`/client/artist/${service.artistId}`)}
              >
                <div className={styles.cardThumb}>
                  {service.samples?.[0]
                    ? <img src={service.samples[0]} alt={service.name} />
                    : <div className={styles.noPreview}>◻</div>
                  }
                  <div className={styles.ratingBadge}>★ {service.averageRating.toFixed(1)}</div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.serviceName}>{service.name}</div>
                  <div className={styles.artistName}>by {service.artistName}</div>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>₱ {Number(service.price).toLocaleString()}</span>
                    <button
                      className={styles.viewBtn}
                      onClick={e => { e.stopPropagation(); navigate(`/client/artist/${service.artistId}`); }}
                    >
                      View Portfolio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}