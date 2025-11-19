import { test } from '@playwright/test';
import { SetPasswordPage } from '../pages/SetPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { getBaseUrl, getTestUser } from '../utils/env';
import { passwordScenarios } from '../data/passwordScenarios';

test.describe('Set Password', () => {
  test('negative: empty and mismatched passwords', async ({ page }) => {
    const set = new SetPasswordPage(page);
    await set.goto(getBaseUrl());
    await set.setPassword('', '');
    await set.assertErrorContains(/password.*required/i);

    await set.setPassword(passwordScenarios.mismatch.newPassword, passwordScenarios.mismatch.confirmPassword);
    await set.assertErrorContains(/match/i);
  });

  test('negative: weak password patterns', async ({ page }) => {
    const set = new SetPasswordPage(page);
    await set.goto(getBaseUrl());
    for (const weak of passwordScenarios.weak) {
      await set.setPassword(weak, weak);
      await set.assertErrorContains(/weak|minimum|length|complexity|special|number|upper|lower/i);
    }
  });

  test('positive: successful set and login with new password', async ({ page }) => {
    const set = new SetPasswordPage(page);
    const login = new LoginPage(page);
    await set.goto(getBaseUrl());
    const newPass = passwordScenarios.valid[1];
    await set.setPassword(newPass, newPass);
    await set.assertSuccessContains(/password.*set|updated|success/i);

    await login.goto(getBaseUrl());
    const user = getTestUser();
    await login.login(user.email, newPass);
    await login.assertLoggedIn();
  });
});



