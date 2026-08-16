import type { Metadata } from 'next';
import styles from '../marketing.module.css';
import { WHATSAPP_HREF, CONTACT_EMAIL } from '../contact-info';

export const metadata: Metadata = {
  title: 'Contacto — Cuentik CRM',
  description: 'Escribinos por WhatsApp o email. Te ayudamos a cargar tu primera propiedad.',
};

export default function ContactoPage() {
  return (
    <>
      <div className={styles.pageHero}>
        <h1 className={`${styles.display} ${styles.pageHeroTitle}`}>Hablemos</h1>
        <p className={styles.pageHeroSub}>
          ¿Tenés dudas, querés que te ayudemos a cargar tu primera propiedad, o algo no te cierra? Escribinos, te
          contesta una persona.
        </p>
      </div>

      <section className={styles.section} style={{ paddingTop: 8 }}>
        <div className={styles.contactGrid}>
          <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className={styles.contactCard}>
            <span className={styles.contactLabel}>WhatsApp</span>
            <span className={styles.contactValue}>+54 9 351 336 3008</span>
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactCard}>
            <span className={styles.contactLabel}>Email</span>
            <span className={styles.contactValue}>{CONTACT_EMAIL}</span>
          </a>
        </div>
      </section>
    </>
  );
}
