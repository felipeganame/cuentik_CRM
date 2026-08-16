import { createClient } from '@/lib/supabase/server';
import { listLocalidadesUsadas } from '@/lib/queries';
import { NuevoAlquilerForm } from './nuevo-alquiler-form';

export default async function NuevoAlquilerPage() {
  const supabase = await createClient();
  const localidadesSugeridas = await listLocalidadesUsadas(supabase);

  return <NuevoAlquilerForm localidadesSugeridas={localidadesSugeridas} />;
}
