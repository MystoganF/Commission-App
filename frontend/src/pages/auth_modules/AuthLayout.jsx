import { Link } from 'react-router-dom'
import logoImg from '../../assets/logo.png'
import styles from './AuthLayout.module.css'

export default function AuthLayout({ 
  children, 
  asideQuestion, 
  asideLinkText, 
  asideLinkTo, 
  showBgLine = false 
}) {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      {showBgLine && <div className={styles.bgLine} />}

      <div className={styles.container}>
        {/* Shared Left Aside */}
        <aside className={styles.aside}>
          <div className={styles.asideMark}>✦</div>
          <div className={styles.asideText}>
            <img src={logoImg} alt="CRTV ZONE Logo" className={styles.brandLogo} />
            <p className={styles.tagline}>Where craft meets commission.</p>
          </div>
          <div className={styles.asideFooter}>
            <span>{asideQuestion}</span>
            <Link to={asideLinkTo} className={styles.switchLink}>{asideLinkText}</Link>
          </div>
        </aside>

        {/* Dynamic Right Main Content */}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}