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

// Loose cross-country bounds on the national number (without the dial
// code): short enough to reject "123"-style junk, long enough not to
// reject real numbers — exact per-country lengths would need a lookup
// table we don't have.
export const NUMERO_MIN_DIGITS = 6;
export const NUMERO_MAX_DIGITS = 13;

export function isValidNumero(numero: string): boolean {
  const digits = numero.replace(/\D/g, '');
  return digits.length >= NUMERO_MIN_DIGITS && digits.length <= NUMERO_MAX_DIGITS;
}

// Phone is optional almost everywhere in the app, so an empty value is
// valid — only a non-empty, implausible number is an error.
export function telefonoErrorMessage(numero: string): string | null {
  if (!numero.trim()) return null;
  if (!isValidNumero(numero)) return `El número debe tener entre ${NUMERO_MIN_DIGITS} y ${NUMERO_MAX_DIGITS} dígitos.`;
  return null;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
