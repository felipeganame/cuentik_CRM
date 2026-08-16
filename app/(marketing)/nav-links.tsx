'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './marketing.module.css';

const LINKS = [
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/precios', label: 'Precios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function MarketingNavLinks() {
  const pathname = usePathname();
  return (
    <nav className={styles.navLinksDesktop}>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={pathname === link.href ? styles.navLinkActive : styles.navLink}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
