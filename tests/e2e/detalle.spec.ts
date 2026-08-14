import { test, expect } from '@playwright/test';

test('alquiler detail tabs and servicio toggle work', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.getByRole('link', { name: 'Ver →' }).first().click();

  await expect(page.getByText('Locador', { exact: true })).toBeVisible();
  await expect(page.getByText('Locatario', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Servicios' }).click();
  await expect(page).toHaveURL(/tab=servicios/);
  await expect(page.getByText('Agua')).toBeVisible();

  const pendienteButtons = page.getByRole('button', { name: 'Pendiente' });
  const countBefore = await pendienteButtons.count();
  if (countBefore > 0) {
    await pendienteButtons.first().click();
    await expect(page.getByRole('button', { name: 'Pagado' }).first()).toBeVisible();
  }

  await page.getByRole('link', { name: 'Pagos' }).click();
  await expect(page).toHaveURL(/tab=pagos/);
  await expect(page.getByText('Mes actual')).toBeVisible();
});
