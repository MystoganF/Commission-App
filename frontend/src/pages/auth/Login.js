import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import api from '../../api/axios'; // Uncomment when ready
import styles from './login.module.css'; 

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // const response = await api.post('/auth/login', credentials);
      // localStorage.setItem('token', response.data.token);
      
      // Simulate login route based on a mock role for now
      navigate('/dashboard'); 
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔍</span> 
          <span className={styles.logoText}>QLTS<strong>Geek</strong></span>
        </div>
        <button onClick={() => navigate('/register')} className={styles.navButton}>
          Register
        </button>
      </nav>

      <div className={styles.splitLayout}>
        {/* Left Side - Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.title}>Login to your account</h2>
              <div className={styles.socialLogin}>
                <span className={styles.socialText}>Login with</span>
                <div className={styles.socialIcons}>
                  <button className={styles.socialBtn}>f</button>
                  <button className={styles.socialBtn}>G</button>
                  <button className={styles.socialBtn}>in</button>
                </div>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.passwordWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    className={styles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁️
                  </button>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link to="#" className={styles.forgotLink}>Forgot password?</Link>
                <button type="submit" className={styles.btnPrimary}>
                  Log in
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer inside Left Side */}
          <div className={styles.footer}>
            <span>© Copyright QLTSGeek 2026</span>
            <div className={styles.footerLinks}>
              <Link to="#">Term & Condition</Link>
              <Link to="#">Privacy Policy</Link>
              <Link to="#">Help</Link>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className={styles.imageSection}>
          <div className={styles.illustrationPlaceholder}>
            {/* Replace this div with your actual illustration image */}
            <img 
              src="https://placehold.co/600x400/transparent/7B61FF?text=Illustration+Here" 
              alt="Login Illustration" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;