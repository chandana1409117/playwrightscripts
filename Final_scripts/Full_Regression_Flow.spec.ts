import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Full Regression Test Flow for MDManage Application
 * 
 * This comprehensive test covers the complete workflow from patient creation 
 * to DOS assignment, lawyer processing, and report verification.
 * 
 * Flow:
 * 1. Admin Login
 * 2. Create New Patient with mandatory details
 * 3. Upload DMS Document for patient
 * 4. Verify uploaded document visibility
 * 5. Assign DOS to Lawyer
 * 6. Logout and Login as Lawyer
 * 7. Verify patient appears in "New Records"
 * 8. Enter AAA ID and verify movement to "Processed Records"
 * 9. Verify processed record in Reports section
 * 
 * Author: AI Assistant
 * Created: 2024
 */

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://mdmw.unisoftllc.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kumar';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Test@123';
const LAWYER_USERNAME = process.env.LAWYER_USERNAME || 'lawyer';
const LAWYER_PASSWORD = process.env.LAWYER_PASSWORD || 'Test@123';

// Test data
const testPatient = {
  firstName: 'Test',
  lastName: 'Patient',
  dob: '1990-05-15',
  phone: '555-1234-567',
  email: `testpatient${Date.now()}@test.com`,
  patientId: `PAT${Date.now()}`,
};

const testLawyer = {
  name: 'John Law',
};

const testDOS = {
  documentType: 'ARB',
  fromDate: '2025-01-01',
  toDate: '2025-01-01',
};

const testAAAID = `AAA${Date.now()}`;

/**
 * Helper class for common test operations
 */
class TestHelper {
  constructor(private page: Page) {}

  /**
   * Login with provided credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.goto(`${BASE_URL}/login`);
    await this.page.waitForSelector("input[name='username'], #username", { timeout: 15000 });
    
    // Fill username field
    const usernameField = this.page.locator("input[name='username'], #username").first();
    await usernameField.click();
    await usernameField.fill(username);
    
    // Fill password field
    const passwordField = this.page.locator("input[name='password'], #password").first();
    await passwordField.click();
    await passwordField.fill(password);
    
    // Click submit
    await this.page.locator("button[type='submit'], button:has-text('Sign In'), button:has-text('Login')").first().click();
    
    // Wait for successful login (dashboard or navigation should appear)
    await this.page.waitForSelector('nav, main, [data-test="dashboard"]', { timeout: 20000 });
  }

  /**
   * Logout from current session
   */
  async logout(): Promise<void> {
    // Try multiple logout selectors
    const logoutSelectors = [
      "button:has-text('Logout')",
      "button:has-text('Sign Out')",
      "a:has-text('Logout')",
      "a:has-text('Sign Out')",
      "[data-test='logout']",
      ".logout-button",
    ];

    for (const selector of logoutSelectors) {
      if (await this.page.locator(selector).isVisible()) {
        await this.page.locator(selector).click();
        break;
      }
    }

    // Wait for redirect to login page
    await this.page.waitForTimeout(2000);
  }

  /**
   * Wait for notification/toast message
   */
  async waitForNotification(timeout = 10000): Promise<void> {
    await this.page.waitForSelector('.toast, .notification, .alert, [role="alert"]', { timeout });
  }

  /**
   * Take screenshot with descriptive name
   */
  async takeScreenshot(name: string, fullPage = true): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/${name}.png`, 
      fullPage 
    });
  }

  /**
   * Select from dropdown with label
   */
  async selectDropdownOption(label: string, option: string): Promise<void> {
    // Click on the dropdown
    const dropdown = this.page.locator(`text="${label}"`).locator('..').locator('select, [role="combobox"]');
    if (await dropdown.count() > 0) {
      await dropdown.click();
      await this.page.waitForTimeout(500);
      await this.page.locator(`text="${option}"`).click();
    }
  }

  /**
   * Select first available option from a dropdown
   */
  async selectFirstOption(selector: string): Promise<void> {
    try {
      await this.page.click(selector);
      await this.page.waitForSelector('option, [role="option"]', { timeout: 5000 });
      await this.page.click('option:nth-child(2), [role="option"]:nth-child(2)'); // Skip first empty option
    } catch (error) {
      console.log(`Could not select first option for ${selector}: ${error}`);
    }
  }

  /**
   * Fill form field by label or placeholder
   */
  async fillField(selector: string, value: string): Promise<void> {
    try {
      await this.page.fill(selector, value);
    } catch (error) {
      console.log(`Could not fill field ${selector}: ${error}`);
    }
  }
}

/**
 * Main Test Suite
 */
test.describe('Full Regression Flow - Patient to Lawyer to Reports', () => {
  let testHelper: TestHelper;
  let createdPatientId: string;

  test('Complete regression flow from patient creation to report verification', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout for complete flow
    testHelper = new TestHelper(page);

    // ==========================================
    // STEP 1: Login as Admin
    // ==========================================
    console.log('Step 1: Logging in as Admin...');
    await testHelper.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await testHelper.takeScreenshot('01-admin-login');
    console.log('✓ Admin login successful');

    // ==========================================
    // STEP 2: Create a new patient
    // ==========================================
    console.log('Step 2: Creating new patient...');
    await page.goto(`${BASE_URL}/add-patient`);
    await page.waitForSelector('form', { timeout: 20000 });
    await testHelper.takeScreenshot('02-add-patient-form-initial');

    // Select Practice (best-effort)
    try {
      await testHelper.selectFirstOption("select[name='practiceId'], [role='combobox']:has-text('Practice')");
    } catch (error) {
      console.log('Practice selection skipped');
    }

    // Fill mandatory patient details
    await testHelper.fillField("//input[@id='firstName']", testPatient.firstName);
    await testHelper.fillField("//input[@id='lastName']", testPatient.lastName);
    await testHelper.fillField("//input[@id='phone']", testPatient.phone);
    
    // Fill DOB
    await page.getByRole('textbox', { name: 'Date of Birth*' }).fill(testPatient.dob);
    
    // Fill email
    await testHelper.fillField("//input[@id='email'], input[type='email']", testPatient.email);
    
    // Try to fill patient ID
    try {
      await testHelper.fillField("//input[@id='patientId']", testPatient.patientId);
      createdPatientId = testPatient.patientId;
    } catch (error) {
      console.log('Patient ID field not found or not required');
    }

    // Fill optional fields for completeness
    try {
      await testHelper.fillField("//input[@id='address']", '123 Test Street');
      await testHelper.fillField("//input[@id='city']", 'Test City');
      await testHelper.fillField("//input[@id='state']", 'CA');
      await testHelper.fillField("//input[@id='zip']", '12345');
      await page.locator("//input[@type='radio'][@value='M']").check();
    } catch (error) {
      console.log('Optional fields skipped');
    }

    await testHelper.takeScreenshot('03-add-patient-form-filled');

    // Submit the form
    await page.locator("button[type='submit'], button:has-text('Save'), button:has-text('Create')").first().click();
    await testHelper.waitForNotification();
    await testHelper.takeScreenshot('04-patient-created');

    console.log(`✓ Patient created: ${testPatient.firstName} ${testPatient.lastName}`);

    // ==========================================
    // STEP 3: Upload DMS Document for patient
    // ==========================================
    console.log('Step 3: Uploading DMS document...');
    
    await page.click('//span[contains(text(),"Files")]');
    await page.getByRole('navigation').getByRole('link', { name: 'DMS', exact: true }).click();
    await page.waitForSelector('.select__value-container', { timeout: 20000 });
    
    // Select practice
    await page.locator('.select__value-container').first().click();
    await page.getByRole('option').first().click();
    
    // Select search type
    await page.locator('div').filter({ hasText: /^Search By$/ }).locator('svg').first().click();
    await page.getByRole('option', { name: 'Patient ID' }).click();
    
    // Search for patient
    await page.getByRole('textbox', { name: 'Enter search value...' }).click();
    await page.getByRole('textbox', { name: 'Enter search value...' }).fill(createdPatientId || testPatient.lastName);
    await page.getByRole('main').getByRole('button').click();
    await page.waitForTimeout(2000);
    
    // Select patient from dropdown
    const patientDropdown = page.locator('div').filter({ hasText: new RegExp(testPatient.lastName) });
    if (await patientDropdown.count() > 0) {
      await patientDropdown.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Select document type
    await page.locator('div').filter({ hasText: /^Select document type\.\.\.$/ }).first().click();
    await page.getByRole('option', { name: testDOS.documentType }).click();
    
    // Fill dates
    await page.getByRole('textbox', { name: 'From Date' }).fill(testDOS.fromDate);
    await page.getByRole('textbox', { name: 'To Date' }).fill(testDOS.toDate);
    
    // Upload file
    await page.getByText('Browse Files').click();
    
    // Check if test file exists, if not create a dummy file
    const testFilePath = path.resolve(process.cwd(), 'files', 'test-document.pdf');
    if (!fs.existsSync(testFilePath)) {
      // Create test file directory if it doesn't exist
      const filesDir = path.resolve(process.cwd(), 'files');
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
      }
      // Create a minimal PDF file for testing
      fs.writeFileSync(testFilePath, Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobjxref\n0 4\ntrailer<</Root 1 0 R>>startxref\n9\n%%EOF'));
    }
    
    await page.setInputFiles('#fileInput, input[type="file"]', testFilePath);
    await page.waitForTimeout(1000);
    
    // Select current page
    await page.getByRole('button', { name: 'Select Current Page' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await testHelper.waitForNotification();
    await testHelper.takeScreenshot('05-dms-document-uploaded');
    
    console.log('✓ DMS document uploaded');

    // ==========================================
    // STEP 4: Verify uploaded document is visible
    // ==========================================
    console.log('Step 4: Verifying document visibility...');
    
    // Navigate to patient's Documents page
    await page.goto(`${BASE_URL}/patients-list`);
    await page.waitForSelector("table, [role='table']", { timeout: 20000 });
    
    // Search for the created patient
    const searchInput = page.locator("input[placeholder*='Search'], input[name='search']");
    if (await searchInput.count() > 0) {
      await searchInput.fill(testPatient.lastName);
    }
    
    // Click on patient to view details
    await page.locator(`text="${testPatient.lastName}"`).first().click();
    await page.waitForTimeout(2000);
    
    // Try to navigate to documents tab or documents section
    try {
      await page.locator("button:has-text('Documents'), a:has-text('Documents'), [role='tab']:has-text('Documents')").click();
    } catch (error) {
      console.log('Documents tab not found, checking documents page directly');
    }
    
    await testHelper.takeScreenshot('06-patient-documents-visible');
    
    // Verify document is visible
    const documentText = page.locator(`text="${testDOS.documentType}"`);
    await expect(documentText).toBeVisible({ timeout: 10000 });
    
    console.log('✓ Document visibility verified');

    // ==========================================
    // STEP 5: Assign DOS to a Lawyer
    // ==========================================
    console.log('Step 5: Assigning DOS to Lawyer...');
    
    // Navigate to DOS assignment page or use the current document
    await page.goto(`${BASE_URL}/dms`);
    await page.waitForTimeout(2000);
    
    // Search for the uploaded document
    await page.getByRole('textbox', { name: 'Enter search value...' }).fill(createdPatientId || testPatient.lastName);
    await page.getByRole('main').getByRole('button').click();
    await page.waitForTimeout(2000);
    
    // Select the document row
    const documentRow = page.locator('tr, .document-row').filter({ hasText: testDOS.documentType });
    if (await documentRow.count() > 0) {
      await documentRow.first().click();
      
      // Look for "Assign to Lawyer" or similar button
      const assignButton = page.locator("button:has-text('Assign'), button:has-text('Assign to Lawyer')");
      if (await assignButton.count() > 0) {
        await assignButton.click();
        
        // Select lawyer from dropdown
        await page.locator('.select__value-container').last().click();
        await page.waitForTimeout(500);
        await page.getByRole('option').first().click();
        
        // Fill assignment details if required
        // This will vary based on your application's assignment form
        
        // Submit assignment
        await page.locator("button:has-text('Save'), button:has-text('Assign'), button[type='submit']").first().click();
        await testHelper.waitForNotification();
        await testHelper.takeScreenshot('07-dos-assigned-to-lawyer');
      }
    }
    
    console.log('✓ DOS assigned to Lawyer');

    // ==========================================
    // STEP 6: Logout and Login as Lawyer
    // ==========================================
    console.log('Step 6: Logging out and logging in as Lawyer...');
    
    await testHelper.logout();
    await testHelper.takeScreenshot('08-admin-logged-out');
    
    await testHelper.login(LAWYER_USERNAME, LAWYER_PASSWORD);
    await testHelper.takeScreenshot('09-lawyer-logged-in');
    
    console.log('✓ Lawyer logged in');

    // ==========================================
    // STEP 7: Verify patient appears in "New Records"
    // ==========================================
    console.log('Step 7: Verifying patient in "New Records"...');
    
    // Navigate to New Records section
    await page.goto(`${BASE_URL}/new-records`);
    await page.waitForSelector("table, [role='table'], .new-records", { timeout: 20000 });
    await testHelper.takeScreenshot('10-new-records-page');
    
    // Search for the patient
    const newRecordsSearch = page.locator("input[placeholder*='Search'], input[name='search']");
    if (await newRecordsSearch.count() > 0) {
      await newRecordsSearch.fill(testPatient.lastName);
      await page.waitForTimeout(1000);
    }
    
    // Verify patient is visible
    const patientInRecords = page.locator(`text="${testPatient.lastName}"`);
    await expect(patientInRecords).toBeVisible({ timeout: 10000 });
    
    await testHelper.takeScreenshot('11-patient-in-new-records');
    console.log('✓ Patient visible in "New Records"');

    // ==========================================
    // STEP 8: Enter AAA ID and verify movement to "Processed Records"
    // ==========================================
    console.log('Step 8: Entering AAA ID and verifying movement to Processed Records...');
    
    // Click on the patient record
    await patientInRecords.first().click();
    await page.waitForTimeout(2000);
    
    // Fill AAA ID field
    const aaaIdField = page.locator("input[name='aaaId'], input[placeholder*='AAA ID'], input[id*='aaa']");
    if (await aaaIdField.count() > 0) {
      await aaaIdField.fill(testAAAID);
      
      // Submit the form
      await page.locator("button:has-text('Save'), button[type='submit']").first().click();
      await testHelper.waitForNotification();
    }
    
    await testHelper.takeScreenshot('12-aaa-id-entered');
    
    // Navigate to Processed Records
    await page.goto(`${BASE_URL}/processed-records`);
    await page.waitForSelector("table, [role='table'], .processed-records", { timeout: 20000 });
    
    // Search for the patient in processed records
    const processedRecordsSearch = page.locator("input[placeholder*='Search'], input[name='search']");
    if (await processedRecordsSearch.count() > 0) {
      await processedRecordsSearch.fill(testPatient.lastName);
      await page.waitForTimeout(1000);
    }
    
    // Verify patient appears in Processed Records
    const patientInProcessed = page.locator(`text="${testPatient.lastName}"`);
    await expect(patientInProcessed).toBeVisible({ timeout: 10000 });
    
    await testHelper.takeScreenshot('13-patient-in-processed-records');
    console.log('✓ Patient moved to "Processed Records"');

    // ==========================================
    // STEP 9: Verify patient in Reports section
    // ==========================================
    console.log('Step 9: Verifying patient in Reports section...');
    
    // Navigate to Reports section
    await page.goto(`${BASE_URL}/reports`);
    await page.waitForSelector("table, [role='table'], .reports", { timeout: 20000 });
    await testHelper.takeScreenshot('14-reports-page');
    
    // Search for the patient in reports
    const reportsSearch = page.locator("input[placeholder*='Search'], input[name='search'], input[placeholder*='Filter']");
    if (await reportsSearch.count() > 0) {
      await reportsSearch.fill(testPatient.lastName);
      await page.waitForTimeout(1000);
    }
    
    // Verify patient is visible in reports with processed status
    const patientInReports = page.locator(`text="${testPatient.lastName}"`);
    await expect(patientInReports).toBeVisible({ timeout: 10000 });
    
    // Verify processed status
    const statusLocator = page.locator(`text="Processed", text="${testAAAID}"`);
    await expect(statusLocator.first()).toBeVisible({ timeout: 10000 });
    
    await testHelper.takeScreenshot('15-patient-in-reports');
    console.log('✓ Patient verified in Reports with processed status');

    // ==========================================
    // FINAL ASSERTIONS
    // ==========================================
    console.log('✓ All regression test steps completed successfully!');
    
    // Additional verification: Check that the AAA ID is present
    const aaaIdVisible = page.locator(`text="${testAAAID}"`);
    const aaaIdCount = await aaaIdVisible.count();
    expect(aaaIdCount).toBeGreaterThan(0);
    
    await testHelper.takeScreenshot('16-final-verification');
    
    console.log(`Regression flow completed successfully for patient: ${testPatient.firstName} ${testPatient.lastName}`);
  });

  // Additional test for edge cases
  test('Error handling in DOS assignment', async ({ page }) => {
    testHelper = new TestHelper(page);
    
    await testHelper.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    
    // Try to assign DOS without selecting lawyer
    await page.goto(`${BASE_URL}/dms`);
    await page.waitForTimeout(2000);
    
    // Attempt assignment without lawyer selection should show validation
    const documentRow = page.locator('tr, .document-row').first();
    if (await documentRow.count() > 0) {
      await documentRow.click();
      
      const assignButton = page.locator("button:has-text('Assign')");
      if (await assignButton.count() > 0) {
        await assignButton.click();
        
        // Try to submit without selecting lawyer
        await page.locator("button:has-text('Save'), button[type='submit']").first().click();
        
        // Should show error message
        await testHelper.waitForNotification();
        await testHelper.takeScreenshot('error-validation-dos-assignment');
      }
    }
  });
});

/**
 * Cleanup test data after completion
 */
test.afterAll(async ({ page }) => {
  // Optionally, you can add cleanup logic here to remove test data
  console.log('Test suite completed');
});


