'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { marcarCobroPagado, resetInmobiliariaPassword, updateInmobiliaria } from '@/lib/actions/superadmin';
import { parseTelefono } from '@/lib/phone';
import { PaisSelectOptions, paisSelectStyle } from '@/app/pais-select';
import type { EstadoCobro } from '@/lib/billing';
import type { Inmobiliaria } from '@/lib/types';

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5 } as const;
}

function soloDigitos(e: React.ChangeEvent<HTMLInputElement>) {
  e.target.value = e.target.value.replace(/\D/g, '');
}

function cobroBadgeStyle(estado: EstadoCobro) {
  if (estado === 'Pagado') return { background: 'oklch(94% 0.06 150)', color: 'oklch(45% 0.13 150)' };
  if (estado === 'Pendiente') return { background: 'oklch(96% 0.05 80)', color: 'oklch(55% 0.15 70)' };
  return { background: 'oklch(95% 0.03 25)', color: 'oklch(56% 0.19 25)' };
}

export function InmobiliariaForm({ inmobiliaria, montoMensual, estadoCobro }: { inmobiliaria: Inmobiliaria; montoMensual: number; estadoCobro: EstadoCobro }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const [marcandoPagado, setMarcandoPagado] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);

  async function handleMarcarPagado() {
    setMarcandoPagado(true);
    setPagoError(null);
    const result = await marcarCobroPagado(inmobiliaria.id);
    if ('error' in result) setPagoError(result.error);
    else router.refresh();
    setMarcandoPagado(false);
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const result = await updateInmobiliaria(inmobiliaria.id, formData);
      if ('error' in result) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setResetError(null);
    setNewPassword(null);
    try {
      const result = await resetInmobiliariaPassword(inmobiliaria.id);
      if ('error' in result) {
        setResetError(result.error);
      } else {
        setNewPassword(result.password);
      }
    } catch {
      setResetError('No se pudo restablecer la contraseña.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <form action={handleSubmit} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre</div>
          <input name="nombre" defaultValue={inmobiliaria.nombre} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email de acceso</div>
          <input value={inmobiliaria.email_contacto} disabled style={{ ...fieldStyle(), background: 'oklch(96% 0.004 250)', color: 'oklch(50% 0.01 255)' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Teléfono</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select name="telefono_dial" defaultValue={parseTelefono(inmobiliaria.telefono).dial} style={paisSelectStyle()}>
              <PaisSelectOptions />
            </select>
            <input name="telefono_area" type="text" inputMode="numeric" maxLength={4} placeholder="Cód. área" defaultValue={parseTelefono(inmobiliaria.telefono).area} onChange={soloDigitos} style={{ ...fieldStyle(), width: 80 }} />
            <input name="telefono_numero" type="text" inputMode="numeric" maxLength={10} placeholder="Número" defaultValue={parseTelefono(inmobiliaria.telefono).numero} onChange={soloDigitos} style={fieldStyle()} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Límite de alquileres</div>
          <input name="limite_alquileres" type="number" defaultValue={inmobiliaria.limite_alquileres} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Próximo cobro</div>
          <input name="fecha_proximo_cobro" type="date" defaultValue={inmobiliaria.fecha_proximo_cobro ?? ''} style={fieldStyle()} />
          <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)', marginTop: 5 }}>
            Vacío = sin ciclo activo (todavía no pasó del primer alquiler gratis).
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Estado</div>
          <select name="estado" defaultValue={inmobiliaria.estado} style={fieldStyle()}>
            <option value="Activo">Activo</option>
            <option value="Suspendido">Suspendido</option>
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" name="exento_cobro" defaultChecked={inmobiliaria.exento_cobro} />
          Cuenta de prueba (exenta de cobro)
        </label>

        {error && <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{error}</div>}
        {saved && <div style={{ fontSize: 12.5, color: 'oklch(45% 0.13 150)' }}>Guardado.</div>}

        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 6, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
          Cobro
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>${montoMensual.toLocaleString('es-AR')}/mes</div>
          <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, ...cobroBadgeStyle(estadoCobro) }}>
            {inmobiliaria.exento_cobro ? 'Exento' : estadoCobro}
          </span>
        </div>
        {estadoCobro !== 'Pagado' && (
          <button
            type="button"
            onClick={handleMarcarPagado}
            disabled={marcandoPagado}
            style={{ padding: '9px 14px', border: '1px solid oklch(80% 0.06 150)', borderRadius: 8, background: '#fff', color: 'oklch(45% 0.13 150)', fontSize: 13, fontWeight: 600, cursor: marcandoPagado ? 'default' : 'pointer' }}
          >
            {marcandoPagado ? 'Guardando…' : 'Marcar como pagado'}
          </button>
        )}
        {pagoError && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{pagoError}</div>}
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
          Acceso
        </div>
        <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 12 }}>
          Genera una contraseña nueva para esta inmobiliaria. Se la tenés que compartir vos, no se guarda ni se muestra de nuevo.
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          style={{ padding: '9px 14px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: resetting ? 'default' : 'pointer' }}
        >
          {resetting ? 'Generando…' : 'Restablecer contraseña'}
        </button>
        {newPassword && (
          <div style={{ marginTop: 12, padding: '10px 14px', border: '1px solid oklch(85% 0.05 150)', background: 'oklch(97% 0.02 150)', borderRadius: 8, fontSize: 13 }}>
            Nueva contraseña: <strong style={{ fontFamily: 'monospace' }}>{newPassword}</strong>
          </div>
        )}
        {resetError && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{resetError}</div>}
      </div>
    </div>
  );
}
