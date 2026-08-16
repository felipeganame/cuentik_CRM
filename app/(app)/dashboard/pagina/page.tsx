import { createClient } from '@/lib/supabase/server';
import { listPublicaciones } from '@/lib/queries';
import { PaginaContenidoForm } from './contenido-form';
import { PublicacionesList } from './publicaciones-list';

export default async function PaginaWebPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();
  const inmobiliariaId = profile?.inmobiliaria_id ?? '';

  const { data: inmobiliaria } = await supabase
    .from('inmobiliarias')
    .select('pagina_bio, pagina_ubicacion')
    .eq('id', inmobiliariaId)
    .single();

  const publicaciones = await listPublicaciones(supabase, inmobiliariaId);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, fontFamily: 'Vollkorn, serif' }}>Mi página web</div>
      <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 22, maxWidth: 640, lineHeight: 1.5 }}>
        Todavía no publicamos páginas propias con subdominio — armá el contenido y las publicaciones acá, y usá la
        vista previa para ver cómo va a quedar. Te avisamos apenas esté disponible publicarla de verdad.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
        <PaginaContenidoForm bio={inmobiliaria?.pagina_bio ?? ''} ubicacion={inmobiliaria?.pagina_ubicacion ?? ''} />
        <PublicacionesList publicaciones={publicaciones} />
      </div>
    </div>
  );
}
