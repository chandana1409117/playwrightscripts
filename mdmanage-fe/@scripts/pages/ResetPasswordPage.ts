import { expect, Page } from '@playwright/test';

export class ResetPasswordPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoWithToken(baseUrl: string, token: string): Promise<void> {
    await this.page.goto(`${baseUrl}/reset-password?token=${encodeURIComponent(token)}`);
    await expect(this.page.getByRole('heading', { name: /reset password/i })).toBeVisible({ timeout: 15000 });
  }

  otpField() {
    return this.page.getByRole('textbox', { name: /otp|code/i }).or(this.page.locator('input[name="otp"], input[id="otp"]'));
  }

  newPasswordField() {
    return this.page.getByLabel(/new password/i).or(this.page.locator('#newPassword, input[name="newPassword"]'));
  }

  confirmPasswordField() {
    return this.page.getByLabel(/confirm password/i).or(this.page.locator('#confirmPassword, input[name="confirmPassword"]'));
  }

  submitButton() {
    return this.page.getByRole('button', { name: /reset|submit|continue|update/i });
  }

  errorMessage() {
    return this.page.locator('.error, .errors, .field-error, [data-test="error"]');
  }

  toast() {
    return this.page.locator('.toast, .notification, .alert, [role="alert"]');
  }

  async resetPassword(otpOrToken: string | undefined, newPassword: string, confirmPassword: string): Promise<void> {
    if (otpOrToken) {
      await this.otpField().fill(otpOrToken);
    }
    await this.newPasswordField().fill(newPassword);
    await this.confirmPasswordField().fill(confirmPassword);
    await this.submitButton().click();
  }

  async assertErrorContains(regex: RegExp): Promise<void> {
    await expect(this.errorMessage()).toContainText(regex, { timeout: 10000 });
  }

  async assertSuccessContains(regex: RegExp): Promise<void> {
    await expect(this.toast()).toContainText(regex, { timeout: 15000 });
  }
}



