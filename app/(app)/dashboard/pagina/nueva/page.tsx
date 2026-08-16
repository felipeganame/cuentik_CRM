import { createClient } from '@/lib/supabase/server';
import { PublicacionForm } from '../publicacion-form';

export default async function NuevaPublicacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22, fontFamily: 'Vollkorn, serif' }}>Nueva publicación</div>
      <PublicacionForm mode="crear" inmobiliariaId={profile?.inmobiliaria_id ?? ''} />
    </div>
  );
}
