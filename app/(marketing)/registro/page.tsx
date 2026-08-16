import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import styles from '../marketing.module.css';
import { RegistroForm } from './registro-form';

export const metadata: Metadata = {
  title: 'Empezar gratis — Cuentik CRM',
  description: 'Creá tu cuenta y cargá tu primer alquiler gratis, sin tarjeta.',
};

export default async function RegistroPage() {
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
      <div className={styles.pageHero} style={{ paddingBottom: 16 }}>
        <h1 className={`${styles.display} ${styles.pageHeroTitle}`}>Empezá gratis</h1>
        <p className={styles.pageHeroSub}>
          Creá tu cuenta y cargá tu primer alquiler sin costo, sin tarjeta. Cuando quieras agregar un segundo, te
          avisamos antes de que empiece cualquier cobro.
        </p>
      </div>
      <section className={styles.section} style={{ paddingTop: 8 }}>
        <RegistroForm />
      </section>
    </>
  );
}
