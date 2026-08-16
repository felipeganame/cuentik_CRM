import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getInmobiliaria, getPrecioPorAlquiler, getUsoAlquileres } from '@/lib/queries';
import { estadoCobro } from '@/lib/billing';
import { InmobiliariaForm } from './form';

export default async function InmobiliariaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const inmobiliaria = await getInmobiliaria(supabase, id);
  if (!inmobiliaria) notFound();

  const [{ usados }, precioPorAlquiler] = await Promise.all([
    getUsoAlquileres(supabase, id),
    getPrecioPorAlquiler(supabase),
  ]);

  return (
    <div style={{ maxWidth: 520 }}>
      <Link href="/superadmin" style={{ border: 'none', background: 'none', color: 'oklch(50% 0.01 255)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 14 }}>
        ← Volver a inmobiliarias
      </Link>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>{inmobiliaria.nombre}</div>
      <InmobiliariaForm
        inmobiliaria={inmobiliaria}
        montoMensual={precioPorAlquiler * usados}
        estadoCobro={estadoCobro(inmobiliaria.fecha_proximo_cobro)}
      />
    </div>
  );
}
