import type { Metadata } from 'next';
import styles from '../marketing.module.css';
import { WHATSAPP_HREF } from '../contact-info';

export const metadata: Metadata = {
  title: 'Precios — Cuentik CRM',
  description: 'Primer alquiler gratis, sin tarjeta. Después, $1.000 ARS por alquiler activo al mes.',
};

export default function PreciosPage() {
  return (
    <>
      <div className={styles.pageHero} style={{ textAlign: 'center' }}>
        <h1 className={`${styles.display} ${styles.pageHeroTitle}`}>Un solo plan, sin letra chica</h1>
        <p className={styles.pageHeroSub} style={{ margin: '0 auto' }}>
          Pagás por lo que usás. Nada de niveles por cantidad de usuarios ni límites raros.
        </p>
      </div>

      <div className={styles.section} style={{ paddingTop: 24 }}>
        <div className={styles.pricingCard}>
          <span className={styles.pricingBadge}>Primer alquiler gratis</span>
          <div className={styles.priceRow}>
            <span className={styles.priceNum}>$1.000</span>
            <span className={styles.priceUnit}>ARS por alquiler activo / mes</span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'color-mix(in oklch, var(--ledger-deep) 65%, transparent)', margin: '18px 0 0', maxWidth: '52ch' }}>
            Empezás con un alquiler sin costo y sin tarjeta. Cuando cargás el segundo, ahí arranca el cobro: $1.000
            por cada alquiler activo que tengas cargado, todos los meses.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: 'color-mix(in oklch, var(--ledger-deep) 55%, transparent)', margin: '14px 0 0', maxWidth: '52ch' }}>
            Este precio es el del módulo de gestión de alquileres, el que existe hoy. A medida que sumemos otros
            módulos (conexión con proveedores de servicios, página web propia, etc.) cada uno va a tener su propio
            costo — no va a cambiar de golpe lo que ya estás pagando.
          </p>
          <div style={{ marginTop: 24 }}>
            <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className={styles.btnPrimary}>
              Empezar gratis
            </a>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={`${styles.display} ${styles.sectionTitle}`}>Preguntas frecuentes</h2>
        </div>
        <div className={styles.ledgerList} style={{ maxWidth: 720 }}>
          <div className={styles.ledgerItem}>
            <span className={styles.ledgerMark}>§</span>
            <div>
              <h3 className={styles.ledgerItemTitle}>¿Necesito tarjeta para empezar?</h3>
              <p className={styles.ledgerItemText}>No. El primer alquiler es gratis y no te pedimos ningún medio de pago para probarlo.</p>
            </div>
          </div>
          <div className={styles.ledgerItem}>
            <span className={styles.ledgerMark}>§</span>
            <div>
              <h3 className={styles.ledgerItemTitle}>¿Qué pasa cuando cargo el segundo alquiler?</h3>
              <p className={styles.ledgerItemText}>Te avisamos antes de que empiece el cobro, para que sepas exactamente qué vas a pagar y cuándo.</p>
            </div>
          </div>
          <div className={styles.ledgerItem}>
            <span className={styles.ledgerMark}>§</span>
            <div>
              <h3 className={styles.ledgerItemTitle}>¿Hay contrato o permanencia mínima?</h3>
              <p className={styles.ledgerItemText}>No. Pagás mes a mes por los alquileres activos que tengas cargados.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
