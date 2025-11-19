import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { getBaseUrl } from '../utils/env';
import { credentials } from '../data/passwordScenarios';

test.describe('Forgot Password', () => {
  test('negative: empty email shows validation', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto(getBaseUrl());
    await forgot.requestReset('');
    await forgot.assertValidationMessage(/email.*required|enter.*email/i);
  });

  for (const invalid of credentials.forgotPassword.invalidEmails) {
    test(`negative: invalid email format "${invalid}"`, async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto(getBaseUrl());
      await forgot.requestReset(invalid);
      await forgot.assertValidationMessage(/invalid.*email|enter.*valid.*email/i);
    });
  }

  test('negative: unknown email shows generic message', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto(getBaseUrl());
    await forgot.requestReset(credentials.forgotPassword.unknownEmail);
    await forgot.assertSuccess(/if an account exists|email.*sent/i);
  });

  test('positive: known email triggers reset link', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto(getBaseUrl());
    await forgot.requestReset(credentials.forgotPassword.knownEmail);
    await forgot.assertSuccess(/email.*sent|reset.*link/i);
  });
});


