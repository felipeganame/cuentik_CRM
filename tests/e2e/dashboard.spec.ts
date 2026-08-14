import { test, expect } from '@playwright/test';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('dashboard lists seeded alquileres with KPIs', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Depto 3B, Nueva Córdoba')).toBeVisible();
  await expect(page.getByText('Casa 12, Cerro de las Rosas')).toBeVisible();
  await expect(page.getByText('Local 4, Centro')).toBeVisible();
  await expect(page.getByText('Alquileres activos')).toBeVisible();
  await expect(page.getByText('Fabián Torres')).toBeVisible();
});

test('dashboard search filters by address', async ({ page }) => {
  await login(page);
  await page.locator('input[name="q"]').fill('Cerro de las Rosas');
  await page.locator('input[name="q"]').press('Enter');
  await expect(page).toHaveURL(/q=Cerro/);
  await expect(page.getByText('Casa 12, Cerro de las Rosas')).toBeVisible();
  await expect(page.getByText('Depto 3B, Nueva Córdoba')).not.toBeVisible();
});

test('"Ver →" link navigates to the alquiler detail page', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Ver →' }).first().click();
  await expect(page).toHaveURL(/\/dashboard\/alquileres\/[0-9a-f-]+$/);
  await expect(page.getByRole('link', { name: 'Resumen' })).toBeVisible();
});
