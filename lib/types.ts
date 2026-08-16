export type EstadoPago = 'pagado' | 'pendiente' | 'vencido';
export type Rol = 'locador' | 'locatario' | 'garante';
export type ActualizacionTipo = 'porcentaje' | 'indice';

export type Inmobiliaria = {
  id: string;
  nombre: string;
  email_contacto: string;
  telefono: string | null;
  limite_alquileres: number;
  estado: 'Activo' | 'Suspendido';
  fecha_proximo_cobro: string | null;
  logo_url: string | null;
  exento_cobro: boolean;
  metodo_pago_preferido: string | null;
  pagina_bio: string | null;
  pagina_ubicacion: string | null;
};

export type Operacion = 'venta' | 'alquiler';

export type Publicacion = {
  id: string;
  inmobiliaria_id: string;
  tipo: string;
  operacion: Operacion;
  titulo: string;
  descripcion: string | null;
  precio: number | null;
  localidad: string | null;
  activa: boolean;
  created_at: string;
};

export type Alquiler = {
  id: string;
  inmobiliaria_id: string;
  monto: number;
  dia_pago: number;
  metodo_pago: string;
  cuenta: string | null;
  frecuencia_pago: string;
  actualizacion_tipo: ActualizacionTipo;
  actualizacion_valor: string;
  frecuencia_actualizacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  contrato_pdf_path: string | null;
  created_at: string;
};

export type Propiedad = {
  id: string;
  alquiler_id: string;
  direccion: string;
  localidad: string;
  tipo: string;
};

export type Contacto = {
  id: string;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  domicilio: string | null;
};

export type AlquilerParte = {
  id: string;
  alquiler_id: string;
  contacto_id: string;
  rol: Rol;
  contacto?: Contacto;
};

export type Servicio = {
  id: string;
  propiedad_id: string;
  nombre: string;
  paga: 'locador' | 'locatario';
  referencia: string | null;
  referencia2: string | null;
  activo: boolean;
  pagado_mes_actual: boolean;
};

export type PagoHistorial = {
  id: string;
  alquiler_id: string;
  mes: string;
  estado: EstadoPago;
};

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function mesActualLabel(date = new Date()): string {
  return `${MESES_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function estadoPagoLabel(estado: EstadoPago): 'Al día' | 'Pendiente' | 'Deuda' {
  if (estado === 'pagado') return 'Al día';
  if (estado === 'pendiente') return 'Pendiente';
  return 'Deuda';
}

const ACCENT = 'oklch(55% 0.16 250)';
const SUCCESS_BG = 'oklch(94% 0.05 150)';
const SUCCESS_FG = 'oklch(45% 0.13 150)';
const WARNING_BG = 'oklch(95% 0.05 80)';
const WARNING_FG = 'oklch(48% 0.11 80)';
const DANGER_BG = 'oklch(94% 0.06 25)';
const DANGER_FG = 'oklch(50% 0.17 25)';

export function statusStyle(label: 'Al día' | 'Pagado' | 'Activo' | 'Pendiente' | 'Deuda' | 'Vencido' | string) {
  if (label === 'Al día' || label === 'Pagado' || label === 'Activo') return { bg: SUCCESS_BG, color: SUCCESS_FG };
  if (label === 'Pendiente') return { bg: WARNING_BG, color: WARNING_FG };
  return { bg: DANGER_BG, color: DANGER_FG };
}

export { ACCENT };
