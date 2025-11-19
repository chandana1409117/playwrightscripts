import { expect, Page } from '@playwright/test';            

export class ForgotPasswordPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/forgot-password`);
    await expect(this.page.getByRole('heading', { name: /forgot password/i })).toBeVisible({ timeout: 10000 });
  }

  emailField() {
    return this.page.getByRole('textbox', { name: /email/i });
  }

  submitButton() {
    return this.page.getByRole('button', { name: /send reset link|submit|continue|send email/i });
  }

  toast() {
    return this.page.locator('.toast, .notification, .alert, [role="alert"]');
  }

  errorMessage() {
    return this.page.locator('.error, .errors, .field-error, [data-test="error"]');
  }

  async requestReset(email: string): Promise<void> {
    await this.emailField().fill(email);
    await this.submitButton().click();
  }

  async assertValidationMessage(regex: RegExp): Promise<void> {
    await expect(this.errorMessage()).toContainText(regex, { timeout: 10000 });
  }

  async assertSuccess(regex: RegExp): Promise<void> {
    await expect(this.toast()).toContainText(regex, { timeout: 15000 });
  }
}


