
import { test } from '@playwright/test';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';


// ✅ Load JSON Data
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));


test.describe('Add User Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const { admin, lawyer, dms, patient, amounts, aaaDetails } = testData;

    await page.goto(testData.adminUrl);
    await page.fill("input[name='username']", admin.username);
    await page.fill("input[name='password']", admin.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
  });
  test('UserManagementTest', async ({ page, context }) => {
    test.setTimeout(120000); // 2 minutes timeout

    // Navigate to URL
    /*await page.goto('http://mdmw.unisoftllc.com/login');

    // Take screenshot
    await page.screenshot({ path: 'login-page.png', fullPage: true });

    // Fill input field
    await page.fill('#username', 'kumar');
    await page.fill('#password', 'Test@123');
    
    // Click login button and wait for navigation
    await page.click('button:has-text("Sign In")');
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForLoadState('networkidle');*/

    // await page.getByRole('link', { name: 'Users' }).click();// Navigate to URL
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();


    await page.getByRole('button', { name: 'Create' }).click();// Navigate to URL
    await page.fill("//input[@name='firstName']", testData.users.firstName);

    // Fill input field
    await page.fill("//input[@name='lastName']", testData.users.lastName);

    // Fill input field
    await page.fill("//input[@name='username']", testData.users.username);

    // Fill input field
    await page.fill("//input[@name='email']", testData.users.email);

    // Fill input field
    await page.fill("//input[@name='phone']", testData.users.phone);

    // Fill input field
    await page.fill("//input[@name='password']", testData.users.password);
    await page.locator('.select__control.css-1u8xnt5-control > .select__value-container > .select__input-container').first().click();
    await page.getByText(testData.users.type, { exact: true }).click();
    await page.locator('div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
    await page.getByRole('option', { name: testData.users.role }).click();
    await page.locator('div:nth-child(3) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
    await page.getByRole('option', { name: testData.users.location }).click();
    await page.locator('div:nth-child(3) > .grid > div > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
    await page.getByRole('option', { name: testData.users.status, exact: true }).click();
    await page.locator('div:nth-child(3) > .grid > div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
    await page.getByRole('option', { name: testData.users.mfaEnabled }).click();
    await page.getByRole('button', { name: 'Save' }).click();


    // Take screenshot

  });

  // Wait for users table to load and click view button
  test('View', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();
    await page.click("//input[@placeholder='Search user..']");
    await page.getByRole('textbox', { name: 'Search user..' }).fill(testData.users.firstName);
    await page.click("//div[@title='"+testData.users.firstName+"']");
    await expect(page.getByText('testData.users.firstName')).toBeVisible();
    await expect(page.getByText('testData.users.lastName')).toBeVisible();
    await expect(page.getByText('testData.users.username')).toBeVisible();
    await expect(page.getByText('testData.users.email')).toBeVisible();
    await expect(page.getByText('testData.users.phone')).toBeVisible();
    await expect(page.getByText('testData.users.password')).toBeVisible();
    await expect(page.getByText('testData.users.type')).toBeVisible();
    await expect(page.getByText('testData.users.role')).toBeVisible();
    await expect(page.getByText('testData.users.location')).toBeVisible();
    await expect(page.getByText('testData.users.status')).toBeVisible();
    await expect(page.getByText('testData.users.mfaEnabled')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

  });

  test('Edit User', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();
    await page.getByRole('textbox', { name: 'Search user..' }).fill('testData.users.firstName');
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('testData.users.type')).toBeDisabled();

    // Wait for form and fill input field
    //await page.waitForSelector('input[id="email"]', { timeout: 10000 });

    // Fill input field
    await page.fill("//input[@name='email']", 'updateemail@example.com');

    // Fill input field
    await page.fill('input[name="phone"]', '8890876654'); 


    // Click update button and wait for response
    await page.getByRole('button', { name: 'Save' }).click();
    //await expect(page.getByRole('')).toBeVisible();

  });
  test('Cancel', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL('https://arbmdmmanage-ui.azurewebsites.net/users');
  });
});


