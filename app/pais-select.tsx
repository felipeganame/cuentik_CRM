'use client';

import { PAISES } from '@/lib/paises';

export function PaisSelectOptions() {
  return (
    <>
      {PAISES.map((p) => (
        <option key={p.iso} value={p.dial}>
          {p.bandera} +{p.dial} {p.nombre}
        </option>
      ))}
    </>
  );
}

export function paisSelectStyle() {
  return { padding: '9px 8px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5, width: 92 } as const;
}
