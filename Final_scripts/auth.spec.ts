
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('AuthenticationFlow_2025-09-05', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/');

    // Take screenshot
    await page.screenshot({ path: '01-login-page-initial.png', fullPage: true });

    // Fill input field
    await page.fill("//input[@name='username']", 'kumar');

    // Fill input field
   // await page.fill('input[type="text"]', 'kumar');

    // Fill input field
    await page.fill("//input[@name='password']", 'Test@123');

    // Take screenshot
    await page.screenshot({ path: '02-login-form-filled.png' });

    // Click element
    await page.click("//button[@type='submit']");      

    // Take screenshot
    await page.screenshot({ path: '03-dashboard-after-login.png', fullPage: true });

    // Navigate to URL
    //await page.goto('http://mdmw.unisoftllc.com/profile');

    // Take screenshot
    await page.screenshot({ path: '04-user-profile-page.png', fullPage: true });

    // Stable post-login check
    await page.getByRole('button', { name: 'KM Kumar Mdmanage SUPER ADMIN' }).click();

     await page.getByRole('button', { name: 'Sign out' }).click();

    // Take screenshot
    await page.screenshot({ path: '05-logout-success.png', fullPage: true });

    // Navigate to URL
    await page.goto('https://arbtestmanage-ui.azurewebsites.net/');

    // Fill input field
    // Stable post-login check
    await page.fill("input[name='username']", 'invaliduser');
    // Stable post-login check
    // Stable post-login check

    // Fill input field
    await page.fill("//input[@name='password']", 'wrongpassword'); 

    // Click element
    await page.click("//button[@type='submit']");

    // Take screenshot
    await page.screenshot({ path: '06-invalid-login-error.png', fullPage: true });

    // Fill input field
    await page.fill("//input[@name='username']", '');

    // Fill input field
    await page.fill("//input[@name='password']", '');

    // Click element
    await page.click("//button[@type='submit']");

    // Take screenshot
    await page.screenshot({ path: '07-empty-fields-error.png', fullPage: true });

    // Fill input field
    await page.fill("//input[@name='username']", 'kumar');

    // Fill input field
    await page.fill("//input[@name='password']", 'Test@123');

    // Click element
    await page.click("//button[@type='submit']");

    // Take screenshot
    await page.screenshot({ path: '08-successful-login-after-errors.png', fullPage: true });
});
          

