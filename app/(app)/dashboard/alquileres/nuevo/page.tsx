import { createClient } from '@/lib/supabase/server';
import { listLocalidadesUsadas } from '@/lib/queries';
import { NuevoAlquilerForm } from './nuevo-alquiler-form';

export default async function NuevoAlquilerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();
  const localidadesSugeridas = await listLocalidadesUsadas(supabase);

  return <NuevoAlquilerForm localidadesSugeridas={localidadesSugeridas} inmobiliariaId={profile?.inmobiliaria_id ?? ''} />;
}
