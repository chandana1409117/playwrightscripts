import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const { lawyer } = testData;


test('Lawyer', async ({ page }) => {
  await page.goto(testData.lawyerUrl);
  await page.fill('input[name="username"]', testData.lawyer.username);
  await page.fill('input[name="password"]', testData.lawyer.password);
  await page.getByRole('button', { name: 'Sign In' }).click();





  // 🔹 Go to New Records page
  await page.getByRole('link', { name: 'New Records' }).click();
  await page.waitForSelector('[data-testid^="expander-button"]');


  // 🔹 Expand the first (newest) patient
  const firstExpander = page.locator('[data-testid^="expander-button"]').first();
  await firstExpander.click();
  console.log('✅ Expanded first patient record');

  // 🔹 Click on the first DOS range (contains "_")

  const firstDOS = page.locator('td').filter({ hasText: '_' }).first();
  const dosText = await firstDOS.innerText();
  await firstDOS.click();
  console.log(`✅ Opened DOS range: ${dosText}`);

  // Wait for the page to stabilize after clicking DOS
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // 🔹 Handle file view popup (View this file)
  // Wait for the button to be visible first
  const viewButton = page.locator('button[title="View file"]').first();
  await page.waitForSelector('button[title="View file"]', { timeout: 30000 });
  
  // Ensure page is still open before waiting for popup
  if (page.isClosed()) {
    throw new Error('Page was closed before popup could be opened');
  }

  const [filePage] = await Promise.all([
    page.waitForEvent('popup'),
    viewButton.click()
  ]);
  
  await filePage.waitForLoadState('domcontentloaded');
  console.log('✅ File opened in new tab');

  // Optional: validate file content or wait briefly
  await filePage.waitForTimeout(2000);

  // Close file view and return
  await filePage.close();
  await page.bringToFront();
  console.log('✅ Switched back to main app tab');

  // Wait for table to reload and ensure we're on New Records page
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('[data-testid^="expander-button"]', { timeout: 10000 });

  // 🔹 Handle file download (Download this file)
  // Wait for download button to be visible (in case modal needs to refresh)
  const downloadButton = page.getByRole('button', { name: 'Download this file' }).first();
  await downloadButton.waitFor({ state: 'visible', timeout: 30000 });

  // Ensure page is still open before waiting for download
  if (page.isClosed()) {
    throw new Error('Page was closed before download could be initiated');
  }

  const [downloadPromise] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    downloadButton.click(),
  ]);
  await downloadPromise;
  console.log('✅ File downloaded successfully');

  // Ensure we're back on New Records page
  await page.bringToFront();
  await page.waitForLoadState('domcontentloaded');
  console.log('✅ Returned to New Records page');

  // 🔹 Find record row using DOS text dynamically
  const targetRow = page.locator(`tr:has-text("${dosText}"):not(:has-text("Billing"))`).first();

  // Wait until the row is visible
  await targetRow.waitFor({ state: 'visible', timeout: 10000 });

  // Scroll into view
  await targetRow.scrollIntoViewIfNeeded();
  // 🔹 Wait and click correct Start Processing button in that row
  const rejectButton = targetRow.locator('//button[@title="Reject Record"]');
  await rejectButton.waitFor({ state: 'visible', timeout: 10000 });
  await rejectButton.click();
  console.log('✅ Clicked Reject Record button');
  await page.getByRole('textbox', { name: 'Comments *' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill('Rejected');
  await page.click('//button[normalize-space()="Reject"]');
  /*const rejectButton2 = targetRow.locator('//button[@title="Reject"]');
  await rejectButton2.waitFor({ state: 'visible', timeout: 10000 });
  await rejectButton2.click();
  console.log('✅ Clicked Reject button');*/
  const requestMoreInformationButton = targetRow.locator('//button[@title="Request More Information"]');
  await requestMoreInformationButton.waitFor({ state: 'visible', timeout: 10000 });
  await requestMoreInformationButton.click();
  console.log('✅ Clicked Request More Information button');
  await page.getByRole('textbox', { name: 'Comments *' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill('Additional info');
  await page.getByRole('button', { name: 'Submit' }).click();
  console.log('✅ Clicked Submit button');
  console.log('✅ Record rejected successfully');

  const startButton = targetRow.locator('//button[@title="Start Processing Record"]');
  await startButton.waitFor({ state: 'visible', timeout: 10000 });
  await startButton.click();
  console.log('✅ Clicked Start Processing button');

  // 🔹 Fill AAA ID and comments (from JSON or inline)
  await page.fill('//input[@id="start-processing-aaa-id"]', testData.aaaDetails.aaaId);
  await page.fill('//textarea[@id="start-processing-comments"]', testData.aaaDetails.comments);
  await page.click('//button[@type="button"][normalize-space()="Start Processing"]');
  console.log('✅ Record moved to processed successfully');

  // 🔹 Go to Processed Records

  // Go to Processed Records
  await page.getByRole('link', { name: 'Processed Records' }).click();
  await page.waitForLoadState('networkidle');

  // Wait until patient expanders are visible
  await page.waitForSelector('[data-testid^="expander-button"]', { state: 'visible', timeout: 20000 });
  console.log('✅ Processed Records page loaded');

  const expanders = await page.locator('[data-testid^="expander-button"]').all();
  let found = false;

  for (const expander of expanders) {
    await expander.scrollIntoViewIfNeeded();
    await expander.click();
    console.log('🔹 Expanded patient');

    // Wait for DOS rows under this patient
    const dosRows = page.locator('tr').filter({ hasText: '_' });
    const count = await dosRows.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const dosTextFound = await dosRows.nth(i).innerText();

        if (dosTextFound.includes(dosText)) {
          console.log(`✅ Found matching DOS: ${dosText} inside expanded patient`);

          // Make sure the row is visible & clickable
          /* const dosCell = dosRows.nth(i).locator('td', { hasText: dosText });
           await dosCell.scrollIntoViewIfNeeded();
           await dosCell.waitFor({ state: 'visible', timeout: 5000 });
   
           // ✅ Handle fast-opening popup safely
           const [newPage] = await Promise.all([
             page.context().waitForEvent('page'),  // waits for any new tab in the context
             dosCell.click({ force: true }),
           ]);
           
           await newPage.waitForLoadState('domcontentloaded');
           console.log(`✅ View File opened for DOS: ${dosText}`);
           
           // Optional wait if it’s a PDF or slow-loading file
           await newPage.waitForTimeout(2000);
           await newPage.close();
           await page.bringToFront();
           console.log('✅ Closed View File tab and returned to main page');
         }*/
  // 🔹 Continue with AAA ID update
  const dosRow = dosRows.nth(i);
  await dosRow.getByRole('button', { name: 'AAA ID' }).click();
  await page.locator('div').filter({ hasText: /^Yes$/ }).nth(3).click();
  await page.fill('//input[@id="aaaId"]', testData.processedAAAID.aaaId);
  await page.fill('//input[@id="comments"]', testData.processedAAAID.comments);
  await page.getByRole('button', { name: 'Update AAA Index' }).click();
  console.log('✅ AAA Index updated successfully');
  found = true;
  break; 
}
}
}
if (found) break;
}

if (!found) {
console.error(`❌ No record found with DOS: ${dosText}`);
}

  // 🔹 Go to Reports page
  await page.getByRole('link', { name: 'Attorney Records' }).click();
  await page.getByRole('button').nth(2).click();
  await page.locator('.css-8mmkcg').first().click();
  await page.getByRole('option', { name: testData.reports.hospital }).click();
  //await page.locator('.css-8mmkcg').first().click();
  await page.locator('.grid > div:nth-child(2) > div > div > .w-full.css-b62m3t-container > .select__control > .select__indicators > .select__indicator.select__dropdown-indicator > .css-8mmkcg').click();
  await page.getByRole('option', { name: testData.reports.recordType }).click();
  await page.locator('div:nth-child(3) > div > div > .w-full.css-b62m3t-container > .select__control > .select__indicators > .select__indicator.select__dropdown-indicator > .css-8mmkcg').click();
  await page.getByRole('option', { name: testData.reports.aaaIndex }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
});


