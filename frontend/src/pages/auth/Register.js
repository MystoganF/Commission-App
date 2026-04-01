import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './register.module.css'; 


const Register = () => {
  const [role, setRole] = useState('client'); // 'client' or 'artist'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    portfolioUrl: '',
    instagram: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // await api.post('/auth/register', { ...formData, role });
      navigate('/'); 
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔍</span> 
          <span className={styles.logoText}>QLTS<strong>Geek</strong></span>
        </div>
        <button onClick={() => navigate('/')} className={styles.navButton}>
          Log in
        </button>
      </nav>

      <div className={styles.splitLayout}>
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            
            <div className={styles.formHeader}>
              <h2 className={styles.title}>Create your account</h2>
            </div>

            {/* Role Selection Toggle */}
            <div className={styles.roleToggle}>
              <button 
                className={role === 'client' ? styles.roleBtnActive : styles.roleBtn}
                onClick={() => setRole('client')}
              >
                I am a Client
              </button>
              <button 
                className={role === 'artist' ? styles.roleBtnActive : styles.roleBtn}
                onClick={() => setRole('artist')}
              >
                I am an Artist
              </button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="text"
                  name="username"
                  placeholder="Full Name"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Dynamic Fields for Artists Only */}
              {role === 'artist' && (
                <div className={styles.artistFields}>
                  <div className={styles.divider}><span>Artist Details</span></div>
                  <div className={styles.inputGroup}>
                    <input
                      className={styles.input}
                      type="text"
                      name="portfolioUrl"
                      placeholder="Portfolio / Personal Website URL"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      className={styles.input}
                      type="text"
                      name="instagram"
                      placeholder="Instagram Handle"
                      value={formData.instagram}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className={styles.actionRow}>
                <button type="submit" className={styles.btnPrimaryFull}>
                  Register as {role === 'artist' ? 'Artist' : 'Client'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className={styles.imageSection}>
          <div className={styles.illustrationPlaceholder}>
            <img 
              src="https://placehold.co/600x400/transparent/7B61FF?text=Register+Illustration" 
              alt="Register Illustration" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;