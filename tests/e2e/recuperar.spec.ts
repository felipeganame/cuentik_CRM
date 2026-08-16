import { test, expect } from '@playwright/test';

async function fetchLinkFromLatestEmail(
  request: import('@playwright/test').APIRequestContext,
  email: string,
  subjectPattern: RegExp
): Promise<string> {
  const list = await (await request.get('http://127.0.0.1:54324/api/v1/messages')).json();
  const msg = list.messages.find(
    (m: { To: { Address: string }[]; Subject: string }) => m.To.some((t) => t.Address === email) && subjectPattern.test(m.Subject)
  );
  if (!msg) throw new Error(`No email matching ${subjectPattern} found for ${email}`);
  const full = await (await request.get(`http://127.0.0.1:54324/api/v1/message/${msg.ID}`)).json();
  const linkMatch = String(full.Text || full.HTML).match(/http:\/\/[^\s"<)]+\/auth\/v1\/verify\?[^\s"<)]+/);
  if (!linkMatch) throw new Error('No verify link found in email body');
  return linkMatch[0].replace(/&amp;/g, '&');
}

test('forgot-password flow lets a user set a new password and log in with it', async ({ page, request }) => {
  // Isolated throwaway account (not the shared seeded user) so a password
  // change here can't race other spec files that log in as marina.
  const email = `e2e-recuperar-${Date.now()}@example.com`;
  const originalPassword = 'Password123!';
  const newPassword = 'NuevaPassword456!';

  await page.goto('/registro');
  await page.locator('input[name="nombre"]').fill('Inmobiliaria Recuperar E2E');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(originalPassword);
  await page.getByRole('button', { name: 'Crear mi cuenta gratis' }).click();
  await expect(page.getByText('Revisá tu email')).toBeVisible({ timeout: 10_000 });

  const confirmUrl = await fetchLinkFromLatestEmail(request, email, /confirm/i);
  await page.goto(confirmUrl);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });

  await page.context().clearCookies();

  await page.goto('/login');
  await page.getByText('¿Olvidaste tu contraseña?').click();
  await expect(page).toHaveURL(/\/login\/olvide$/);

  await page.locator('input[name="email"]').fill(email);
  await page.getByRole('button', { name: 'Enviar link de recuperación' }).click();
  await expect(page.getByText('Revisá tu email')).toBeVisible({ timeout: 10_000 });

  const resetUrl = await fetchLinkFromLatestEmail(request, email, /recover|reset/i);
  await page.goto(resetUrl);
  await expect(page).toHaveURL(/\/auth\/nueva-password$/, { timeout: 10_000 });

  await page.locator('input[name="password"]').fill(newPassword);
  await page.locator('input[name="confirmacion"]').fill(newPassword);
  await page.getByRole('button', { name: 'Guardar contraseña' }).click();
  await expect(page.getByText('Contraseña actualizada')).toBeVisible({ timeout: 10_000 });

  await page.context().clearCookies();
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(newPassword);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
});
