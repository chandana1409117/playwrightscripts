
import { test } from '@playwright/test';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';


// ✅ Load JSON Data
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function getRandomUser() {
  const randomIndex=Math.floor(Math.random()*testData.users.length);
  return testData.users[randomIndex];
}

let createdUser:any;

test.describe.serial('Add User Scenarios', () => {
  test.beforeAll(async () => {
    createdUser = getRandomUser(); // generate ONCE
  });
  
  
  test.beforeEach(async ({ page }) => {
    
    const { admin, lawyer, dms, patient, amounts, aaaDetails } = testData;

    await page.goto(testData.adminUrl);
    await page.fill("//input[@name='username']", admin.username);
    await page.fill("//input[@name='password']", admin.password);
    await page.locator('//button[@type="submit"]').click();
  });
  test('UserManagementTest', async ({ page, context }) => {
    //test.setTimeout(120000); // 2 minutes timeout

   

    
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();


    await page.getByRole('button', { name: 'Create' }).click();// Navigate to URL
    await page.fill("//input[@name='firstName']", createdUser.firstName);

    // Fill input field
    await page.fill("//input[@name='lastName']", createdUser.lastName);

    // Fill input field
    await page.fill("//input[@name='username']", createdUser.username);

    // Fill input field
    await page.fill("//input[@name='email']", createdUser.email);

    // Fill input field
    await page.fill("//input[@name='phone']", createdUser.phone);

    // Fill input field
    await page.fill("//input[@name='password']", createdUser.password);
    await page.locator('.select__control.css-1u8xnt5-control > .select__value-container > .select__input-container').first().click();
    await page.getByText(createdUser.type, { exact: true }).click();
    await page.locator('div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
    await page.getByRole('option', { name: createdUser.role }).click();
    await page.locator('div:nth-child(3) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
    await page.getByRole('option', { name: createdUser.location }).click();
    await page.locator('div:nth-child(3) > .grid > div > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').first().click();
    await page.getByRole('option', { name: createdUser.status, exact: true }).click();
    await page.locator('div:nth-child(3) > .grid > div:nth-child(2) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
    await page.getByRole('option', { name: createdUser.mfaEnabled }).click();
    await page.getByRole('button', { name: 'Save' }).click();


    

  });

  // Wait for users table to load and click view button
  test('View', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();
    await page.click("//input[@placeholder='Search user..']");
    await page.getByRole('textbox', { name: 'Search user..' }).fill(createdUser.firstName+" "+createdUser.lastName);
    await page.click("//div[@title='"+createdUser.firstName+" "+createdUser.lastName+"']");
    await expect(page.getByText(createdUser.firstName)).toBeVisible();
    await expect(page.getByText(createdUser.lastName)).toBeVisible();
    await expect(page.getByText(createdUser.username)).toBeVisible();
    await expect(page.getByText(createdUser.email)).toBeVisible();
    await expect(page.getByText(createdUser.phone)).toBeVisible();
    await expect(page.getByText(createdUser.password)).toBeVisible();
    await expect(page.getByText(createdUser.type)).toBeVisible();
    await expect(page.getByText(createdUser.role)).toBeVisible();
    await expect(page.getByText(createdUser.location)).toBeVisible();
    await expect(page.getByText(createdUser.status)).toBeVisible();
    await expect(page.getByText(createdUser.mfaEnabled)).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

  });

  test('Edit User', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Users' }).click();
    await page.getByRole('textbox', { name: 'Search user..' }).fill(createdUser.firstName+" "+createdUser.lastName);
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText(createdUser.type)).toBeDisabled();

    // Wait for form and fill input field
    //await page.waitForSelector('input[id="email"]', { timeout: 10000 });

    // Fill input field
    await page.fill("//input[@name='email']", 'update'+createdUser.email);

    // Fill input field
    await page.fill('input[name="phone"]', '91'+createdUser.phone); 


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


