
import { test } from '@playwright/test';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ✅ Load JSON Data
const dataPath = path.join(__dirname, 'testdata.json');
const testdata = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
test('Authentication', async ({ page, context }) => {

    // Successful login
    test('successful login', async () => {
        await page.goto(testdata.adminUrl);
        await page.fill('input[name="username"]', testdata.admin.username);
        await page.fill('input[name="password"]', testdata.admin.password);
        await page.getByRole('button', { name: 'Sign In' }).click();
        console.log('✔ Login successful');
    });

    // Invalid login
    test('invalid login', async () => {
        await page.goto(testdata.adminUrl);
        await page.fill("input[name='username']", testdata.admin.username);
        await page.fill("input[name='password']", 'wrongpassword');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Invalid credentials')).toBeVisible();
    });


    // Fill input field
    test('empty fields', async () => {
        await page.goto(testdata.adminUrl);
        await page.fill("input[name='username']", '');
        await page.fill("input[name='password']", '');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Username is required')).toBeVisible();
    });

    //user not found
    test('user not found', async () => {
        await page.goto(testdata.adminUrl);
        await page.fill("input[name='username']", '822egd');
        await page.fill("input[name='password']", 'Test@123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('User not found')).toBeVisible();
    });

    // Logout
    test('logout', async () => {
        await page.goto(testdata.adminUrl);
        await page.fill("input[name='username']", 'kumar');
        await page.fill("input[name='password']", 'Test@123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        const loggedInUser = testdata.admin.username;
        await expect(page.getByText(loggedInUser)).toBeVisible();
        await page.click("//button[@title='" + loggedInUser + "']");
        await page.getByRole('button', { name: 'Sign out' }).click();
        console.log('✔ Logout successful');
    });
});


