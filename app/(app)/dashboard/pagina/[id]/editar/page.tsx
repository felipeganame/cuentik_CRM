import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPublicacionConFotos } from '@/lib/queries';
import { PublicacionForm } from '../../publicacion-form';

export default async function EditarPublicacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();

  const result = await getPublicacionConFotos(supabase, id);
  if (!result) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>No encontramos esa publicación</div>
        <Link href="/dashboard/pagina" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
          ← Volver a mi página
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22, fontFamily: 'Vollkorn, serif' }}>Editar publicación</div>
      <PublicacionForm
        mode="editar"
        inmobiliariaId={profile?.inmobiliaria_id ?? ''}
        publicacion={result.publicacion}
        fotos={result.fotos}
      />
    </div>
  );
}
