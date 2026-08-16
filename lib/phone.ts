import { PAIS_RECOMENDADO } from './paises';

export function formatTelefono(dial: string, numero: string): string {
  const d = dial.replace(/\D/g, '') || PAIS_RECOMENDADO.dial;
  const n = numero.replace(/\D/g, '');
  if (!n) return '';
  return `+${d} ${n}`;
}

export function parseTelefono(value: string | null | undefined): { dial: string; numero: string } {
  if (!value) return { dial: PAIS_RECOMENDADO.dial, numero: '' };

  const conPrefijo = value.match(/^\+(\d{1,3})\s*(.*)$/);
  if (conPrefijo) {
    const [, dial, resto] = conPrefijo;
    return { dial, numero: resto.replace(/\D/g, '') };
  }

  // Formato legado sin código de país (datos previos a esta función); el
  // separador entre código de área y número, si existía, se descarta acá
  // ya que el número ahora se guarda como un solo bloque de dígitos.
  return { dial: PAIS_RECOMENDADO.dial, numero: value.replace(/\D/g, '') };
}

export function waDigits(value: string | null | undefined): string {
  const { dial, numero } = parseTelefono(value);
  return `${dial}${numero}`;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
