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

test('an implausible phone number is rejected', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.getByRole('link', { name: 'Configuración' }).click();
  const perfilForm = page.locator('form').filter({ hasText: 'Perfil de la inmobiliaria' });

  await perfilForm.locator('input[name="telefono_numero"]').fill('123');
  await perfilForm.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('El número debe tener entre 6 y 13 dígitos.')).toBeVisible();

  await perfilForm.locator('input[name="telefono_numero"]').fill('3515557778889990001');
  await perfilForm.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('El número debe tener entre 6 y 13 dígitos.')).toBeVisible();
});
