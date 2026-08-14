'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAlquiler, type WizardPersonaInput, type WizardPropiedadInput, type WizardServicioInput } from '@/lib/actions/alquileres';

const STEP_NOMBRES = ['Propiedad', 'Partes', 'Pago', 'Servicios', 'Confirmar'];
const SERVICIO_NOMBRES_DEFAULT = ['Agua', 'Luz', 'Gas', 'Municipalidad', 'Rentas', 'Expensas'];

const emptyPersona = (): WizardPersonaInput => ({ nombre: '', dni: '', telefono: '', email: '', domicilio: '' });
const emptyPropiedad = (): WizardPropiedadInput => ({ direccion: '', localidad: 'Nueva Córdoba', tipo: 'Departamento' });

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}
function defaultFechaInicio() {
  return toISODate(new Date());
}
function defaultFechaFin() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return toISODate(d);
}

function fieldStyle() {
  return { padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5, width: '100%' } as const;
}

export default function NuevoAlquilerPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [propiedades, setPropiedades] = useState<WizardPropiedadInput[]>([emptyPropiedad()]);
  const [locador, setLocador] = useState<WizardPersonaInput>(emptyPersona());
  const [locatario, setLocatario] = useState<WizardPersonaInput>(emptyPersona());
  const [garantes, setGarantes] = useState<WizardPersonaInput[]>([]);

  const [monto, setMonto] = useState('');
  const [diaPago, setDiaPago] = useState('10');
  const [metodoPago, setMetodoPago] = useState('Transferencia bancaria');
  const [cuenta, setCuenta] = useState('');
  const [frecuenciaPago, setFrecuenciaPago] = useState('Mensual');
  const [actualizacionTipo, setActualizacionTipo] = useState<'porcentaje' | 'indice'>('indice');
  const [actualizacionValor, setActualizacionValor] = useState('ICL');
  const [frecuenciaActualizacion, setFrecuenciaActualizacion] = useState('Trimestral');
  const [fechaInicio, setFechaInicio] = useState(defaultFechaInicio());
  const [fechaFin, setFechaFin] = useState(defaultFechaFin());

  const [servicios, setServicios] = useState<WizardServicioInput[]>(
    SERVICIO_NOMBRES_DEFAULT.map((nombre, i) => ({ nombre, paga: i < 3 ? 'locatario' : 'locador', referencia: '', activo: true }))
  );

  const isLastStep = step === 4;

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createAlquiler({
        propiedades,
        locador,
        locatario,
        garantes,
        monto: Number(monto) || 0,
        diaPago: Number(diaPago) || 1,
        metodoPago,
        cuenta,
        frecuenciaPago,
        actualizacionTipo,
        actualizacionValor,
        frecuenciaActualizacion,
        fechaInicio,
        fechaFin,
        servicios,
      });
      router.push('/dashboard');
    } catch {
      setErrorMsg('No se pudo crear el alquiler. Revisá los datos e intentá de nuevo.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ border: 'none', background: 'none', color: 'oklch(50% 0.01 255)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 14 }}>
        ← Cancelar y volver
      </Link>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Nuevo alquiler</div>

      <div style={{ display: 'flex', marginBottom: 26 }}>
        {STEP_NOMBRES.map((nombre, i) => {
          const active = i === step;
          const done = i < step;
          const color = active ? 'oklch(55% 0.16 250)' : 'oklch(55% 0.01 255)';
          const line = active ? 'oklch(55% 0.16 250)' : done ? 'oklch(80% 0.03 250)' : 'oklch(92% 0.006 250)';
          return (
            <button
              key={nombre}
              type="button"
              onClick={() => setStep(i)}
              style={{ flex: 1, cursor: 'pointer', paddingBottom: 10, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `3px solid ${line}`, textAlign: 'center', background: 'none' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color }}>PASO {i + 1}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color, marginTop: 2 }}>{nombre}</div>
            </button>
          );
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 14, padding: 30, minHeight: 360 }}>
        {step === 0 && <StepPropiedades propiedades={propiedades} setPropiedades={setPropiedades} />}
        {step === 1 && <StepPartes locador={locador} setLocador={setLocador} locatario={locatario} setLocatario={setLocatario} garantes={garantes} setGarantes={setGarantes} />}
        {step === 2 && (
          <StepPago
            monto={monto} setMonto={setMonto}
            diaPago={diaPago} setDiaPago={setDiaPago}
            metodoPago={metodoPago} setMetodoPago={setMetodoPago}
            cuenta={cuenta} setCuenta={setCuenta}
            frecuenciaPago={frecuenciaPago} setFrecuenciaPago={setFrecuenciaPago}
            actualizacionTipo={actualizacionTipo} setActualizacionTipo={setActualizacionTipo}
            actualizacionValor={actualizacionValor} setActualizacionValor={setActualizacionValor}
            frecuenciaActualizacion={frecuenciaActualizacion} setFrecuenciaActualizacion={setFrecuenciaActualizacion}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin} setFechaFin={setFechaFin}
          />
        )}
        {step === 3 && <StepServicios servicios={servicios} setServicios={setServicios} />}
        {step === 4 && (
          <StepConfirmar
            propiedades={propiedades}
            locador={locador}
            locatario={locatario}
            garantes={garantes}
            monto={monto}
            diaPago={diaPago}
            metodoPago={metodoPago}
            servicios={servicios}
          />
        )}
      </div>

      {errorMsg && <div style={{ marginTop: 14, fontSize: 13, color: 'oklch(56% 0.19 25)' }}>{errorMsg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          style={{ padding: '10px 18px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', visibility: step === 0 ? 'hidden' : 'visible' }}
        >
          ← Atrás
        </button>
        {isLastStep ? (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: submitting ? 'default' : 'pointer' }}
          >
            {submitting ? 'Creando…' : 'Crear alquiler'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function StepPropiedades({ propiedades, setPropiedades }: { propiedades: WizardPropiedadInput[]; setPropiedades: (p: WizardPropiedadInput[]) => void }) {
  function update(i: number, field: keyof WizardPropiedadInput, value: string) {
    setPropiedades(propiedades.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Propiedad(es) del alquiler</div>
      <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 18 }}>
        Un contrato puede incluir más de una propiedad (ej: depto + cochera) cuando tienen escrituras o servicios separados.
      </div>
      {propiedades.map((p, i) => (
        <div key={i} style={{ border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'oklch(52% 0.01 255)' }}>Propiedad {i + 1}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <Field label="Dirección">
              <input style={fieldStyle()} value={p.direccion} onChange={(e) => update(i, 'direccion', e.target.value)} placeholder="Ej: Bv. Illia 245, 3B" />
            </Field>
            <Field label="Localidad">
              <select style={fieldStyle()} value={p.localidad} onChange={(e) => update(i, 'localidad', e.target.value)}>
                {['Nueva Córdoba', 'Cerro de las Rosas', 'Centro', 'Alta Córdoba', 'Güemes'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo">
              <select style={fieldStyle()} value={p.tipo} onChange={(e) => update(i, 'tipo', e.target.value)}>
                {['Departamento', 'Casa', 'Cochera', 'Local', 'Oficina'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setPropiedades([...propiedades, emptyPropiedad()])}
        style={{ padding: '9px 14px', border: '1px dashed oklch(80% 0.01 250)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer' }}
      >
        + Agregar otra propiedad al mismo contrato
      </button>
    </div>
  );
}

function PersonaForm({ persona, onChange }: { persona: WizardPersonaInput; onChange: (p: WizardPersonaInput) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input style={fieldStyle()} placeholder="Nombre completo" value={persona.nombre} onChange={(e) => onChange({ ...persona, nombre: e.target.value })} />
      <input style={fieldStyle()} placeholder="DNI / CUIT" value={persona.dni} onChange={(e) => onChange({ ...persona, dni: e.target.value })} />
      <input style={fieldStyle()} placeholder="Teléfono" value={persona.telefono} onChange={(e) => onChange({ ...persona, telefono: e.target.value })} />
      <input style={fieldStyle()} placeholder="Email" value={persona.email} onChange={(e) => onChange({ ...persona, email: e.target.value })} />
      <input style={fieldStyle()} placeholder="Domicilio" value={persona.domicilio} onChange={(e) => onChange({ ...persona, domicilio: e.target.value })} />
    </div>
  );
}

function StepPartes({
  locador, setLocador, locatario, setLocatario, garantes, setGarantes,
}: {
  locador: WizardPersonaInput; setLocador: (p: WizardPersonaInput) => void;
  locatario: WizardPersonaInput; setLocatario: (p: WizardPersonaInput) => void;
  garantes: WizardPersonaInput[]; setGarantes: (g: WizardPersonaInput[]) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Locador y locatario</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Locador (propietario)</div>
          <PersonaForm persona={locador} onChange={setLocador} />
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Locatario (inquilino)</div>
          <PersonaForm persona={locatario} onChange={setLocatario} />
        </div>
      </div>
      {garantes.map((g, i) => (
        <div key={i} style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Garante {i + 1}</div>
          <PersonaForm persona={g} onChange={(p) => setGarantes(garantes.map((gg, idx) => (idx === i ? p : gg)))} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setGarantes([...garantes, emptyPersona()])}
        style={{ marginTop: 16, padding: '8px 12px', border: '1px dashed oklch(80% 0.01 250)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer' }}
      >
        + Agregar otro locatario / garante
      </button>
    </div>
  );
}

function StepPago(props: {
  monto: string; setMonto: (v: string) => void;
  diaPago: string; setDiaPago: (v: string) => void;
  metodoPago: string; setMetodoPago: (v: string) => void;
  cuenta: string; setCuenta: (v: string) => void;
  frecuenciaPago: string; setFrecuenciaPago: (v: string) => void;
  actualizacionTipo: 'porcentaje' | 'indice'; setActualizacionTipo: (v: 'porcentaje' | 'indice') => void;
  actualizacionValor: string; setActualizacionValor: (v: string) => void;
  frecuenciaActualizacion: string; setFrecuenciaActualizacion: (v: string) => void;
  fechaInicio: string; setFechaInicio: (v: string) => void;
  fechaFin: string; setFechaFin: (v: string) => void;
}) {
  const isPct = props.actualizacionTipo === 'porcentaje';
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Condiciones de pago</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Monto del alquiler">
          <input style={fieldStyle()} type="number" value={props.monto} onChange={(e) => props.setMonto(e.target.value)} placeholder="185000" />
        </Field>
        <Field label="Día de pago">
          <input style={fieldStyle()} type="number" min={1} max={31} value={props.diaPago} onChange={(e) => props.setDiaPago(e.target.value)} />
        </Field>
        <Field label="Método de pago">
          <select style={fieldStyle()} value={props.metodoPago} onChange={(e) => props.setMetodoPago(e.target.value)}>
            <option>Transferencia bancaria</option>
            <option>Efectivo</option>
            <option>Otro</option>
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="CBU / Alias">
          <input style={fieldStyle()} value={props.cuenta} onChange={(e) => props.setCuenta(e.target.value)} />
        </Field>
        <Field label="Frecuencia de pago">
          <select style={fieldStyle()} value={props.frecuenciaPago} onChange={(e) => props.setFrecuenciaPago(e.target.value)}>
            {['Mensual', 'Cada 2 meses', 'Cada 3 meses', 'Cada 4 meses', 'Anual'].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Duración: fecha de fin">
          <input style={fieldStyle()} type="date" value={props.fechaFin} onChange={(e) => props.setFechaFin(e.target.value)} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Fecha de inicio">
          <input style={fieldStyle()} type="date" value={props.fechaInicio} onChange={(e) => props.setFechaInicio(e.target.value)} />
        </Field>
        <Field label="Cada cuánto se actualiza">
          <select style={fieldStyle()} value={props.frecuenciaActualizacion} onChange={(e) => props.setFrecuenciaActualizacion(e.target.value)}>
            {['Trimestral', 'Cuatrimestral', 'Semestral', 'Anual'].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
      </div>
      <div style={{ marginBottom: 20, border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Actualización del monto</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => { props.setActualizacionTipo('porcentaje'); props.setActualizacionValor('10%'); }}
            style={{ flex: 1, padding: 8, border: `1px solid ${isPct ? 'oklch(55% 0.16 250)' : 'oklch(87% 0.007 250)'}`, borderRadius: 7, background: isPct ? 'oklch(94% 0.03 250)' : '#fff', color: isPct ? 'oklch(55% 0.16 250)' : 'oklch(45% 0.01 255)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Porcentaje fijo
          </button>
          <button
            type="button"
            onClick={() => { props.setActualizacionTipo('indice'); props.setActualizacionValor('ICL'); }}
            style={{ flex: 1, padding: 8, border: `1px solid ${!isPct ? 'oklch(55% 0.16 250)' : 'oklch(87% 0.007 250)'}`, borderRadius: 7, background: !isPct ? 'oklch(94% 0.03 250)' : '#fff', color: !isPct ? 'oklch(55% 0.16 250)' : 'oklch(45% 0.01 255)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Índice
          </button>
        </div>
        <Field label={isPct ? 'Porcentaje' : 'Nombre del índice'}>
          <input style={fieldStyle()} value={props.actualizacionValor} onChange={(e) => props.setActualizacionValor(e.target.value)} placeholder={isPct ? 'Ej: 10%' : 'Ej: ICL, IPC'} />
        </Field>
      </div>
    </div>
  );
}

function StepServicios({ servicios, setServicios }: { servicios: WizardServicioInput[]; setServicios: (s: WizardServicioInput[]) => void }) {
  function update(i: number, patch: Partial<WizardServicioInput>) {
    setServicios(servicios.map((sv, idx) => (idx === i ? { ...sv, ...patch } : sv)));
  }
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Servicios de las propiedades</div>
      <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 18 }}>
        Definí qué servicios corresponden, quién los paga y el número de referencia para identificarlos.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.3fr 0.6fr', padding: '10px 4px', fontSize: 11, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: '1px solid oklch(92% 0.006 250)' }}>
        <div>Servicio</div>
        <div>Paga</div>
        <div>N° de referencia</div>
        <div>Aplica</div>
      </div>
      {servicios.map((sv, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.3fr 0.6fr', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid oklch(94% 0.005 250)' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{sv.nombre}</div>
          <select style={{ padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 12.5 }} value={sv.paga} onChange={(e) => update(i, { paga: e.target.value as 'locador' | 'locatario' })}>
            <option value="locador">Locador</option>
            <option value="locatario">Locatario</option>
          </select>
          <input style={{ padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 12.5 }} placeholder="N° de cuenta / cliente" value={sv.referencia} onChange={(e) => update(i, { referencia: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={sv.activo} onChange={(e) => update(i, { activo: e.target.checked })} />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setServicios([...servicios, { nombre: '', paga: 'locatario', referencia: '', activo: true }])}
        style={{ marginTop: 14, padding: '9px 14px', border: '1px dashed oklch(80% 0.01 250)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer' }}
      >
        + Agregar servicio personalizado
      </button>
    </div>
  );
}

function StepConfirmar({ propiedades, locador, locatario, garantes, monto, diaPago, metodoPago, servicios }: {
  propiedades: WizardPropiedadInput[];
  locador: WizardPersonaInput;
  locatario: WizardPersonaInput;
  garantes: WizardPersonaInput[];
  monto: string;
  diaPago: string;
  metodoPago: string;
  servicios: WizardServicioInput[];
}) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Revisión final</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13.5 }}>
        <div style={{ border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', marginBottom: 8 }}>Propiedad(es)</div>
          {propiedades.map((p, i) => (
            <div key={i}>{p.direccion || '(sin dirección)'}, {p.localidad}</div>
          ))}
        </div>
        <div style={{ border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', marginBottom: 8 }}>Partes</div>
          <div>Locador: {locador.nombre || '—'}</div>
          <div>Locatario: {locatario.nombre || '—'}</div>
          {garantes.length > 0 && <div style={{ color: 'oklch(52% 0.01 255)' }}>+ {garantes.length} garante(s)</div>}
        </div>
        <div style={{ border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', marginBottom: 8 }}>Pago</div>
          <div>${monto || '0'} · día {diaPago} · {metodoPago}</div>
        </div>
        <div style={{ border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', marginBottom: 8 }}>Servicios activos</div>
          <div>{servicios.filter((s) => s.activo).map((s) => s.nombre).join(', ') || 'Ninguno'}</div>
        </div>
      </div>
    </div>
  );
}
