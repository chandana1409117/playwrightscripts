import { expect, Locator, Page } from '@playwright/test';

export async function waitForVisible(locator: Locator, timeoutMs = 10000): Promise<void> {
  await expect(locator).toBeVisible({ timeout: timeoutMs });
}

export async function waitForToast(page: Page, timeoutMs = 15000): Promise<Locator> {
  const toast = page.locator('.toast, .notification, .alert, [role="alert"]');
  await expect(toast).toBeVisible({ timeout: timeoutMs });
  return toast;
}

export async function waitForUrl(page: Page, regex: RegExp, timeoutMs = 10000): Promise<void> {
  await expect(page).toHaveURL(regex, { timeout: timeoutMs });
}



