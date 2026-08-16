import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cuentik-crm-pehx.vercel.app'),
  title: 'Cuentik CRM — CRM de alquileres para inmobiliarias de Córdoba',
  description:
    'Gestioná contratos de alquiler, pagos, servicios y vencimientos en un solo lugar. Hecho para inmobiliarias de Córdoba. Primer alquiler gratis, sin tarjeta.',
  openGraph: {
    title: 'Cuentik CRM — CRM de alquileres para inmobiliarias de Córdoba',
    description:
      'Gestioná contratos de alquiler, pagos, servicios y vencimientos en un solo lugar. Primer alquiler gratis, sin tarjeta.',
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Vollkorn:ital,wght@0,500;0,600;0,700;0,900;1,500;1,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/*
          THESIS: A rental ledger, not another blue SaaS dashboard — Cuentik CRM
          reads as a registry of record, where every alquiler is a folio and
          every payment is a stamp, refusing the generic icon-card feature grid.
          OWN-WORLD: Argentine escribanía/libro de registro — deep ledger-green
          ground, brass/gold accents, blue-black ink for confirmed entries, red
          ink reserved for overdue. Vollkorn display (an old-book ledger serif,
          deliberately not one of the common AI-default display faces), IBM
          Plex Mono for folio numbers and labels, Source Sans 3 body.
          STORY: A Córdoba agency owner sees their own workflow — property,
          partes, pagos, servicios — turned into a ledger they'd trust with
          contracts and money, then acts: try free, or talk to a person.
          FIRST VIEWPORT: full-bleed ledger-green hero, Vollkorn headline left,
          a live folio card right (address, monto, an ink stamp animating down
          to AL DÍA on load), primary CTA below headline.
          FORM: escribanía/ledger world, candidate 6 of 7 grounded candidates,
          seed key d41b6298, no staging challenger used — straight structural
          build in the committed identity.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, and DESIGN.md.
        */}
        {children}
      </body>
    </html>
  );
}
