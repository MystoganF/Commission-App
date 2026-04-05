import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './Explore.module.css';

export default function ExploreArtists() {
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState('All');

  useEffect(() => {
    api.get('/public/artists')
      .then(res => { setArtists(res.data); setFiltered(res.data); })
      .catch(err => console.error("Error fetching artists:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = artists.filter(a =>
      a.username.toLowerCase().includes(search.toLowerCase()) &&
      a.averageRating >= minRating
    );
    if (selectedSkill !== 'All') result = result.filter(a => a.skills.includes(selectedSkill));
    setFiltered(result);
  }, [search, minRating, selectedSkill, artists]);

  const allSkills = ['All', ...new Set(artists.flatMap(a => a.skills))];

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.filterTitleRow}>
          <span className={styles.filterTitle}>Filters</span>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Search Name</label>
          <input
            className={styles.input}
            placeholder="Artist name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Category / Skill</label>
          <select
            className={styles.input}
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
          >
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Minimum Rating</label>
          <div className={styles.ratingOptions}>
            {[0, 3, 4, 4.5].map(r => (
              <button
                key={r}
                className={`${styles.rateBtn} ${minRating === r ? styles.rateActive : ''}`}
                onClick={() => setMinRating(r)}
              >
                {r === 0 ? 'Any' : `${r}★ & Up`}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Explore Artists</h2>
          <p className={styles.headerSub}>{filtered.length} artists found</p>
        </div>

        {filtered.length === 0 ? (
          <div className={shared.empty}>
            <p className={shared.emptyText}>No artists match your current filters.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(artist => (
              <div key={artist.id} className={styles.artistCard}>

                <div className={styles.cardCover} onClick={() => navigate(`/client/artist/${artist.id}`)}>
                  <img
                    src={artist.profilePictureUrl || `https://ui-avatars.com/api/?name=${artist.username}&background=1a1a1a&color=888`}
                    alt={artist.username}
                  />
                  <div className={styles.ratingBadge}>★ {artist.averageRating.toFixed(1)}</div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.username}>{artist.username}</div>
                  <div className={styles.reviewCount}>({artist.totalReviews} reviews)</div>

                  <div className={styles.skillTags}>
                    {artist.skills.slice(0, 3).map(skill => (
                      <span key={skill} className={styles.skillTag}>{skill}</span>
                    ))}
                    {artist.skills.length > 3 && (
                      <span className={styles.moreSkills}>+{artist.skills.length - 3}</span>
                    )}
                  </div>

                  <button
                    className={styles.viewBtn}
                    onClick={() => navigate(`/client/artist/${artist.id}`)}
                  >
                    View Portfolio
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