import { test } from '@playwright/test';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { getBaseUrl } from '../utils/env';
import { passwordScenarios, credentials } from '../data/passwordScenarios';
import { fetchLatestResetToken } from '../utils/token';

test.describe('Reset Password', () => {
  test('negative: missing token/otp and empty passwords', async ({ page }) => {
    const reset = new ResetPasswordPage(page);
    await reset.gotoWithToken(getBaseUrl(), '');
    await reset.resetPassword('', '', '');
    await reset.assertErrorContains(/token|otp|password.*required/i);
  });

  test('negative: invalid/expired token', async ({ page }) => {
    const reset = new ResetPasswordPage(page);
    await reset.gotoWithToken(getBaseUrl(), 'invalid-token');
    await reset.resetPassword('000000', 'Strong@123', 'Strong@123');
    await reset.assertErrorContains(/invalid|expired|unauthorized/i);
  });

  test('negative: password strength validations', async ({ page }) => {
    const token = await fetchLatestResetToken(credentials.forgotPassword.knownEmail);
    const reset = new ResetPasswordPage(page);
    await reset.gotoWithToken(getBaseUrl(), token);
    for (const weak of passwordScenarios.weak) {
      await reset.resetPassword(undefined, weak, weak);
      await reset.assertErrorContains(/weak|minimum|length|complexity|special|number|upper|lower/i);
    }
    for (const noSpecial of passwordScenarios.noSpecial) {
      await reset.resetPassword(undefined, noSpecial, noSpecial);
      await reset.assertErrorContains(/special/i);
    }
    for (const noNumber of passwordScenarios.noNumber) {
      await reset.resetPassword(undefined, noNumber, noNumber);
      await reset.assertErrorContains(/number|digit/i);
    }
    for (const noUpper of passwordScenarios.noUpper) {
      await reset.resetPassword(undefined, noUpper, noUpper);
      await reset.assertErrorContains(/uppercase|upper/i);
    }
    for (const noLower of passwordScenarios.noLower) {
      await reset.resetPassword(undefined, noLower, noLower);
      await reset.assertErrorContains(/lowercase|lower/i);
    }
    await reset.resetPassword(undefined, passwordScenarios.mismatch.newPassword, passwordScenarios.mismatch.confirmPassword);
    await reset.assertErrorContains(/match/i);
  });

  test('positive: successful reset with valid password', async ({ page }) => {
    const token = await fetchLatestResetToken(credentials.forgotPassword.knownEmail);
    const reset = new ResetPasswordPage(page);
    await reset.gotoWithToken(getBaseUrl(), token);
    await reset.resetPassword(undefined, passwordScenarios.valid[0], passwordScenarios.valid[0]);
    await reset.assertSuccessContains(/password.*updated|reset.*successful/i);
  });
});



