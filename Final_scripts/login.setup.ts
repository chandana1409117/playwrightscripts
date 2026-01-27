import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ✅ Load JSON Data
const dataPath = path.join(__dirname, 'testdata.json');
const testdata = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const { admin } = testdata;
test('login and save state', async ({ page }) => {
  await page.goto('https://arbmdmmanage-ui.azurewebsites.net/login');

  await page.fill('input[name="username"]', admin.username);
  await page.fill('input[name="password"]', admin.password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait until dashboard loads (successful login)
  await page.waitForURL('https://arbmdmmanage-ui.azurewebsites.net/');

  // Save cookies + local storage
  await page.context().storageState({ path: 'authState.json' });

  console.log('✔ Login successful — authState.json created');
});