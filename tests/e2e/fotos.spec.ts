import { test, expect } from '@playwright/test';

test('uploading a photo and a contract on the fotos tab', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('marina@delcentro.com.ar');
  await page.locator('input[name="password"]').fill('Locaria2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.getByRole('link', { name: 'Ver →' }).first().click();

  await page.getByRole('link', { name: 'Fotos y contrato' }).click();
  await expect(page).toHaveURL(/tab=fotos/);

  const jpegBytes = Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==',
    'base64'
  );
  await page.setInputFiles('input[type="file"][accept="image/jpeg"]', {
    name: 'foto.jpg',
    mimeType: 'image/jpeg',
    buffer: jpegBytes,
  });
  await expect(page.locator('img[alt=""]').first()).toBeVisible({ timeout: 10_000 });

  const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
  await page.setInputFiles('input[type="file"][accept="application/pdf"]', {
    name: 'contrato.pdf',
    mimeType: 'application/pdf',
    buffer: pdfBytes,
  });
  await expect(page.getByRole('link', { name: 'Ver contrato' })).toBeVisible({ timeout: 10_000 });
});
