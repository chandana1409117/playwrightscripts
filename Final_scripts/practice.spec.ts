import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const { admin } = testData;
test.describe('Practice Management - Comprehensive Flow', () => {
  test('create, edit, view practice end-to-end', async ({ page }) => {
    // Login
    await page.goto(testData.adminUrl);
    //await page.waitForSelector("input[name='username']", { timeout: 20000 });
    await page.fill("input[name='username']", testData.admin.username);
    await page.fill("input[name='password']", testData.admin.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForSelector('nav, main', { timeout: 20000 });

    // Navigate to practice list
    await page.getByRole('navigation').getByRole('link', { name: 'Practices' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
  
    // Fill the add practice form
    await page.fill("//input[@id='practiceId']", testData.practice.practiceId);
    await page.fill("//input[@id='practiceName']", testData.practice.practiceName); 
    await page.fill("//input[@id='sisPrefix']", testData.practice.sisPrefix);                              
    await page.fill("//input[@id='doctor']", testData.practice.doctor);
    await page.fill("//input[@id='email']", testData.practice.email);        
    await page.fill("//input[@id='address1']", '123 Medical Drive');
    await page.fill("//input[@id='address2']", 'Suite 100');    
    await page.fill("//input[@id='city']", 'New York');
    await page.fill("//input[@id='state']", 'NY');
    await page.fill("//input[@id='zip']", '10001');
    await page.fill("//input[@id='tin']", '12-3456789');
    await page.fill("//input[@placeholder='Enter phone number']", '555-123-4567');
    await page.fill("//input[@id='fax']", '555-123-4568');
    await page.fill("//input[@id='header']", 'Test Medical Center - Quality Care');
    await page.fill("//input[@id='footer']", 'Thank you for choosing our services');

    const addForm = page.locator('form');
    if (await addForm.count()) {
      await addForm.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/03-add-practice-form-filled.png' });
    }

    // Submit create
    await page.locator("button[type='submit'], button:has-text('Save Practice'), button:has-text('Create')").first().click();
    await page.waitForSelector('.toast, .notification, .alert', { timeout: 10000 }).catch(() => {});
    await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/04-practice-creation-result.png', fullPage: true });

    // Back to list
    await page.goto('http://mdmw.unisoftllc.com/practice');              
    await page.waitForSelector("table, [role='table']", { timeout: 20000 });
    await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/05-practice-list-after-creation.png', fullPage: true });

    // Edit first item
    await page.locator("button:has-text('Edit'), a:has-text('Edit'), [role='button']:has-text('Edit')").first().click();
    await page.waitForSelector('form, .edit-form', { timeout: 20000 });
    await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/06-edit-practice-form.png', fullPage: true });

    // Update fields
    await page.fill("//input[@id='practiceName']", ' Medical Center12');
    await page.fill("//input[@id='doctor']", 'Dr. Jane Smith Updated235');
    await page.fill("//input[@id='email']", 'info.updated@testmedical.com');

    const editForm = page.locator('form');
    if (await editForm.count()) {
      await editForm.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/07-edit-practice-form-updated.png' });
    }

    // Submit update
    await page.locator("button[type='submit'], button:has-text('Update'), button:has-text('Save')").first().click();
    await page.waitForSelector('.toast, .notification, .alert', { timeout: 10000 }).catch(() => {});
    //await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/08-practice-update-result.png', fullPage: true });

    // Back to list again
    await page.goto('http://mdmw.unisoftllc.com/practice');              
    //await page.waitForSelector("table, [role='table']", { timeout: 20000 });
    //await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/09-practice-list-after-update.png', fullPage: true });

    // View details
    await page.locator("//button[contains(text(),'View')]").click();
    //await page.waitForSelector('.modal, .popup, .detail-view', { timeout: 10000 });
    //await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/10-practice-detail-view.png', fullPage: true });

    // Close details
    //await page.locator("button:has-text('Close'), button:has-text('×'), .close-button").first().click({ trial: false }).catch(() => {});
    //await page.waitForSelector("table, [role='table']", { timeout: 10000 });
    //await page.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/11-practice-list-final.png', fullPage: true });

    // Optional basic assertions (best-effort)
    //await expect(page.locator("table, [role='table'], .practice-list")).toBeVisible({ timeout: 5000 });
  });
});
