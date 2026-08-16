export type Pais = { nombre: string; iso: string; dial: string; bandera: string };

function bandera(iso: string): string {
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

const DATOS: [string, string, string][] = [
  ['Argentina', 'AR', '54'],
  ['Chile', 'CL', '56'],
  ['Uruguay', 'UY', '598'],
  ['Paraguay', 'PY', '595'],
  ['Bolivia', 'BO', '591'],
  ['Brasil', 'BR', '55'],
  ['Perú', 'PE', '51'],
  ['Colombia', 'CO', '57'],
  ['Ecuador', 'EC', '593'],
  ['Venezuela', 'VE', '58'],
  ['México', 'MX', '52'],
  ['España', 'ES', '34'],
  ['Estados Unidos', 'US', '1'],
  ['Canadá', 'CA', '1'],
  ['Reino Unido', 'GB', '44'],
  ['Francia', 'FR', '33'],
  ['Alemania', 'DE', '49'],
  ['Italia', 'IT', '39'],
  ['Portugal', 'PT', '351'],
  ['China', 'CN', '86'],
  ['Japón', 'JP', '81'],
  ['India', 'IN', '91'],
  ['Australia', 'AU', '61'],
];

export const PAISES: Pais[] = DATOS.map(([nombre, iso, dial]) => ({ nombre, iso, dial, bandera: bandera(iso) }));

export const PAIS_RECOMENDADO = PAISES[0];

export function paisPorDial(dial: string): Pais {
  return PAISES.find((p) => p.dial === dial) ?? PAIS_RECOMENDADO;
}
