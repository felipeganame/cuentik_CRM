export type EstadoCobro = 'Pagado' | 'Pendiente' | 'En mora';

const DIAS_GRACIA = 2;

export function estadoCobro(fechaProximoCobro: string | null, exento: boolean = false, hoy: Date = new Date()): EstadoCobro {
  if (exento) return 'Pagado';
  if (!fechaProximoCobro) return 'Pagado';
  const due = new Date(fechaProximoCobro + 'T00:00:00');
  const graceEnd = new Date(due);
  graceEnd.setDate(graceEnd.getDate() + DIAS_GRACIA);
  const today = new Date(hoy);
  today.setHours(0, 0, 0, 0);

  if (today < due) return 'Pagado';
  if (today <= graceEnd) return 'Pendiente';
  return 'En mora';
}

export function avanzarUnMes(fechaISO: string): string {
  const d = new Date(fechaISO + 'T00:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function proximoCicloDesdeHoy(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return toISODate(d);
}
