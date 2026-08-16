import { PAIS_RECOMENDADO } from './paises';

export function formatTelefono(dial: string, area: string, numero: string): string {
  const d = dial.replace(/\D/g, '') || PAIS_RECOMENDADO.dial;
  const a = area.replace(/\D/g, '');
  const n = numero.replace(/\D/g, '');
  if (!a && !n) return '';
  return `+${d} ${a} ${n}`.trim();
}

export function parseTelefono(value: string | null | undefined): { dial: string; area: string; numero: string } {
  if (!value) return { dial: PAIS_RECOMENDADO.dial, area: '', numero: '' };

  const conPrefijo = value.match(/^\+(\d{1,3})\s*(.*)$/);
  if (conPrefijo) {
    const [, dial, resto] = conPrefijo;
    const [area = '', ...rest] = resto.trim().split(/\s+/);
    return { dial, area: area.replace(/\D/g, ''), numero: rest.join('').replace(/\D/g, '') };
  }

  // Formato legado sin código de país (datos previos a esta función).
  const [area = '', ...rest] = value.trim().split(/\s+/);
  return { dial: PAIS_RECOMENDADO.dial, area: area.replace(/\D/g, ''), numero: rest.join('').replace(/\D/g, '') };
}

export function waDigits(value: string | null | undefined): string {
  const { dial, area, numero } = parseTelefono(value);
  return `${dial}${area}${numero}`;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
