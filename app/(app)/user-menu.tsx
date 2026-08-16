'use client';

import { useEffect, useRef, useState } from 'react';
import { logout } from './actions';

export function UserMenu({ nombre, inmobiliariaNombre, logoUrl }: { nombre: string; inmobiliariaNombre: string; logoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', borderTop: '1px solid oklch(28% 0.02 258)', paddingTop: 14 }}>
      {open && (
        <div
          style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8,
            background: '#fff', border: '1px solid oklch(88% 0.007 250)', borderRadius: 10,
            boxShadow: '0 10px 30px oklch(20% 0.02 258 / 0.2)', overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 14px', borderBottom: '1px solid oklch(92% 0.006 250)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'oklch(25% 0.01 258)' }}>{inmobiliariaNombre || nombre}</div>
            {inmobiliariaNombre && <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)' }}>{nombre}</div>}
          </div>
          <form action={logout}>
            <button
              type="submit"
              style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 12.5, color: 'oklch(56% 0.19 25)', cursor: 'pointer' }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', width: '100%', textAlign: 'left' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: logoUrl ? '#fff' : 'oklch(40% 0.02 258)', flex: 'none', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'oklch(75% 0.01 258)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {inmobiliariaNombre || nombre || 'Cuenta'}
        </div>
      </button>
    </div>
  );
}
