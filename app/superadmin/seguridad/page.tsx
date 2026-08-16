import { MfaSettings } from './mfa-settings';

export default function SeguridadPage() {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Seguridad</div>
      <MfaSettings />
    </div>
  );
}
