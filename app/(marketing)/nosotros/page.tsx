import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../marketing.module.css';
import { WHATSAPP_HREF } from '../contact-info';

export const metadata: Metadata = {
  title: 'Nosotros — Cuentik CRM',
  description: 'Por qué existe Cuentik CRM y para quién lo construimos.',
};

export default function NosotrosPage() {
  return (
    <>
      <div className={styles.pageHero}>
        <h1 className={`${styles.display} ${styles.pageHeroTitle}`}>Hecho para inmobiliarias de Córdoba</h1>
        <p className={styles.pageHeroSub}>
          No un CRM genérico traducido al español: pensado desde el principio para cómo se maneja un alquiler acá.
        </p>
      </div>

      <section className={styles.section} style={{ paddingTop: 8 }}>
        <div className={styles.ledgerList} style={{ maxWidth: 720 }}>
          <div className={styles.ledgerItem}>
            <span className={styles.ledgerMark}>§</span>
            <div>
              <h3 className={styles.ledgerItemTitle}>Por qué existe</h3>
              <p className={styles.ledgerItemText}>
                La mayoría de las inmobiliarias en Córdoba manejan sus alquileres entre planillas de cálculo,
                carpetas físicas y chats de WhatsApp. Cuentik CRM junta todo eso en un solo lugar: quién pagó, quién
                debe, qué servicio falta y cuándo vence cada contrato.
              </p>
            </div>
          </div>
          <div className={styles.ledgerItem}>
            <span className={styles.ledgerMark}>§</span>
            <div>
              <h3 className={styles.ledgerItemTitle}>Pensado para acá, no adaptado de afuera</h3>
              <p className={styles.ledgerItemText}>
                Actualización de alquileres por índice (ICL, IPC) como se usa en Argentina, montos en pesos, y
                contacto directo por WhatsApp con locador y locatario — no son un agregado, son el punto de partida.
              </p>
            </div>
          </div>
          <div className={styles.ledgerItem}>
            <span className={styles.ledgerMark}>§</span>
            <div>
              <h3 className={styles.ledgerItemTitle}>Recién empezamos</h3>
              <p className={styles.ledgerItemText}>
                Cuentik CRM es un producto en construcción activa, hecho en Córdoba. El módulo de alquileres es el
                primero; después de este vienen la conexión con proveedores de servicios y la página web propia
                para cada inmobiliaria. Si algo no te cierra o te falta, nos escribís y lo charlamos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.section} style={{ textAlign: 'center' }}>
          <div className={styles.sectionHead} style={{ margin: '0 auto 24px' }}>
            <h2 className={`${styles.display} ${styles.sectionTitle}`}>¿Charlamos?</h2>
            <p className={styles.sectionSub} style={{ margin: '0 auto' }}>Contanos cómo trabajás hoy y vemos si te sirve.</p>
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className={styles.btnPrimary}>Escribinos</a>
            <Link href="/contacto" className={styles.btnGhost}>Ver todos los contactos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
