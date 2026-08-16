import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUsoAlquileres, listLocalidadesUsadas } from '@/lib/queries';
import { NuevoAlquilerForm } from './nuevo-alquiler-form';

export default async function NuevoAlquilerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();
  const inmobiliariaId = profile?.inmobiliaria_id ?? '';

  const { usados, limite, exentoCobro } = await getUsoAlquileres(supabase, inmobiliariaId);
  if (usados >= limite) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Llegaste al límite de tu plan</div>
        <div style={{ fontSize: 13.5, color: 'oklch(50% 0.01 255)', marginBottom: 20 }}>
          Tenés {usados} de {limite} alquileres permitidos. Contactá a Cuentik CRM para ampliar tu plan y seguir cargando.
        </div>
        <Link href="/dashboard" style={{ color: 'oklch(55% 0.16 250)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
          ← Volver a alquileres
        </Link>
      </div>
    );
  }

  const localidadesSugeridas = await listLocalidadesUsadas(supabase);
  const mostrarAvisoPago = usados === 1 && !exentoCobro;

  return (
    <NuevoAlquilerForm
      localidadesSugeridas={localidadesSugeridas}
      inmobiliariaId={inmobiliariaId}
      mostrarAvisoPago={mostrarAvisoPago}
    />
  );
}
