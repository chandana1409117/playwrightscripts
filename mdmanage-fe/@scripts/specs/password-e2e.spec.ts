import { test } from '@playwright/test';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { getBaseUrl } from '../utils/env';
import { passwordScenarios, credentials } from '../data/passwordScenarios';
import { fetchLatestResetToken } from '../utils/token';

test('Password E2E: forgot → reset → login with new password', async ({ page }) => {
  const forgot = new ForgotPasswordPage(page);
  const reset = new ResetPasswordPage(page);
  const login = new LoginPage(page);

  await forgot.goto(getBaseUrl());
  await forgot.requestReset(credentials.forgotPassword.knownEmail);
  await forgot.assertSuccess(/email.*sent|reset.*link/i);

  const token = await fetchLatestResetToken(credentials.forgotPassword.knownEmail);
  await reset.gotoWithToken(getBaseUrl(), token);
  const newPass = passwordScenarios.valid[0];
  await reset.resetPassword(undefined, newPass, newPass);
  await reset.assertSuccessContains(/password.*updated|reset.*successful/i);

  await login.goto(getBaseUrl());
  await login.login(credentials.validUser.email, newPass);
  await login.assertLoggedIn();
});



