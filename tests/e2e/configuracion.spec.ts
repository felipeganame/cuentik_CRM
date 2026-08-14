import { test, expect } from '@playwright/test';

test('configuracion page updates profile fields', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.getByRole('link', { name: 'Configuración' }).click();
  await expect(page).toHaveURL(/\/dashboard\/configuracion$/);

  await page.locator('input[name="nombre_contacto"]').fill('Marina Ríos Editado');
  await page.locator('form').filter({ hasText: 'Perfil de la inmobiliaria' }).getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page.getByText('Guardado.')).toBeVisible();
});
