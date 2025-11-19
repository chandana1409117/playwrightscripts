import { expect, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/login`);
    await expect(this.page.getByRole('button', { name: /login|sign in/i })).toBeVisible({ timeout: 15000 });
  }

  usernameField() {
    return this.page.getByRole('textbox', { name: /username|email/i });
  }

  passwordField() {
    return this.page.getByLabel(/password/i).or(this.page.locator('input[type="password"]'));
  }

  loginButton() {
    return this.page.getByRole('button', { name: /login|sign in/i });
  }

  toast() {
    return this.page.locator('.toast, .notification, .alert, [role="alert"]');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page.locator('nav, [data-test="dashboard"], text=/Dashboard/i')).toBeVisible({ timeout: 20000 });
  }
}



