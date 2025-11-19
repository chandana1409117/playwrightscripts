import { expect, Page } from '@playwright/test';

export class SetPasswordPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/set-password`);
    await expect(this.page.getByRole('heading', { name: /set password|create password/i })).toBeVisible({ timeout: 15000 });
  }

  newPasswordField() {
    return this.page.getByLabel(/new password|password/i).or(this.page.locator('#password, input[name="password"]'));
  }

  confirmPasswordField() {
    return this.page.getByLabel(/confirm password/i).or(this.page.locator('#confirmPassword, input[name="confirmPassword"]'));
  }

  submitButton() {
    return this.page.getByRole('button', { name: /set|save|create|submit/i });
  }

  strengthMeter() {
    return this.page.locator('[data-test="password-strength"], .password-strength');
  }

  errorMessage() {
    return this.page.locator('.error, .errors, .field-error, [data-test="error"]');
  }

  toast() {
    return this.page.locator('.toast, .notification, .alert, [role="alert"]');
  }

  async setPassword(newPassword: string, confirmPassword: string): Promise<void> {
    await this.newPasswordField().fill(newPassword);
    await this.confirmPasswordField().fill(confirmPassword);
    await this.submitButton().click();
  }

  async assertStrengthContains(regex: RegExp): Promise<void> {
    await expect(this.strengthMeter()).toContainText(regex);
  }

  async assertErrorContains(regex: RegExp): Promise<void> {
    await expect(this.errorMessage()).toContainText(regex, { timeout: 10000 });
  }

  async assertSuccessContains(regex: RegExp): Promise<void> {
    await expect(this.toast()).toContainText(regex, { timeout: 15000 });
  }
}



