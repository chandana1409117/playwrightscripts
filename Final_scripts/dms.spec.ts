import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const { admin, dms, patient, filePath } = testData;
test('DMS', async ({ page }) => {
  await page.goto(testData.adminUrl);
  await page.locator("//input[@name='username']").fill(admin.username); 
  await page.locator("//input[@name='password']").fill(admin.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
 // await expect(page).toHaveURL('http://mdmw.unisoftllc.com/dms');
  //await page.getByRole('link', { name: 'Files' }).click();
  await page.getByRole('button', { name: 'Files' }).click();
  //await page.getByRole('link', { name: 'DMS', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'DMS', exact: true }).click();


  // 🔹 Open the Practice dropdown using your XPath
  await page.locator("//div[@class='select__control css-1ku8i4k-control']//div[@class='select__input-container css-19bb58m']").click();

  // 🔹 Select the practice dynamically (from JSON)
  await page.getByRole('option', { name: dms.hospital, exact: true }).click();

  await page.getByRole('textbox', { name: 'Enter search value...' }).fill(dms.searchValue);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('div').filter({ hasText: /^Select document type\.\.\.$/ }).first().click();
  await page.getByRole('option', { name: dms.documentType }).click();

  // Fill dates
  await page.locator('input[name="fromDate"]').fill(dms.fromDate);
  await page.locator('input[name="toDate"]').fill(dms.toDate);


  // Upload section - no file picker pop-up

  // Wait for file input
  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });

  // Upload directly
  await fileInput.setInputFiles(filePath);
  console.log(` File uploaded: ${filePath}`);

  // Wait and click remaining buttons
  await page.waitForSelector('button:has-text("Select Current Page")', { state: 'visible', timeout: 60000 });
  await page.getByRole('button', { name: 'Select Current Page' }).click();
  //await page.locator('#previewArea').click({ force: true });
  console.log(" Clicked on preview area");
  // Adjust coordinates if needed


  await page.waitForSelector('button:has-text("Add")', { state: 'visible', timeout: 60000 });
  await page.getByRole('button', { name: 'Add' }).click();

  await page.waitForSelector('button:has-text("Save")', { state: 'visible', timeout: 60000 });
  await page.getByRole('button', { name: 'Save' }).click();


});





















































// Test configuration
/*const BASE_URL = 'http://mdmw.unisoftllc.com';
const TEST_CREDENTIALS = {
  username: 'kumar',
  password: 'Test@123'
};

// Test data
const TEST_DATA = {
  patientId: 'PAT001',
  patientName: 'John Doe',
  fromDate: '2024-01-01',
  toDate: '2024-12-31',
  pageNumbers: '1,2,3',
  testFilePath: path.join(__dirname, '../test-files/sample-document.pdf')
};

// Helper functions
class DMSHelper {
  constructor(private page: Page) {}

  async login() {
    await this.page.goto(`${BASE_URL}/login`);
    await this.page.waitForSelector("input[name='username']", { timeout: 20000 });
    await this.page.fill("input[name='username']", TEST_CREDENTIALS.username);
    await this.page.fill("input[name='password']", TEST_CREDENTIALS.password);
    await this.page.click("button[type='submit']");
    await this.page.waitForSelector("nav, main", { timeout: 20000 });
  }

  async navigateToDMS() {
    await this.page.goto(`${BASE_URL}/dms`);
    await this.page.waitForSelector("main, .dms-page", { timeout: 20000 });
  }

  async selectFirstOption(selector: string) {
    await this.page.click(selector);
    await this.page.waitForSelector("option, [role='option']", { timeout: 5000 });
    await this.page.click("option:first-child, [role='option']:first-child");
  }

  async fillFormField(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async uploadFile(filePath: string) {
    const fileInput = this.page.locator("input[type='file']");
    await fileInput.setInputFiles(filePath);
  }

  async waitForNotification(timeout = 10000) {
    await this.page.waitForSelector(".toast, .notification, .alert", { timeout });
  }

  async takeScreenshot(name: string, fullPage = true, selector?: string) {
    if (selector) {
      await this.page.locator(selector).screenshot({ path: `test-results/${name}.png` });
    } else {
      await this.page.screenshot({ path: `test-results/${name}.png`, fullPage });
    }
  }
}

test.describe('DMS Document Management Comprehensive Flow', () => {
  let dmsHelper: DMSHelper;

  test.beforeEach(async ({ page }) => {
    dmsHelper = new DMSHelper(page);
    await dmsHelper.login();
  });

  test('Complete DMS Document Management Flow', async ({ page }) => {
    // Step 1: Navigate to DMS main page
    await dmsHelper.navigateToDMS();
    await dmsHelper.takeScreenshot('01-dms-main-page');

    // Step 2: Test file upload dialog
    await page.click("input[type='file'], #fileInput");
    await page.waitForSelector("input[type='file']", { timeout: 5000 });
    await dmsHelper.takeScreenshot('02-dms-file-upload-dialog');

    // Step 3: Navigate to file upload page
    await page.goto(`${BASE_URL}/file-upload`);
    await page.waitForSelector("form, .upload-form", { timeout: 20000 });
    await dmsHelper.takeScreenshot('03-dms-upload-document-form');

    // Step 4: Fill upload form
    await dmsHelper.selectFirstOption("select[name='practice'], [role='combobox']:has-text('Practice')");
    await dmsHelper.fillFormField("input[name='patientId'], input[placeholder*='Patient']", TEST_DATA.patientId);
    await dmsHelper.selectFirstOption("select[name='folder'], [role='combobox']:has-text('Folder')");
    await dmsHelper.selectFirstOption("select[name='documentType'], [role='combobox']:has-text('Document Type')");
    
    await dmsHelper.takeScreenshot('04-dms-upload-form-filled', false, 'form');

    // Step 5: File selection
    await page.click("input[type='file'], button:has-text('Choose File')");
    await page.waitForSelector("input[type='file']", { timeout: 5000 });
    await dmsHelper.takeScreenshot('05-dms-file-selection');

    // Step 6: Upload document
    await page.click("button:has-text('Upload'), button[type='submit']");
    await dmsHelper.waitForNotification();
    await dmsHelper.takeScreenshot('06-dms-upload-result');

    // Step 7: Return to DMS and verify upload
    await dmsHelper.navigateToDMS();
    await dmsHelper.takeScreenshot('07-dms-after-upload');

    // Step 8: Search functionality
    await dmsHelper.fillFormField("input[placeholder*='Search'], input[name='search']", TEST_DATA.patientId);
    await page.click("button:has-text('Search'), button[type='submit']");
    await page.waitForSelector(".search-results, .patient-list", { timeout: 10000 });
    await dmsHelper.takeScreenshot('08-dms-patient-search');

    // Step 9: Practice filter
    await dmsHelper.selectFirstOption("select[name='practiceFilter'], [role='combobox']:has-text('Practice')");
    await dmsHelper.takeScreenshot('09-dms-practice-filter');

    // Step 10: Document type filter
    await dmsHelper.selectFirstOption("select[name='documentTypeFilter'], [role='combobox']:has-text('Document Type')");
    await dmsHelper.takeScreenshot('10-dms-document-type-filter');

    // Step 11: Date range filter
    await dmsHelper.fillFormField("input[name='fromDate'], input[type='date']", TEST_DATA.fromDate);
    await dmsHelper.fillFormField("input[name='toDate'], input[type='date']", TEST_DATA.toDate);
    await dmsHelper.takeScreenshot('11-dms-date-range-filter');

    // Step 12: Apply filters
    await page.click("button:has-text('Apply Filter'), button:has-text('Filter')");
    await page.waitForSelector(".filtered-results, .document-list", { timeout: 10000 });
    await dmsHelper.takeScreenshot('12-dms-filtered-results');

    // Step 13: Document viewer
    await page.click(".document-item, .file-item, [role='button']");
    await page.waitForSelector(".pdf-viewer, .document-viewer", { timeout: 10000 });
    await dmsHelper.takeScreenshot('13-dms-document-viewer');

    // Step 14: Zoom functionality
    await page.click("button:has-text('Zoom In'), button[title*='Zoom']");
    await page.waitForSelector(".pdf-viewer", { timeout: 5000 });
    await dmsHelper.takeScreenshot('14-dms-zoom-in');

    await page.click("button:has-text('Zoom Out'), button[title*='Zoom']");
    await page.waitForSelector(".pdf-viewer", { timeout: 5000 });
    await dmsHelper.takeScreenshot('15-dms-zoom-out');

    // Step 15: Rotate functionality
    await page.click("button:has-text('Rotate'), button[title*='Rotate']");
    await page.waitForSelector(".pdf-viewer", { timeout: 5000 });
    await dmsHelper.takeScreenshot('16-dms-rotate');

    // Step 16: Full screen functionality
    await page.click("button:has-text('Full Screen'), button[title*='Full Screen']");
    await page.waitForSelector(".fullscreen, .maximized", { timeout: 5000 });
    await dmsHelper.takeScreenshot('17-dms-fullscreen');

    await page.click("button:has-text('Exit Full Screen'), button[title*='Exit']");
    await page.waitForSelector(".pdf-viewer:not(.fullscreen)", { timeout: 5000 });
    await dmsHelper.takeScreenshot('18-dms-exit-fullscreen');

    // Step 17: Page selection
    await page.click("button:has-text('Page Selection'), button[title*='Page']");
    await page.waitForSelector(".page-selection, .page-options", { timeout: 5000 });
    await dmsHelper.takeScreenshot('19-dms-page-selection');

    // Step 18: Document segregation
    await page.click("button:has-text('Segregate'), button:has-text('Create Segregation')");
    await page.waitForSelector(".segregation-form, .segregation-modal", { timeout: 10000 });
    await dmsHelper.takeScreenshot('20-dms-segregation-form');

    // Fill segregation form
    await dmsHelper.fillFormField("input[name='patientName'], input[placeholder*='Patient']", TEST_DATA.patientName);
    await dmsHelper.fillFormField("input[name='fromDate']", TEST_DATA.fromDate);
    await dmsHelper.fillFormField("input[name='toDate']", TEST_DATA.toDate);
    await dmsHelper.fillFormField("input[name='pageNumbers'], input[placeholder*='Page']", TEST_DATA.pageNumbers);

    await dmsHelper.takeScreenshot('21-dms-segregation-form-filled', false, '.segregation-form');

    // Add segregation
    await page.click("button:has-text('Add Segregation'), button:has-text('Add')");
    await page.waitForSelector(".segregation-list, .segregation-item", { timeout: 5000 });
    await dmsHelper.takeScreenshot('22-dms-segregation-added');

    // Process segregation
    await page.click("button:has-text('Process Segregation'), button:has-text('Process')");
    await dmsHelper.waitForNotification();
    await dmsHelper.takeScreenshot('23-dms-segregation-processed');

    // Step 19: Document types page
    await page.goto(`${BASE_URL}/document-types`);
    await page.waitForSelector("main, .document-types-page", { timeout: 20000 });
    await dmsHelper.takeScreenshot('24-dms-document-types');

    // Step 20: Patient documents
    await page.goto(`${BASE_URL}/patient-documents/${TEST_DATA.patientId}`);
    await page.waitForSelector("main, .patient-documents", { timeout: 20000 });
    await dmsHelper.takeScreenshot('25-dms-patient-documents');

    // Step 21: E-files
    await page.goto(`${BASE_URL}/e-files/${TEST_DATA.patientId}`);
    await page.waitForSelector("main, .e-files", { timeout: 20000 });
    await dmsHelper.takeScreenshot('26-dms-e-files');

    // Step 22: File selection for fax
    await page.click("input[type='checkbox'], .select-row");
    await page.waitForSelector(".selected, .checked", { timeout: 5000 });
    await dmsHelper.takeScreenshot('27-dms-file-selection');

    // Step 23: Send as fax modal
    await page.click("button:has-text('Send as Fax'), button:has-text('Fax')");
    await page.waitForSelector(".fax-modal, .send-fax", { timeout: 10000 });
    await dmsHelper.takeScreenshot('28-dms-send-fax-modal');

    // Step 24: Close fax modal
    await page.click("button:has-text('Close'), button:has-text('Cancel')");
    await page.waitForSelector("main, .e-files", { timeout: 10000 });
    await dmsHelper.takeScreenshot('29-dms-e-files-final');
  });

  test('DMS Error Handling', async ({ page }) => {
    await dmsHelper.navigateToDMS();

    // Test invalid file upload
    await page.goto(`${BASE_URL}/file-upload`);
    await page.waitForSelector("form, .upload-form", { timeout: 20000 });
    
    // Try to upload without filling required fields
    await page.click("button:has-text('Upload'), button[type='submit']");
    
    // Should show validation errors
    await expect(page.locator('.error, .validation-error')).toBeVisible();
    await dmsHelper.takeScreenshot('error-validation-messages');

    // Test search with no results
    await dmsHelper.navigateToDMS();
    await dmsHelper.fillFormField("input[placeholder*='Search'], input[name='search']", 'NONEXISTENT123');
    await page.click("button:has-text('Search'), button[type='submit']");
    
    // Should show no results message
    await expect(page.locator('.no-results, .empty-state')).toBeVisible();
    await dmsHelper.takeScreenshot('error-no-search-results');
  });

  test('DMS Performance Test', async ({ page }) => {
    const startTime = Date.now();
    
    await dmsHelper.navigateToDMS();
    
    // Test multiple rapid operations
    for (let i = 0; i < 5; i++) {
      await dmsHelper.fillFormField("input[placeholder*='Search'], input[name='search']", `PAT00${i}`);
      await page.click("button:has-text('Search'), button[type='submit']");
      await page.waitForTimeout(1000); // Brief pause between searches
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Performance test completed in ${duration}ms`);
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });
});

test.describe('DMS Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    const dmsHelper = new DMSHelper(page);
    await dmsHelper.login();
  });

  test('DMS Accessibility Compliance', async ({ page }) => {
    await page.goto(`${BASE_URL}/dms`);
    
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label]')).toHaveCount({ min: 1 });
    
    // Check for proper heading structure
    await expect(page.locator('h1, h2, h3')).toHaveCount({ min: 1 });
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Check for proper form labels
    await expect(page.locator('label')).toHaveCount({ min: 1 });
  });
});

test.describe('DMS Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    const dmsHelper = new DMSHelper(page);
    await dmsHelper.login();
  });

  /*test('DMS Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/dms`);
    await dmsHelper.takeScreenshot('mobile-dms-main-page');
    
    // Test mobile navigation
    await page.click('button[aria-label*="menu"], .mobile-menu-button');
    await dmsHelper.takeScreenshot('mobile-dms-navigation');
    
    // Test mobile file upload
    await page.goto(`${BASE_URL}/file-upload`);
    await dmsHelper.takeScreenshot('mobile-dms-upload-form');
  });
});*/
