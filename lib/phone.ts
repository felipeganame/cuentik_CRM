export function formatTelefono(area: string, numero: string): string {
  const a = area.replace(/\D/g, '');
  const n = numero.replace(/\D/g, '');
  if (!a && !n) return '';
  return `+54 ${a} ${n}`.trim();
}

export function parseTelefono(value: string | null | undefined): { area: string; numero: string } {
  if (!value) return { area: '', numero: '' };
  const sinPrefijo = value.replace(/^\+?54\s*/, '').trim();
  const [area = '', ...resto] = sinPrefijo.split(/\s+/);
  return { area: area.replace(/\D/g, ''), numero: resto.join('').replace(/\D/g, '') };
}

export function waDigits(value: string | null | undefined): string {
  const digits = (value ?? '').replace(/\D/g, '');
  return digits.startsWith('54') ? digits : `54${digits}`;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
