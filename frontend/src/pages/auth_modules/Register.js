import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import AuthLayout from './AuthLayout'
import styles from './register.module.css'

const ROLES = [
  { value: 'CLIENT', label: 'Client', desc: 'Browse & book artists' },
  { value: 'ADMIN', label: 'Artist', desc: 'Showcase & sell your work' },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    phoneNumber: '', facebook: '', instagram: '', twitter: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRoleSelect = val => {
    setRole(val)
    setStep(2)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, role }
      const res = await api.post('/auth/register', payload)
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', role) 

      if (role === 'ADMIN') {
        navigate('/admin/overview');
      } else {
        navigate('/client/home');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      asideQuestion="Have an account?"
      asideLinkText="Sign in →"
      asideLinkTo="/"
    >
      <div className={styles.formWrap}>

        {/* Step indicator */}
        <div className={styles.stepRow}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''}`} />
          <div className={styles.stepConnector} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`} />
        </div>

        {step === 1 && (
          <div className={`${styles.roleStep} ${styles.stepContainer}`}>
            <div className={styles.formHeader}>
              <span className={styles.formLabel}>Step 1 of 2</span>
              <h2 className={styles.formTitle}>You are a…</h2>
            </div>
            <div className={styles.roleCards}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`${styles.roleCard} ${role === r.value ? styles.roleCardActive : ''}`}
                  onClick={() => handleRoleSelect(r.value)}
                >
                  <span className={styles.roleLabel}>{r.label}</span>
                  <span className={styles.roleDesc}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContainer}>
            <div className={styles.formHeader}>
              <span className={styles.formLabel}>
                Step 2 of 2 &nbsp;·&nbsp; {role === 'ADMIN' ? 'Artist' : 'Client'}
              </span>
              <h2 className={styles.formTitle}>Create your account.</h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Username</label>
                  <input name="username" className={styles.input} placeholder="yourname" value={form.username} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone</label>
                  <input name="phoneNumber" className={styles.input} placeholder="+63 9xx xxx xxxx" value={form.phoneNumber} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input name="email" type="email" className={styles.input} placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input name="password" type="password" className={styles.input} placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>

              {/* Social Links - Unlocked for everyone */}
              <div className={styles.socialSection}>
                <span className={styles.socialLabel}>Social links <em>(optional)</em></span>
                <div className={styles.socialGrid}>
                  <div className={styles.socialField}>
                    <span className={styles.socialPrefix}>fb.com/</span>
                    <input name="facebook" className={styles.socialInput} placeholder="yourpage" value={form.facebook} onChange={handleChange} />
                  </div>
                  <div className={styles.socialField}>
                    <span className={styles.socialPrefix}>@</span>
                    <input name="instagram" className={styles.socialInput} placeholder="instagram" value={form.instagram} onChange={handleChange} />
                  </div>
                  <div className={styles.socialField}>
                    <span className={styles.socialPrefix}>@</span>
                    <input name="twitter" className={styles.socialInput} placeholder="twitter / x" value={form.twitter} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.btnRow}>
                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className={styles.btn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className={styles.mobileSwitch}>
          Already have an account? <Link to="/" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}