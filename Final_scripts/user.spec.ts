
import { test } from '@playwright/test';
import { expect } from '@playwright/test';


test.describe('Add User Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/login');
    await page.fill("input[name='username']", 'kumar');
    await page.fill("input[name='password']", 'Test@123');
    await page.click("//button[@type='submit']");
  });
  test('UserManagementTest_2025-09-08', async ({ page, context }) => {
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
    await page.click("//span[contains(text(),'Users')]");
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/users');

    await page.getByRole('button', { name: 'Create' }).click();// Navigate to URL
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/add-user');


    // Take screenshot


    await page.fill('input[name="firstName"]', 'James');

    // Fill input field
    await page.fill('input[name="lastName"]', 'Williams');

    // Fill input field
    await page.fill('input[name="username"]', 'jameswilliams');

    // Fill input field
    await page.fill('input[name="email"]', 'james.williams@example.com');

    // Fill input field
    await page.fill("input[name='phone']", '9876543210');

    // Fill input field
    await page.fill('input[name="password"]', 'Test@123');
    await page.locator('.select__control.css-1u8xnt5-control > .select__value-container > .select__input-container').first().click();
    await page.getByText('Internal', { exact: true }).click();
    await page.locator('div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
    await page.getByRole('option', { name: 'Staff' }).click();
    await page.locator('div:nth-child(3) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
    await page.getByRole('option', { name: 'Billing-India' }).click();
    await page.locator('div:nth-child(3) > .grid > div > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
    await page.getByRole('option', { name: 'Active', exact: true }).click();
    await page.locator('div:nth-child(3) > .grid > div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
    await page.getByRole('option', { name: 'Enabled' }).click();
    /* await page.locator('.select__value-container').first().click();
     await page.getByRole('option', { name: 'Internal' }).click();
     await page.locator('.select__control.css-f0b3z1-control > .select__value-container').first().click();
     await page.getByRole('option', { name: 'Admin' }).click();
     await page.locator('div').filter({ hasText: /^Select\.\.\.$/ }).nth(3).click();
     await page.getByRole('option', { name: 'Billing-India' }).click();*/



    // Take screenshot
    await page.screenshot({ path: '03-add-user-form-filled.png' });

    // Click submit button and wait for response
    await page.click('//button[normalize-space()="Save"]');


    // Take screenshot

  });

  // Wait for users table to load and click view button
  test('View', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/users');
    await page.click("//input[@placeholder='Search user..']");
    await page.getByRole('textbox', { name: 'Search user..' }).fill('chandana');
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.click("//button[normalize-space()='Cancel']");

  });



  // Take screenshot


  // Click edit button and wait for form
  //await page.waitForSelector("//button[normalize-space()='Edit User']", { timeout: 15000 });
  test('Edit User', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/users');
    await page.getByRole('textbox', { name: 'Search user..' }).fill('chandana');
    await page.getByRole('button', { name: 'Edit' }).first().click();


    // await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: '07-edit-user-form.png', fullPage: true });

    // Wait for form and fill input field
    //await page.waitForSelector('input[id="email"]', { timeout: 10000 });

    // Fill input field
    await page.fill("input[name='email']", 'john.updated@example.com');

    // Fill input field
    await page.fill('input[name="phone"]', '8890876654'); // Phone number field


    // Click update button and wait for response
    await page.getByRole('button', { name: 'Save' }).click();

  });
  test('Cancel', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/users');
    await page.click("//span[contains(text(),'Create')]");
    await expect(page).toHaveURL('https://arbtestmanage-ui.azurewebsites.net/add-user');
    await page.click("//button[normalize-space()='Cancel']");
    await expect(page).toHaveURL('https://arbtestmanage-ui.azurewebsites.net/users');
  });
});


/*await page.locator('.select__control.css-1u8xnt5-control > .select__value-container > .select__input-container').first().click();
  await page.getByText('InternalExternal').click();
  await page.locator('.select__control.css-1u8xnt5-control > .select__value-container > .select__input-container').first().click();
  await page.getByText('External', { exact: true }).click();
  await page.getByRole('option', { name: 'Staff' }).click();
  await page.locator('div:nth-child(3) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
  await page.getByRole('option', { name: 'Billing-India' }).click();
  await page.locator('div:nth-child(3) > .grid > div > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
  await page.getByRole('option', { name: 'Active', exact: true }).click();
  await page.locator('div:nth-child(3) > .grid > div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
  await page.getByRole('option', { name: 'Enabled' }).click();
});*/