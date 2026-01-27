import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const { admin } = testData;
test.describe('Practice Management - Comprehensive Flow', () => {
  test('create practice', async ({ page }) => {
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
    await page.fill("//input[@name='practiceId']", testData.practice.practiceId);
    await page.fill("//input[@name='practiceName']", testData.practice.practiceName); 
    await page.fill("//input[@name='sisPrefix']", testData.practice.sisPrefix);                              
    await page.fill("//input[@name='doctor']", testData.practice.doctor);
    await page.fill("//input[@name='email']", testData.practice.email);  
    await page.fill("//input[@name='phone']", testData.practice.phone);  
    await page.fill("//input[@name='fax']", testData.practice.fax);
    await page.fill("//input[@name='address1']", testData.practice.address1);
    await page.fill("//input[@name='address2']", testData.practice.address2);    
    await page.fill("//input[@name='city']", testData.practice.city);
    await page.fill("//input[@name='state']", testData.practice.state);
    await page.fill("//input[@name='zip']", testData.practice.zip);
    await page.fill("//input[@name='tin']", testData.practice.tin);
    //await page.fill("//input[@placeholder='Enter phone number']", testData.practice.phone);
    //await page.fill("//input[@name='fax']", testData.practice.fax);
    
   /* const addForm = page.locator('form');
    if (await addForm.count()) {
      await addForm.screenshot({ path: 'playright-mcp-script-mdmanage-working-v2/03-add-practice-form-filled.png' });
    }*/

   await page.getByRole('button', { name: 'Save' }).click();
  });

  test('edit practice', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Practices' }).click();              
    await page.locator('#row-2').getByRole('button', { name: 'Edit' }).click();

    await page.fill("//input[@name='practiceName']", testData.practice.practiceName);

    // Submit update
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForSelector('.toast, .notification, .alert', { timeout: 10000 }).catch(() => {});

    // Back to list again
    await page.getByRole('navigation').getByRole('link', { name: 'Practices' }).click();              

    // View details
    await page.locator('#row-2').getByRole('button', { name: 'View' }).click();
    
  });
});
