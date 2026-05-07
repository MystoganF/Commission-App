import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import AuthLayout from './AuthLayout'
import styles from './login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', form)
      
      localStorage.setItem('token', res.data.token)
      const userRole = res.data.role; 
      localStorage.setItem('role', userRole); 

      if (userRole === 'ADMIN') {
        navigate('/admin/overview');
      } else if (userRole === 'CLIENT') {
        navigate('/client/home');
      } else {
        setError('Unauthorized role. Please contact support.');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      asideQuestion="New here?"
      asideLinkText="Create account →"
      asideLinkTo="/register"
      showBgLine={true}
    >
      <div className={styles.formWrap}>
        <div className={styles.formHeader}>
          <span className={styles.formLabel}>Sign in</span>
          <h2 className={styles.formTitle}>Welcome back.</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              autoComplete="email" required
              className={styles.input} placeholder="you@example.com"
              value={form.email} onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              autoComplete="current-password" required
              className={styles.input} placeholder="••••••••"
              value={form.password} onChange={handleChange}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Continue'}
          </button>
        </form>

        <p className={styles.mobileSwitch}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.switchLink}>Register</Link>
        </p>
      </div>
    </AuthLayout>
  )
}