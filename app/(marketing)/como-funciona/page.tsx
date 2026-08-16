import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../marketing.module.css';
import { MechanismScroller } from './mechanism-scroller';
import { WHATSAPP_HREF } from '../contact-info';

export const metadata: Metadata = {
  title: 'Cómo funciona — Cuentik CRM',
  description: 'De la carga de una propiedad al último pago: así funciona Cuentik CRM para inmobiliarias de Córdoba.',
};

const PROVIDERS = ['Aguas Cordobesas', 'EPEC', 'ECOGAS', 'Cooperativa de Luz y Agua de Villa Allende'];

export default function ComoFuncionaPage() {
  return (
    <>
      <div className={styles.pageHero}>
        <h1 className={`${styles.display} ${styles.pageHeroTitle}`}>Del alta de una propiedad al último pago</h1>
        <p className={styles.pageHeroSub}>
          Cuatro pasos cubren todo el ciclo de un alquiler. Scrolleá para ver cómo se ve cada uno adentro del sistema.
        </p>
      </div>

      <MechanismScroller />

      {/* ---------- roadmap ---------- */}
      <section className={styles.sectionAlt}>
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={`${styles.display} ${styles.sectionTitle}`}>Lo que viene</h2>
            <p className={styles.sectionSub}>
              Cuentik CRM arranca como el CRM del alquiler. Los próximos módulos conectan el resto de lo que ya hacés
              a mano.
            </p>
          </div>

          <div className={styles.roadmapCard}>
            <span className={styles.roadmapTag}>Próximamente</span>
            <h3 className={styles.folioStepTitle} style={{ marginBottom: 8 }}>Conexión directa con tu proveedor de servicios</h3>
            <p className={styles.folioStepText} style={{ marginBottom: 20, maxWidth: '60ch' }}>
              En vez de anotar a mano si se pagó el agua o la luz, Cuentik CRM va a poder consultar el estado
              directamente con el proveedor. Ya estamos trabajando la conexión con:
            </p>
            <div className={styles.roadmapGrid}>
              {PROVIDERS.map((p) => (
                <div key={p} className={styles.providerBadge}>{p}</div>
              ))}
              <div className={styles.providerBadge} style={{ opacity: 0.6 }}>+ seguimos sumando</div>
            </div>
          </div>

          <div className={styles.roadmapCard}>
            <span className={styles.roadmapTag}>Próximamente</span>
            <h3 className={styles.folioStepTitle} style={{ marginBottom: 8 }}>Tu propia página web</h3>
            <p className={styles.folioStepText} style={{ maxWidth: '60ch' }}>
              Cada inmobiliaria va a poder tener su propia página, bajo un subdominio propio (por ejemplo,
              tuinmobiliaria.cuentik.com), para mostrar y gestionar todo lo que tiene disponible para alquilar o
              vender — conectada directamente con lo que ya cargaste en Cuentik CRM.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ textAlign: 'center' }}>
        <div className={styles.sectionHead} style={{ margin: '0 auto 24px' }}>
          <h2 className={`${styles.display} ${styles.sectionTitle}`}>¿Empezamos?</h2>
          <p className={styles.sectionSub} style={{ margin: '0 auto' }}>Tu primer alquiler es gratis, sin tarjeta.</p>
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className={styles.btnPrimary}>Empezar gratis</a>
          <Link href="/precios" className={styles.btnGhost}>Ver precios</Link>
        </div>
      </section>
    </>
  );
}
