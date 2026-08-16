'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../marketing.module.css';

type StepMock =
  | { kind: 'fields'; title: string; rows: { label: string; value: string }[] }
  | { kind: 'stamps'; title: string; rows: { label: string; status: 'Al día' | 'Pendiente' | 'En mora' }[] }
  | { kind: 'alerts'; title: string; rows: { label: string; value: string }[] };

type Step = {
  num: string;
  title: string;
  text: string;
  mock: StepMock;
};

const STEPS: Step[] = [
  {
    num: 'Folio 01',
    title: 'Cargás la propiedad',
    text: 'Dirección, localidad, tipo, y las partes: locador, locatario y garantes, con sus datos de contacto.',
    mock: {
      kind: 'fields',
      title: 'Nueva propiedad',
      rows: [
        { label: 'Dirección', value: 'Bv. Illia 245, 3B' },
        { label: 'Localidad', value: 'Nueva Córdoba' },
        { label: 'Locador', value: 'Elena Suárez' },
        { label: 'Locatario', value: 'Fabián Torres' },
      ],
    },
  },
  {
    num: 'Folio 02',
    title: 'Definís las condiciones',
    text: 'Monto, día de pago, forma de actualización (por índice o porcentaje) y qué servicios corresponden a cada parte.',
    mock: {
      kind: 'fields',
      title: 'Condiciones de pago',
      rows: [
        { label: 'Monto', value: '$185.000' },
        { label: 'Día de pago', value: '10' },
        { label: 'Actualización', value: 'ICL · trimestral' },
        { label: 'Servicios', value: 'Agua, luz, gas' },
      ],
    },
  },
  {
    num: 'Folio 03',
    title: 'Cada mes, sabés quién pagó',
    text: 'El dashboard te muestra de un vistazo qué alquileres están al día, pendientes o en deuda — sin abrir carpeta por carpeta.',
    mock: {
      kind: 'stamps',
      title: 'Estado de pago',
      rows: [
        { label: 'Depto 3B, Nueva Córdoba', status: 'Al día' },
        { label: 'Local 4, Centro', status: 'Pendiente' },
        { label: 'Casa 12, Cerro de las Rosas', status: 'En mora' },
      ],
    },
  },
  {
    num: 'Folio 04',
    title: 'Nada se te pasa',
    text: 'Servicios sin pagar y contratos por vencer quedan a la vista, no escondidos en una carpeta ni en un chat viejo de WhatsApp.',
    mock: {
      kind: 'alerts',
      title: 'Pendientes',
      rows: [
        { label: 'Contrato Depto 3B', value: 'vence en 12 días' },
        { label: 'Servicio agua, Casa 12', value: 'sin pagar' },
        { label: 'Servicio gas, Local 4', value: 'sin pagar' },
      ],
    },
  },
];

function AppMock({ mock }: { mock: StepMock }) {
  return (
    <div className={styles.appMock}>
      <div className={styles.appMockHeader}>
        <span className={styles.appMockTitle}>{mock.title}</span>
        <span className={styles.appMockTitle}>Cuentik CRM</span>
      </div>
      {mock.kind === 'stamps'
        ? mock.rows.map((row, i) => (
            <div
              key={row.label}
              className={styles.appMockField}
              style={{ animationDelay: `${i * 0.1}s`, alignItems: 'center' }}
            >
              <span>{row.label}</span>
              <span
                className={styles.stampBadge}
                style={{
                  color:
                    row.status === 'Al día' ? 'var(--ink)' : row.status === 'Pendiente' ? 'oklch(55% 0.14 70)' : 'var(--ink-red)',
                }}
              >
                {row.status}
              </span>
            </div>
          ))
        : mock.rows.map((row, i) => (
            <div key={row.label} className={styles.appMockField} style={{ animationDelay: `${i * 0.1}s` }}>
              <span style={{ color: 'color-mix(in oklch, var(--ledger-deep) 60%, transparent)' }}>{row.label}</span>
              <span style={{ fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
    </div>
  );
}

export function MechanismScroller() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex((el) => el === entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    for (const el of stepRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.mechanismLayout}>
      <div className={styles.mechanismSticky}>
        <AppMock mock={STEPS[activeIndex].mock} />
      </div>
      <div className={styles.mechanismStepsCol}>
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={`${styles.mechanismStep} ${i === activeIndex ? styles.mechanismStepActive : ''}`}
          >
            <span className={`${styles.mono} ${styles.mechanismStepNum}`}>{step.num}</span>
            <h3 className={styles.mechanismStepTitle}>{step.title}</h3>
            <p className={styles.mechanismStepText}>{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
