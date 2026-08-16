import Link from 'next/link';
import styles from './marketing.module.css';
import { MarketingNavLinks } from './nav-links';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          <span className={styles.wordmarkSeal}>C</span>
          <span className={styles.display} style={{ fontSize: 18, fontWeight: 600 }}>
            Cuentik CRM
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 3vw, 32px)' }}>
          <MarketingNavLinks />
          <Link href="/login" className={styles.btnGhost}>Iniciar sesión</Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className={styles.footer}>
        <span className={styles.mono}>Cuentik CRM — Córdoba, Argentina</span>
        <div className={styles.footerLinks}>
          <Link href="/como-funciona" className={styles.navLink}>Cómo funciona</Link>
          <Link href="/precios" className={styles.navLink}>Precios</Link>
          <Link href="/nosotros" className={styles.navLink}>Nosotros</Link>
          <Link href="/contacto" className={styles.navLink}>Contacto</Link>
        </div>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
