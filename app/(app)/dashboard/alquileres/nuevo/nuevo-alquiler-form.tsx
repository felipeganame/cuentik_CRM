'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createAlquiler, recordFotoUpload, type WizardPersonaInput, type WizardPropiedadInput, type WizardServicioInput } from '@/lib/actions/alquileres';
import { EMAIL_PATTERN, formatTelefono, parseTelefono } from '@/lib/phone';

const STEP_NOMBRES = ['Propiedad', 'Partes', 'Pago', 'Servicios', 'Confirmar'];
const SERVICIO_NOMBRES_DEFAULT = ['Agua', 'Luz', 'Gas', 'Municipalidad', 'Rentas', 'Expensas'];
const MAX_FOTO_BYTES = 1024 * 1024;
const MAX_FOTOS_POR_PROPIEDAD = 15;

const emptyPersona = (): WizardPersonaInput => ({ nombre: '', dni: '', telefono: '', email: '', domicilio: '' });
const emptyPropiedad = (): WizardPropiedadInput => ({ direccion: '', localidad: '', tipo: 'Departamento' });
const emptyServicio = (): WizardServicioInput => ({ nombre: '', paga: 'locatario', referencia: '', referencia2: '', activo: true });

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

function validatePropiedades(propiedades: WizardPropiedadInput[]): string | null {
  if (propiedades.some((p) => !p.direccion.trim())) return 'Completá la dirección de todas las propiedades.';
  return null;
}

function validatePartes(locador: WizardPersonaInput, locatario: WizardPersonaInput, garantes: WizardPersonaInput[]): string | null {
  if (!locador.nombre.trim() || !locador.dni.trim()) return 'Completá nombre y DNI/CUIT del locador.';
  if (!locatario.nombre.trim() || !locatario.dni.trim()) return 'Completá nombre y DNI/CUIT del locatario.';
  if (garantes.some((g) => !g.nombre.trim() || !g.dni.trim())) return 'Completá nombre y DNI/CUIT de todos los garantes, o quitá los que no vayas a usar.';
  const todas = [locador, locatario, ...garantes];
  if (todas.some((p) => p.email.trim() && !EMAIL_PATTERN.test(p.email))) return 'Hay un email con formato inválido.';
  return null;
}

function validatePago(monto: string, metodoPago: string, cuenta: string, fechaInicio: string, fechaFin: string): string | null {
  if (!monto || Number(monto) <= 0) return 'Ingresá un monto de alquiler válido.';
  if (!fechaInicio) return 'Ingresá la fecha de inicio.';
  if (!fechaFin) return 'Ingresá la fecha de fin.';
  if (metodoPago !== 'Efectivo' && !cuenta.trim()) {
    return metodoPago === 'Otro' ? 'Completá el detalle del método de pago.' : 'Completá el CBU / Alias.';
  }
  return null;
}

function validateServicios(servicios: WizardServicioInput[]): string | null {
  if (servicios.some((s) => !s.nombre.trim())) return 'Completá el nombre de todos los servicios, o quitá los que no vayas a usar.';
  return null;
}

export function NuevoAlquilerForm({ localidadesSugeridas, inmobiliariaId }: { localidadesSugeridas: string[]; inmobiliariaId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const [propiedades, setPropiedades] = useState<WizardPropiedadInput[]>([emptyPropiedad()]);
  const [fotosPorPropiedad, setFotosPorPropiedad] = useState<File[][]>([[]]);
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
    SERVICIO_NOMBRES_DEFAULT.map((nombre, i) => ({ nombre, paga: i < 3 ? 'locatario' : 'locador', referencia: '', referencia2: '', activo: true }))
  );

  const isLastStep = step === 4;

  function validateStep(s: number): string | null {
    if (s === 0) return validatePropiedades(propiedades);
    if (s === 1) return validatePartes(locador, locatario, garantes);
    if (s === 2) return validatePago(monto, metodoPago, cuenta, fechaInicio, fechaFin);
    if (s === 3) return validateServicios(servicios);
    return null;
  }

  function goToStep(target: number) {
    if (target <= step) {
      setStepError(null);
      setStep(target);
      return;
    }
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep(target);
  }

  async function handleSubmit() {
    for (let s = 0; s <= 3; s++) {
      const err = validateStep(s);
      if (err) {
        setStepError(err);
        setStep(s);
        return;
      }
    }
    setStepError(null);
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await createAlquiler({
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

      if ('error' in result) {
        setErrorMsg(result.error);
        setSubmitting(false);
        return;
      }

      const { id: alquilerId, propiedadIds } = result;
      const supabase = createClient();
      for (let i = 0; i < propiedadIds.length; i++) {
        const propiedadId = propiedadIds[i];
        for (const file of fotosPorPropiedad[i] ?? []) {
          const path = `${inmobiliariaId}/${propiedadId}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('propiedad-fotos').upload(path, file);
          if (!uploadError) await recordFotoUpload(propiedadId, alquilerId, path);
        }
      }

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
              onClick={() => goToStep(i)}
              style={{ flex: 1, cursor: 'pointer', paddingBottom: 10, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `3px solid ${line}`, textAlign: 'center', background: 'none' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color }}>PASO {i + 1}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color, marginTop: 2 }}>{nombre}</div>
            </button>
          );
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 14, padding: 30, minHeight: 360 }}>
        {step === 0 && (
          <StepPropiedades
            propiedades={propiedades}
            setPropiedades={setPropiedades}
            localidadesSugeridas={localidadesSugeridas}
            fotosPorPropiedad={fotosPorPropiedad}
            setFotosPorPropiedad={setFotosPorPropiedad}
          />
        )}
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

      {stepError && <div style={{ marginTop: 14, fontSize: 13, color: 'oklch(56% 0.19 25)' }}>{stepError}</div>}
      {errorMsg && <div style={{ marginTop: 14, fontSize: 13, color: 'oklch(56% 0.19 25)' }}>{errorMsg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          type="button"
          onClick={() => { setStepError(null); setStep((s) => Math.max(0, s - 1)); }}
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
            onClick={() => goToStep(Math.min(4, step + 1))}
            style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: 'oklch(56% 0.19 25)' }}> *</span>}
      </div>
      {children}
    </div>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ border: 'none', background: 'none', color: 'oklch(56% 0.19 25)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: '2px 6px' }}
    >
      Quitar
    </button>
  );
}

function StepPropiedades({
  propiedades, setPropiedades, localidadesSugeridas, fotosPorPropiedad, setFotosPorPropiedad,
}: {
  propiedades: WizardPropiedadInput[]; setPropiedades: (p: WizardPropiedadInput[]) => void;
  localidadesSugeridas: string[];
  fotosPorPropiedad: File[][]; setFotosPorPropiedad: (f: File[][]) => void;
}) {
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function update(i: number, field: keyof WizardPropiedadInput, value: string) {
    setPropiedades(propiedades.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }
  function remove(i: number) {
    setPropiedades(propiedades.filter((_, idx) => idx !== i));
    setFotosPorPropiedad(fotosPorPropiedad.filter((_, idx) => idx !== i));
  }
  function agregar() {
    setPropiedades([...propiedades, emptyPropiedad()]);
    setFotosPorPropiedad([...fotosPorPropiedad, []]);
  }
  function addFotos(i: number, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setFotoError(null);
    const actuales = fotosPorPropiedad[i] ?? [];
    const nuevos = Array.from(fileList);
    if (actuales.length + nuevos.length > MAX_FOTOS_POR_PROPIEDAD) {
      setFotoError(`Máximo ${MAX_FOTOS_POR_PROPIEDAD} fotos por propiedad.`);
      return;
    }
    for (const file of nuevos) {
      if (file.type !== 'image/jpeg') {
        setFotoError('Solo se aceptan imágenes JPEG.');
        return;
      }
      if (file.size > MAX_FOTO_BYTES) {
        setFotoError(`"${file.name}" supera 1 MB.`);
        return;
      }
    }
    setFotosPorPropiedad(fotosPorPropiedad.map((fs, idx) => (idx === i ? [...fs, ...nuevos] : fs)));
  }
  function removeFoto(i: number, fileIdx: number) {
    setFotosPorPropiedad(fotosPorPropiedad.map((fs, idx) => (idx === i ? fs.filter((_, fi) => fi !== fileIdx) : fs)));
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Propiedad(es) del alquiler</div>
      <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 18 }}>
        Un contrato puede incluir más de una propiedad (ej: depto + cochera) cuando tienen escrituras o servicios separados.
      </div>
      {propiedades.map((p, i) => (
        <div key={i} style={{ border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(52% 0.01 255)' }}>Propiedad {i + 1}</div>
            {propiedades.length > 1 && <RemoveButton onClick={() => remove(i)} label={`Quitar propiedad ${i + 1}`} />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <Field label="Dirección" required>
              <input style={fieldStyle()} value={p.direccion} onChange={(e) => update(i, 'direccion', e.target.value)} placeholder="Ej: Bv. Illia 245, 3B" />
            </Field>
            <Field label="Localidad">
              <input
                style={fieldStyle()}
                list="localidades-sugeridas"
                value={p.localidad}
                onChange={(e) => update(i, 'localidad', e.target.value)}
                placeholder="Ej: Nueva Córdoba"
              />
            </Field>
            <Field label="Tipo">
              <select style={fieldStyle()} value={p.tipo} onChange={(e) => update(i, 'tipo', e.target.value)}>
                {['Departamento', 'Casa', 'Cochera', 'Local', 'Oficina'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Fotos (opcional)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: (fotosPorPropiedad[i]?.length ?? 0) > 0 ? 8 : 0 }}>
              {(fotosPorPropiedad[i] ?? []).map((file, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid oklch(90% 0.007 250)', borderRadius: 6, padding: '4px 8px', fontSize: 11.5 }}>
                  <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  <button type="button" onClick={() => removeFoto(i, fi)} aria-label={`Quitar ${file.name}`} style={{ border: 'none', background: 'none', color: 'oklch(56% 0.19 25)', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverIndex(null);
                addFotos(i, e.dataTransfer.files);
              }}
              style={{
                display: 'inline-block', padding: '7px 12px',
                border: `1px dashed ${dragOverIndex === i ? 'oklch(55% 0.16 250)' : 'oklch(80% 0.01 250)'}`,
                borderRadius: 7, background: dragOverIndex === i ? 'oklch(96% 0.02 250)' : 'none',
                fontSize: 12, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer',
              }}
            >
              + Agregar o arrastrá fotos
              <input type="file" accept="image/jpeg" multiple onChange={(e) => { addFotos(i, e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
            </label>
          </Field>
        </div>
      ))}
      <datalist id="localidades-sugeridas">
        {localidadesSugeridas.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>
      {fotoError && <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)', marginBottom: 12 }}>{fotoError}</div>}
      <button
        type="button"
        onClick={agregar}
        style={{ padding: '9px 14px', border: '1px dashed oklch(80% 0.01 250)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer' }}
      >
        + Agregar otra propiedad al mismo contrato
      </button>
    </div>
  );
}

function PersonaForm({ persona, onChange }: { persona: WizardPersonaInput; onChange: (p: WizardPersonaInput) => void }) {
  const { area, numero } = parseTelefono(persona.telefono);
  const emailInvalido = persona.email.trim() !== '' && !EMAIL_PATTERN.test(persona.email);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input style={fieldStyle()} placeholder="Nombre completo *" value={persona.nombre} onChange={(e) => onChange({ ...persona, nombre: e.target.value })} />
      <input style={fieldStyle()} placeholder="DNI / CUIT *" value={persona.dni} onChange={(e) => onChange({ ...persona, dni: e.target.value })} />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...fieldStyle(), width: 90 }}
          placeholder="Cód. área"
          inputMode="numeric"
          maxLength={4}
          value={area}
          onChange={(e) => onChange({ ...persona, telefono: formatTelefono(e.target.value, numero) })}
        />
        <input
          style={fieldStyle()}
          placeholder="Teléfono"
          inputMode="numeric"
          maxLength={10}
          value={numero}
          onChange={(e) => onChange({ ...persona, telefono: formatTelefono(area, e.target.value) })}
        />
      </div>
      <div>
        <input
          style={{ ...fieldStyle(), borderColor: emailInvalido ? 'oklch(70% 0.15 25)' : undefined }}
          type="email"
          placeholder="Email"
          value={persona.email}
          onChange={(e) => onChange({ ...persona, email: e.target.value })}
        />
        {emailInvalido && <div style={{ fontSize: 11, color: 'oklch(56% 0.19 25)', marginTop: 4 }}>Email inválido.</div>}
      </div>
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
  function removeGarante(i: number) {
    setGarantes(garantes.filter((_, idx) => idx !== i));
  }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Garante {i + 1}</div>
            <RemoveButton onClick={() => removeGarante(i)} label={`Quitar garante ${i + 1}`} />
          </div>
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
  const isEfectivo = props.metodoPago === 'Efectivo';
  const isOtro = props.metodoPago === 'Otro';
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Condiciones de pago</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Monto del alquiler" required>
          <input style={fieldStyle()} type="number" value={props.monto} onChange={(e) => props.setMonto(e.target.value)} placeholder="185000" />
        </Field>
        <Field label="Día de pago">
          <input style={fieldStyle()} type="number" min={1} max={31} value={props.diaPago} onChange={(e) => props.setDiaPago(e.target.value)} />
        </Field>
        <Field label="Método de pago">
          <select
            style={fieldStyle()}
            value={props.metodoPago}
            onChange={(e) => {
              props.setMetodoPago(e.target.value);
              if (e.target.value === 'Efectivo') props.setCuenta('');
            }}
          >
            <option>Transferencia bancaria</option>
            <option>Efectivo</option>
            <option>Otro</option>
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        {isEfectivo ? (
          <div />
        ) : (
          <Field label={isOtro ? 'Detalle del método de pago' : 'CBU / Alias'} required>
            <input
              style={fieldStyle()}
              value={props.cuenta}
              onChange={(e) => props.setCuenta(e.target.value)}
              placeholder={isOtro ? 'Ej: cheque, Mercado Pago, etc.' : ''}
            />
          </Field>
        )}
        <Field label="Frecuencia de pago">
          <select style={fieldStyle()} value={props.frecuenciaPago} onChange={(e) => props.setFrecuenciaPago(e.target.value)}>
            {['Mensual', 'Cada 2 meses', 'Cada 3 meses', 'Cada 4 meses', 'Anual'].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Duración: fecha de fin" required>
          <input style={fieldStyle()} type="date" value={props.fechaFin} onChange={(e) => props.setFechaFin(e.target.value)} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Fecha de inicio" required>
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
  function remove(i: number) {
    setServicios(servicios.filter((_, idx) => idx !== i));
  }
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Servicios de las propiedades</div>
      <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 18 }}>
        Definí qué servicios corresponden, quién los paga y el/los número(s) de referencia para identificarlos.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 1fr 1fr 0.5fr 0.4fr', padding: '10px 4px', fontSize: 11, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: '1px solid oklch(92% 0.006 250)' }}>
        <div>Servicio</div>
        <div>Paga</div>
        <div>N° de referencia 1</div>
        <div>N° de referencia 2</div>
        <div>Aplica</div>
        <div></div>
      </div>
      {servicios.map((sv, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 1fr 1fr 0.5fr 0.4fr', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid oklch(94% 0.005 250)' }}>
          <input
            style={{ padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 13, fontWeight: 600 }}
            placeholder="Nombre del servicio"
            value={sv.nombre}
            onChange={(e) => update(i, { nombre: e.target.value })}
          />
          <select style={{ padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 12.5 }} value={sv.paga} onChange={(e) => update(i, { paga: e.target.value as 'locador' | 'locatario' })}>
            <option value="locador">Locador</option>
            <option value="locatario">Locatario</option>
          </select>
          <input style={{ padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 12.5 }} placeholder="N° de cuenta / cliente" value={sv.referencia} onChange={(e) => update(i, { referencia: e.target.value })} />
          <input style={{ padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 12.5 }} placeholder="Opcional" value={sv.referencia2} onChange={(e) => update(i, { referencia2: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={sv.activo} onChange={(e) => update(i, { activo: e.target.checked })} />
          </label>
          <RemoveButton onClick={() => remove(i)} label={`Quitar servicio ${sv.nombre || i + 1}`} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setServicios([...servicios, emptyServicio()])}
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
