import { test, expect } from '@playwright/test';

test('nuevo alquiler wizard creates a rental end to end', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.getByRole('link', { name: '+ Nuevo alquiler' }).click();
  await expect(page).toHaveURL(/\/dashboard\/alquileres\/nuevo$/);

  // Step 1: Propiedad
  await page.getByPlaceholder('Ej: Bv. Illia 245, 3B').fill('Av. Test 999, 5A');
  await page.getByRole('button', { name: 'Siguiente →' }).click();

  // Step 2: Partes
  const nombres = page.getByPlaceholder('Nombre completo');
  await nombres.nth(0).fill('Locador E2E');
  await nombres.nth(1).fill('Locatario E2E');
  const dnis = page.getByPlaceholder('DNI / CUIT');
  await dnis.nth(0).fill('30111222');
  await dnis.nth(1).fill('30333444');
  await page.getByRole('button', { name: 'Siguiente →' }).click();

  // Step 3: Pago
  await page.getByPlaceholder('185000').fill('200000');
  await page.getByPlaceholder('Ej: 0000003100000000000000').fill('0000003100000000001234');
  await page.getByRole('button', { name: 'Siguiente →' }).click();

  // Step 4: Servicios (defaults fine)
  await page.getByRole('button', { name: 'Siguiente →' }).click();

  // Step 5: Confirmar
  await expect(page.getByText('Locador E2E')).toBeVisible();
  await page.getByRole('button', { name: 'Crear alquiler' }).click();

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
  await expect(page.getByText('Av. Test 999, 5A').first()).toBeVisible();
});
