import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import styles from './marketing.module.css';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    redirect(profile?.role === 'superadmin' ? '/superadmin' : '/dashboard');
  }

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className={styles.hero}>
        <div>
          <h1 className={`${styles.display} ${styles.heroHeadline}`}>
            El registro de tus alquileres,<br />siempre <em>al día</em>.
          </h1>
          <p className={styles.heroSub}>
            Cuentik CRM es el CRM de alquileres pensado para inmobiliarias de Córdoba: contratos, pagos, servicios
            y vencimientos, todo en un solo lugar — sin planillas sueltas ni carpetas de papel.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/registro" className={styles.btnPrimary}>
              Empezar gratis
            </Link>
            <Link href="/como-funciona" className={styles.btnGhost}>Ver cómo funciona</Link>
          </div>
          <div className={`${styles.mono} ${styles.heroFinePrint}`}>
            Tu primer alquiler es gratis. Sin tarjeta.
          </div>
        </div>

        <div>
          <div className={styles.folioCard}>
            <div className={`${styles.folioTopRow} ${styles.mono}`}>
              <span className={styles.folioNum}>FOLIO N.º 0142</span>
              <span className={styles.folioNum}>AGO 2026</span>
            </div>
            <div className={styles.folioLine}>
              <span className={styles.folioLabel}>Propiedad</span>
              <span className={styles.folioValue}>Bv. Illia 245, 3B</span>
            </div>
            <div className={styles.folioLine}>
              <span className={styles.folioLabel}>Locatario</span>
              <span className={styles.folioValue}>Fabián Torres</span>
            </div>
            <div className={styles.folioLine}>
              <span className={styles.folioLabel}>Monto</span>
              <span className={styles.folioValue}>$185.000</span>
            </div>
            <div className={styles.folioLine}>
              <span className={styles.folioLabel}>Vence día</span>
              <span className={styles.folioValue}>10</span>
            </div>
            <div className={styles.stamp}>Al día</div>
          </div>
        </div>
      </section>

      {/* ---------- mechanism teaser ---------- */}
      <section className={styles.sectionAlt}>
        <div className={styles.section} style={{ paddingBottom: 0 }}>
          <div className={styles.sectionHead}>
            <h2 className={`${styles.display} ${styles.sectionTitle}`}>Cómo funciona</h2>
            <p className={styles.sectionSub}>
              Cuatro folios cubren todo el ciclo de un alquiler, desde que se firma hasta el último pago.
            </p>
          </div>
        </div>
        <div className={styles.folioGrid}>
          <div className={styles.folioStep}>
            <span className={`${styles.mono} ${styles.folioStepNum}`}>Folio 01</span>
            <h3 className={styles.folioStepTitle}>Cargás la propiedad</h3>
            <p className={styles.folioStepText}>
              Dirección, tipo, y las partes: locador, locatario y garantes, con sus datos de contacto.
            </p>
          </div>
          <div className={styles.folioStep}>
            <span className={`${styles.mono} ${styles.folioStepNum}`}>Folio 02</span>
            <h3 className={styles.folioStepTitle}>Definís las condiciones</h3>
            <p className={styles.folioStepText}>
              Monto, día de pago, forma de actualización y qué servicios corresponden.
            </p>
          </div>
          <div className={styles.folioStep}>
            <span className={`${styles.mono} ${styles.folioStepNum}`}>Folio 03</span>
            <h3 className={styles.folioStepTitle}>Cada mes, sabés quién pagó</h3>
            <p className={styles.folioStepText}>
              El dashboard te muestra de un vistazo qué alquileres están al día, pendientes o en deuda.
            </p>
          </div>
          <div className={styles.folioStep}>
            <span className={`${styles.mono} ${styles.folioStepNum}`}>Folio 04</span>
            <h3 className={styles.folioStepTitle}>Nada se te pasa</h3>
            <p className={styles.folioStepText}>
              Servicios sin pagar y contratos por vencer quedan a la vista, no escondidos en una carpeta.
            </p>
          </div>
        </div>
        <div className={styles.section} style={{ paddingTop: 32 }}>
          <Link href="/como-funciona" className={styles.btnGhost}>Ver el recorrido completo</Link>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={`${styles.display} ${styles.sectionTitle}`}>Lo que resuelve</h2>
          <p className={styles.sectionSub}>
            Pensado para el día a día de una inmobiliaria en Argentina, no para un mercado genérico.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.stampShowcase}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted-text)' }}>
              Estado de pago
            </div>
            <div className={styles.stampRow}>
              <span>Depto 3B, Nueva Córdoba</span>
              <span className={styles.stampBadge} style={{ color: 'var(--ink)' }}>Al día</span>
            </div>
            <div className={styles.stampRow}>
              <span>Local 4, Centro</span>
              <span className={styles.stampBadge} style={{ color: 'oklch(55% 0.14 70)' }}>Pendiente</span>
            </div>
            <div className={styles.stampRow}>
              <span>Casa 12, Cerro de las Rosas</span>
              <span className={styles.stampBadge} style={{ color: 'var(--ink-red)' }}>En mora</span>
            </div>
          </div>
          <div className={styles.ledgerList}>
            <div className={styles.ledgerItem}>
              <span className={styles.ledgerMark}>§</span>
              <div>
                <h3 className={styles.ledgerItemTitle}>Servicios por propiedad</h3>
                <p className={styles.ledgerItemText}>Agua, luz, gas, municipalidad, rentas y expensas: quién paga cada uno y si está al día.</p>
              </div>
            </div>
            <div className={styles.ledgerItem}>
              <span className={styles.ledgerMark}>§</span>
              <div>
                <h3 className={styles.ledgerItemTitle}>Fotos y contrato en un lugar</h3>
                <p className={styles.ledgerItemText}>Subís el contrato en PDF y las fotos de la propiedad. Nada de carpetas físicas ni WhatsApp perdido.</p>
              </div>
            </div>
            <div className={styles.ledgerItem}>
              <span className={styles.ledgerMark}>§</span>
              <div>
                <h3 className={styles.ledgerItemTitle}>Contacto directo por WhatsApp</h3>
                <p className={styles.ledgerItemText}>Un clic desde la ficha del locador o locatario para escribirle, sin buscar el número.</p>
              </div>
            </div>
            <div className={styles.ledgerItem}>
              <span className={styles.ledgerMark}>§</span>
              <div>
                <h3 className={styles.ledgerItemTitle}>Actualización de alquileres</h3>
                <p className={styles.ledgerItemText}>Por índice (ICL, IPC) o porcentaje fijo, con la frecuencia que corresponda a cada contrato.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- pricing teaser ---------- */}
      <section className={styles.sectionAlt}>
        <div className={styles.section} style={{ textAlign: 'center' }}>
          <div className={styles.sectionHead} style={{ margin: '0 auto 32px' }}>
            <h2 className={`${styles.display} ${styles.sectionTitle}`}>Un solo plan, sin letra chica</h2>
            <p className={styles.sectionSub} style={{ margin: '0 auto' }}>
              Primer alquiler gratis. Después, $1.000 por alquiler activo al mes.
            </p>
          </div>
          <Link href="/precios" className={styles.btnPrimary}>Ver precios</Link>
        </div>
      </section>
    </>
  );
}
