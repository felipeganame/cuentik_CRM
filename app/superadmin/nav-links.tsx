'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/superadmin', label: 'Inmobiliarias', match: (p: string) => p === '/superadmin' || p.startsWith('/superadmin/nueva') || /^\/superadmin\/[^/]+$/.test(p) },
  { href: '/superadmin/seguridad', label: 'Seguridad', match: (p: string) => p === '/superadmin/seguridad' },
];

export function SuperadminNavLinks() {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'block',
              background: active ? 'oklch(28% 0.03 255)' : 'transparent',
              color: active ? '#fff' : 'oklch(50% 0.02 258)',
              fontSize: 13.5,
              fontWeight: active ? 600 : 400,
              padding: '9px 10px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
