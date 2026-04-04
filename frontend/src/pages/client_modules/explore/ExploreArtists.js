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

  // Filter States
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState('All');

  useEffect(() => {
    api.get('/public/artists')
      .then(res => {
        setArtists(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error("Error fetching artists:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = artists.filter(a => 
      a.username.toLowerCase().includes(search.toLowerCase()) &&
      a.averageRating >= minRating
    );

    if (selectedSkill !== 'All') {
      result = result.filter(a => a.skills.includes(selectedSkill));
    }

    setFiltered(result);
  }, [search, minRating, selectedSkill, artists]);

  // Extract all unique skills from the artist list for the dropdown
  const allSkills = ['All', ...new Set(artists.flatMap(a => a.skills))];

  if (loading) return <div className={styles.loading}>Finding artists...</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <aside className={styles.sidebar}>
        <h3 className={styles.filterTitle}>Filters</h3>
        
        <div className={styles.filterGroup}>
          <label className={styles.label}>Search Name</label>
          <input 
            className={styles.input} 
            placeholder="Artist name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Category / Skill</label>
          <select 
            className={styles.input} 
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
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

      <div className={styles.main}>
        <div className={styles.header}>
          <h2>Explore Artists</h2>
          <p>{filtered.length} professional artists found</p>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>No artists match your current filters.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(artist => (
              <div 
                key={artist.id} 
                className={styles.artistCard}
                onClick={() => navigate(`/client/artist/${artist.id}`)}
              >
                <div className={styles.cardTop}>
                  <img src={artist.profilePictureUrl || 'https://via.placeholder.com/150'} alt={artist.username} className={styles.avatar} />
                  <div className={styles.artistInfo}>
                    <h3 className={styles.username}>{artist.username}</h3>
                    <div className={styles.rating}>★ {artist.averageRating.toFixed(1)} <span className={styles.totalReviews}>({artist.totalReviews})</span></div>
                  </div>
                </div>
                <p className={styles.bio}>{artist.bio || "No bio available."}</p>
                <div className={styles.skillTags}>
                  {artist.skills.slice(0, 3).map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                  {artist.skills.length > 3 && <span className={styles.moreSkills}>+{artist.skills.length - 3} more</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}