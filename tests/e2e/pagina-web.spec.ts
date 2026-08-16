import { test, expect } from '@playwright/test';

test('página web: content form, publicación CRUD, pause, and preview', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole('link', { name: 'Mi página web' }).click();
  await expect(page).toHaveURL(/\/dashboard\/pagina$/);

  // Content form
  await page.locator('textarea[name="pagina_bio"]').fill('Somos una inmobiliaria del centro de Córdoba.');
  await page.locator('textarea[name="pagina_ubicacion"]').fill('Bv. San Juan 500, Córdoba');
  await page.getByRole('button', { name: 'Guardar cambios' }).first().click();
  await expect(page.getByText('Contenido guardado.')).toBeVisible();

  // Create a publicación
  await page.getByRole('link', { name: '+ Nueva publicación' }).click();
  await expect(page).toHaveURL(/\/dashboard\/pagina\/nueva$/);
  await page.locator('input').first().fill('Depto 2 ambientes en Nueva Córdoba');
  await page.getByPlaceholder('Dejalo vacío para “Consultar precio”').fill('150000');
  await page.getByRole('button', { name: 'Crear publicación' }).click();
  await expect(page).toHaveURL(/\/dashboard\/pagina$/, { timeout: 10_000 });
  await expect(page.getByText('Depto 2 ambientes en Nueva Córdoba')).toBeVisible();
  await expect(page.getByText('Activa')).toBeVisible();

  // Pause it
  await page.getByRole('button', { name: 'Pausar' }).click();
  await expect(page.getByText('Pausada')).toBeVisible();

  // Preview shows the logo/name header but not the paused listing
  const previewPage = await page.context().newPage();
  await previewPage.goto('/mi-pagina-preview');
  await expect(previewPage.getByText('Inmobiliaria del Centro')).toBeVisible();
  await expect(previewPage.getByText('Todavía no hay publicaciones activas.')).toBeVisible();
  await previewPage.close();

  // Reactivate, then preview should show it
  await page.getByRole('button', { name: 'Activar' }).click();
  await expect(page.getByText('Activa')).toBeVisible();

  const previewPage2 = await page.context().newPage();
  await previewPage2.goto('/mi-pagina-preview');
  await expect(previewPage2.getByText('Depto 2 ambientes en Nueva Córdoba')).toBeVisible();
  await expect(previewPage2.getByText('$150.000')).toBeVisible();

  // Search and filters
  await previewPage2.getByPlaceholder('Buscar por título, dirección o localidad…').fill('no existe');
  await previewPage2.keyboard.press('Enter');
  await expect(previewPage2.getByText('No encontramos publicaciones que coincidan con la búsqueda o el filtro.')).toBeVisible();

  await previewPage2.goto('/mi-pagina-preview?operacion=Venta');
  await expect(previewPage2.getByText('Todavía no hay publicaciones activas.')).not.toBeVisible();
  await expect(previewPage2.getByText('No encontramos publicaciones')).toBeVisible();

  await previewPage2.goto('/mi-pagina-preview?operacion=Alquiler');
  await expect(previewPage2.getByText('Depto 2 ambientes en Nueva Córdoba')).toBeVisible();
  await previewPage2.close();

  // Delete it
  await page.getByRole('button', { name: 'Eliminar' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('¿Eliminar publicación?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Eliminar publicación' }).click();
  await expect(page.getByText('Todavía no cargaste ninguna publicación.')).toBeVisible({ timeout: 10_000 });
});
