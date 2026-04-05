import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './ClientServices.module.css';

export default function ClientServices() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');

  useEffect(() => {
    api.get('/public/services')
      .then(res => { setServices(res.data); setFiltered(res.data); })
      .catch(err => console.error("Error fetching services:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = services.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.artistName.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedSkill !== 'All') result = result.filter(s => s.skills?.includes(selectedSkill));
    if (maxPrice !== '') result = result.filter(s => Number(s.price) <= Number(maxPrice));
    setFiltered(result);
  }, [search, maxPrice, selectedSkill, services]);

  const allSkills = ['All', ...new Set(services.flatMap(s => s.skills || []))];

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.filterTitleRow}>
          <span className={styles.filterTitle}>Filters</span>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Search</label>
          <input
            className={styles.input}
            placeholder="Service or artist name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
          >
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Max Price (₱)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="e.g. 5000"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <button
            className={styles.resetBtn}
            onClick={() => { setSearch(''); setMaxPrice(''); setSelectedSkill('All'); }}
          >
            Reset Filters
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Browse Services</h2>
          <p className={styles.headerSub}>{filtered.length} commission packages available</p>
        </div>

        {filtered.length === 0 ? (
          <div className={shared.empty}>
            <p className={shared.emptyText}>No services match your current filters.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(service => (
              <div key={service.id} className={styles.serviceCard}>

                <div
                  className={styles.cardCover}
                  onClick={() => navigate(`/client/artist/${service.artistId}`)}
                >
                  {service.samples?.length > 0
                    ? <img src={service.samples[0]} alt={service.name} />
                    : <div className={styles.noImage}>◻</div>
                  }
                  <div className={styles.ratingBadge}>★ {service.averageRating.toFixed(1)}</div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.serviceName}>{service.name}</div>
                  <div
                    className={styles.artistName}
                    onClick={() => navigate(`/client/artist/${service.artistId}`)}
                  >
                    by <span>{service.artistName}</span>
                  </div>

                  <div className={styles.serviceDetails}>
                    <span className={styles.price}>₱ {Number(service.price).toLocaleString()}</span>
                    {service.turnaround && <span className={styles.turnaround}>· {service.turnaround}</span>}
                  </div>

                  <div className={styles.skillTags}>
                    {service.skills?.slice(0, 3).map(skill => (
                      <span key={skill} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>

                  <button
                    className={styles.bookBtn}
                    onClick={() => navigate(`/client/book/${service.id}`)}
                  >
                    Book Now
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}