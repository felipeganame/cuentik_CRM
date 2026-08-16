'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPERACIONES = ['Todos', 'Venta', 'Alquiler'] as const;
const TIPOS = ['Todos', 'Departamento', 'Casa', 'Terreno', 'Cochera', 'Local', 'Oficina'];
const ORDENES = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
];

function selectStyle() {
  return { padding: '8px 10px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 12.5, background: '#fff', fontWeight: 600 } as const;
}

export function PaginaPreviewFiltros({ tipos }: { tipos: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const operacion = searchParams.get('operacion') ?? 'Todos';
  const tipo = searchParams.get('tipo') ?? 'Todos';
  const orden = searchParams.get('orden') ?? 'recientes';

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'Todos' && value !== 'recientes') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/mi-pagina-preview?${params.toString()}`);
  }

  const tipoOpciones = tipos.length > 0 ? ['Todos', ...tipos] : TIPOS;

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam('q', new FormData(e.currentTarget).get('q') as string);
        }}
        style={{ flex: '1 1 220px' }}
      >
        <input
          name="q"
          type="text"
          defaultValue={q}
          placeholder="Buscar por título, dirección o localidad…"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 13.5, background: '#fff' }}
        />
      </form>

      <div style={{ display: 'flex', gap: 6 }}>
        {OPERACIONES.map((op) => {
          const active = operacion === op;
          return (
            <button
              key={op}
              type="button"
              onClick={() => setParam('operacion', op)}
              style={{
                padding: '8px 14px',
                border: `1px solid ${active ? 'var(--accent)' : 'oklch(87% 0.007 250)'}`,
                borderRadius: 20,
                background: active ? 'oklch(94% 0.03 40)' : '#fff',
                color: active ? 'var(--accent-deep, var(--accent))' : 'oklch(45% 0.01 255)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {op}
            </button>
          );
        })}
      </div>

      <select value={tipo} onChange={(e) => setParam('tipo', e.target.value)} style={selectStyle()}>
        {tipoOpciones.map((t) => (
          <option key={t} value={t}>
            {t === 'Todos' ? 'Todos los tipos' : t}
          </option>
        ))}
      </select>

      <select value={orden} onChange={(e) => setParam('orden', e.target.value)} style={{ ...selectStyle(), marginLeft: 'auto' }}>
        {ORDENES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
