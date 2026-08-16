import { test, expect } from '@playwright/test';

test('a user can permanently delete their own account after confirming', async ({ page, request }) => {
  const email = `e2e-eliminar-${Date.now()}@example.com`;
  const password = 'Password123!';

  await page.goto('/registro');
  await page.locator('input[name="nombre"]').fill('Inmobiliaria Eliminar E2E');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Crear mi cuenta gratis' }).click();
  await expect(page.getByText('Revisá tu email')).toBeVisible({ timeout: 10_000 });

  const list = await (await request.get('http://127.0.0.1:54324/api/v1/messages')).json();
  const msg = list.messages.find((m: { To: { Address: string }[] }) => m.To.some((t) => t.Address === email));
  const full = await (await request.get(`http://127.0.0.1:54324/api/v1/message/${msg.ID}`)).json();
  const confirmUrl = String(full.Text || full.HTML)
    .match(/http:\/\/[^\s"<)]+\/auth\/v1\/verify\?[^\s"<)]+/)![0]
    .replace(/&amp;/g, '&');
  await page.goto(confirmUrl);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });

  await page.getByRole('link', { name: 'Configuración' }).click();
  await expect(page).toHaveURL(/\/dashboard\/configuracion$/);

  await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('¿Eliminar tu cuenta?')).toBeVisible();

  // Confirm button stays disabled until the exact confirmation phrase is typed.
  const confirmBtn = dialog.getByRole('button', { name: 'Eliminar mi cuenta' });
  await expect(confirmBtn).toBeDisabled();
  await dialog.locator('input[name="confirmacion"]').fill('borrar');
  await expect(confirmBtn).toBeDisabled();
  await dialog.locator('input[name="confirmacion"]').fill('ELIMINAR');
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();

  await expect(page).toHaveURL(/\/login\?motivo=cuenta_eliminada$/, { timeout: 10_000 });
  await expect(page.getByText('Tu cuenta fue eliminada correctamente.')).toBeVisible();

  // The account no longer exists.
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Email o contraseña incorrectos.')).toBeVisible();
});
