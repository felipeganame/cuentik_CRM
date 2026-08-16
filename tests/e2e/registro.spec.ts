import { test, expect } from '@playwright/test';

test('registro sends a confirmation email and the link logs the user in', async ({ page, request }) => {
  const email = `e2e-registro-${Date.now()}@example.com`;

  await page.goto('/registro');
  await page.locator('input[name="nombre"]').fill('Inmobiliaria E2E');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Password123!');
  await page.getByRole('button', { name: 'Crear mi cuenta gratis' }).click();

  await expect(page.getByText('Revisá tu email')).toBeVisible({ timeout: 10_000 });

  // Login should be blocked until the email is confirmed.
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Password123!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Todavía no confirmaste tu email')).toBeVisible({ timeout: 10_000 });

  // Pull the confirmation link out of Mailpit (local Supabase's mail catcher).
  const list = await (await request.get('http://127.0.0.1:54324/api/v1/messages')).json();
  const msg = list.messages.find((m: { To: { Address: string }[] }) => m.To.some((t) => t.Address === email));
  expect(msg).toBeTruthy();
  const full = await (await request.get(`http://127.0.0.1:54324/api/v1/message/${msg.ID}`)).json();
  const linkMatch = String(full.Text || full.HTML).match(/http:\/\/[^\s"<)]+\/auth\/v1\/verify\?[^\s"<)]+/);
  expect(linkMatch).toBeTruthy();
  const confirmUrl = linkMatch![0].replace(/&amp;/g, '&');

  await page.goto(confirmUrl);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
  await expect(page.getByText('Inmobiliaria E2E')).toBeVisible();
});
