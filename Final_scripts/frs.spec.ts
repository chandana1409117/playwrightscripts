import { test, expect } from '@playwright/test';

// Config
const BASE_URL = process.env.BASE_URL || 'http://mdmw.unisoftllc.com';
const KNOWN_EMAIL = process.env.KNOWN_EMAIL || 'qa+knownuser@mailinator.com';
const UNKNOWN_EMAIL = process.env.UNKNOWN_EMAIL || 'qa+unknown@mailinator.com';
const LOGIN_USER = process.env.TEST_USER_EMAIL || 'kumar';
const LOGIN_PASS = process.env.TEST_USER_PASSWORD || 'Test@123';
const PROVIDED_RESET_TOKEN = process.env.RESET_TOKEN; // optional

// Test data
const invalidEmails = [
  'plainaddress',
  '@no-local-part.com',
  'user@',
  'user@domain',
  'user@domain..com',
];

const passwordSets = {
  weak: ['abc', 'password', '1234567'],
  noSpecial: ['Abcdef12', 'Password11'],
  noNumber: ['Password@', 'Strong@Pwd'],
  noUpper: ['strong@123', 'valid@123'],
  noLower: ['STRONG@123', 'VALID@123'],
  mismatch: { newPassword: 'Strong@123', confirmPassword: 'Strong@124' },
  valid: ['Str0ng@123', 'V@lidPassw0rd'],
};

// Helpers (selectors are resilient and generic)
const el = {
  heading: (page: any, text: RegExp) => page.getByRole('heading', { name: text }),
  button: (page: any, text: RegExp) => page.getByRole('button', { name: text }),
  textboxByLabel: (page: any, label: RegExp) => page.getByLabel(label),
  alert: (page: any) => page.locator('.toast, .notification, .alert, [role="alert"]'),
  error: (page: any) => page.locator('.error, .errors, .field-error, [data-test="error"]'),
};

async function assertAlertContains(page: any, re: RegExp) {
  await expect(el.alert(page)).toContainText(re, { timeout: 15000 });
}

async function assertErrorContains(page: any, re: RegExp) {
  await expect(el.error(page)).toContainText(re, { timeout: 10000 });
}

async function fetchResetToken(email: string): Promise<string> {
  if (PROVIDED_RESET_TOKEN) return PROVIDED_RESET_TOKEN;
  const apiToken = process.env.API_TOKEN;
  const res = await fetch(`${BASE_URL}/api/test-utils/reset-token?email=${encodeURIComponent(email)}`, {
    headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined,
  });
  if (!res.ok) throw new Error(`Failed to fetch reset token (${res.status})`);
  const data = (await res.json()) as { token?: string; otp?: string };
  return data.token || data.otp || '';
}

// Forgot Password
test.describe('Forgot Password', () => {
  test('empty email shows validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await el.button(page, /send reset link|submit|continue|send email/i).click();
    await assertErrorContains(page, /email.*required|enter.*email/i);
  });

  for (const invalid of invalidEmails) {
    test(`invalid email format: ${invalid}`, async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.getByRole('textbox', { name: /email/i }).fill(invalid);
      await el.button(page, /send reset link|submit|continue|send email/i).click();
      await assertErrorContains(page, /invalid.*email|enter.*valid.*email/i);
    });
  }

  test('unknown email returns generic success', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.getByRole('textbox', { name: /email/i }).fill(UNKNOWN_EMAIL);
    await el.button(page, /send reset link|submit|continue|send email/i).click();
    await assertAlertContains(page, /if an account exists|email.*sent/i);
  });

  test('known email triggers reset link', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.getByRole('textbox', { name: /email/i }).fill(KNOWN_EMAIL);
    await el.button(page, /send reset link|submit|continue|send email/i).click();
    await assertAlertContains(page, /email.*sent|reset.*link/i);
  });
});

// Reset Password
test.describe('Reset Password', () => {
  test('missing token and empty passwords', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password?token=`);
    await el.button(page, /reset|submit|continue|update/i).click();
    await assertErrorContains(page, /token|otp|password.*required/i);
  });

  test('invalid/expired token', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password?token=invalid-token`);
    await el.textboxByLabel(page, /new password/i).fill('Strong@123');
    await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill('Strong@123');
    await el.button(page, /reset|submit|continue|update/i).click();
    await assertErrorContains(page, /invalid|expired|unauthorized/i);
  });

  test('password strength validations', async ({ page }) => {
    const token = await fetchResetToken(KNOWN_EMAIL);
    await page.goto(`${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`);

    for (const p of passwordSets.weak) {
      await el.textboxByLabel(page, /new password/i).fill(p);
      await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(p);
      await el.button(page, /reset|submit|continue|update/i).click();
      await assertErrorContains(page, /weak|minimum|length|complexity|special|number|upper|lower/i);
    }

    for (const p of passwordSets.noSpecial) {
      await el.textboxByLabel(page, /new password/i).fill(p);
      await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(p);
      await el.button(page, /reset|submit|continue|update/i).click();
      await assertErrorContains(page, /special/i);
    }

    for (const p of passwordSets.noNumber) {
      await el.textboxByLabel(page, /new password/i).fill(p);
      await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(p);
      await el.button(page, /reset|submit|continue|update/i).click();
      await assertErrorContains(page, /number|digit/i);
    }

    for (const p of passwordSets.noUpper) {
      await el.textboxByLabel(page, /new password/i).fill(p);
      await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(p);
      await el.button(page, /reset|submit|continue|update/i).click();
      await assertErrorContains(page, /uppercase|upper/i);
    }

    for (const p of passwordSets.noLower) {
      await el.textboxByLabel(page, /new password/i).fill(p);
      await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(p);
      await el.button(page, /reset|submit|continue|update/i).click();
      await assertErrorContains(page, /lowercase|lower/i);
    }

    await el.textboxByLabel(page, /new password/i).fill(passwordSets.mismatch.newPassword);
    await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(passwordSets.mismatch.confirmPassword);
    await el.button(page, /reset|submit|continue|update/i).click();
    await assertErrorContains(page, /match/i);
  });

  test('successful reset with valid password', async ({ page }) => {
    const token = await fetchResetToken(KNOWN_EMAIL);
    await page.goto(`${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`);
    const newPass = passwordSets.valid[0];
    await el.textboxByLabel(page, /new password/i).fill(newPass);
    await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(newPass);
    await el.button(page, /reset|submit|continue|update/i).click();
    await assertAlertContains(page, /password.*updated|reset.*successful/i);
  });
});

// Set Password (first-time or after reset) + login
test.describe('Set Password and Login', () => {
  test('empty and mismatched passwords', async ({ page }) => {
    await page.goto(`${BASE_URL}/set-password`);
    await el.button(page, /set|save|create|submit/i).click();
    await assertErrorContains(page, /password.*required/i);

    await (el.textboxByLabel(page, /new password|password/i) || page.locator('#password, input[name="password"]')).fill(passwordSets.mismatch.newPassword);
    await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(passwordSets.mismatch.confirmPassword);
    await el.button(page, /set|save|create|submit/i).click();
    await assertErrorContains(page, /match/i);
  });

  test('weak patterns rejected; valid then login succeeds', async ({ page }) => {
    await page.goto(`${BASE_URL}/set-password`);
    for (const p of passwordSets.weak) {
      await (el.textboxByLabel(page, /new password|password/i) || page.locator('#password, input[name="password"]')).fill(p);
      await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(p);
      await el.button(page, /set|save|create|submit/i).click();
      await assertErrorContains(page, /weak|minimum|length|complexity|special|number|upper|lower/i);
    }

    const finalPass = passwordSets.valid[1];
    await (el.textboxByLabel(page, /new password|password/i) || page.locator('#password, input[name="password"]')).fill(finalPass);
    await (el.textboxByLabel(page, /confirm password/i) || page.locator('#confirmPassword, input[name="confirmPassword"]')).fill(finalPass);
    await el.button(page, /set|save|create|submit/i).click();
    await assertAlertContains(page, /password.*set|updated|success/i);

    // Login with new password
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /username|email/i }).fill(LOGIN_USER);
    const pwdInput = (el.textboxByLabel(page, /password/i) || page.locator('input[type="password"]'));
    await pwdInput.fill(finalPass);
    await el.button(page, /login|sign in/i).click();
    await expect(page.locator('nav, [data-test="dashboard"], text=/Dashboard/i')).toBeVisible({ timeout: 20000 });
  });
});


