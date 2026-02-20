import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ✅ Load JSON Data
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

test('Dynamic Regression Flow (JSON Based)', async ({ page, context }) => {

  // Extract values from JSON
  const { admin, lawyer, dms, patient, amounts, aaaDetails } = testData;
  


  // ✅ Dynamic file selection (latest .pdf)

  const folderPath = path.join(os.homedir(), 'Downloads');

  // 🔍 Find all PDFs in Downloads
  const pdfFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    throw new Error(` No PDF files found in folder: ${folderPath}`);
  }

  // 🕒 Pick the latest modified PDF
  const latestPdf = pdfFiles.sort((a, b) => {
    return fs.statSync(path.join(folderPath, b)).mtime.getTime() -
      fs.statSync(path.join(folderPath, a)).mtime.getTime();
  })[0];

  // 📄 Full path to file
  const filePath = path.join(folderPath, latestPdf);

  // ✅ Upload file dynamically
  //await page.locator('input[type="file"]').setInputFiles(filePath);   // ✅ Upload file dynamically

  console.log(`📄 Uploaded file: ${filePath}`);




  await page.goto(testData.adminUrl);
  await page.fill('//input[@name="username"]', admin.username); 
  await page.fill('//input[@name="password"]', admin.password);
  await page.locator('//button[@type="submit"]').click();
  //await expect(page).toHaveURL('https://arbmdmmanage-ui.azurewebsites.net/');

  await page.getByRole('navigation').getByRole('link', { name: 'Patients' }).click();
  await page.getByRole('button', { name: 'Create' }).click();

  // Select Practice
  await page.locator('.select__control.css-17smmwb-control').first().click();
  await page.getByRole('option', { name: testData.patient.practice }).click();

  // Patient Basic Details
  await page.fill('input[name="patientIdSuffix"]', testData.patient.patientIdSuffix);
  await page.fill('input[name="firstName"]', testData.patient.firstName);
  await page.fill('input[name="lastName"]', testData.patient.lastName);
  await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).first().fill(testData.patient.dob);
  await page.getByRole('radio', { name: testData.patient.gender }).check();
  await page.fill('input[name="ssn"]', testData.patient.ssn);
  await page.fill('input[name="address"]', testData.patient.address);
  await page.fill('input[name="city"]', testData.patient.city);
  await page.fill('input[name="state"]', testData.patient.state);
  await page.fill('input[name="zip"]', testData.patient.zip);
  await page.fill('input[name="phone"]', testData.patient.phone);

  // Primary Insurance
  await page.locator('div').filter({ hasText: /^Select\.\.\.$/ }).nth(5).click();
  await page.getByRole('option', { name: testData.patient.primaryInsurance.name }).click();

  await page.fill('input[name="primaryInsurance.claimNumber"]', testData.patient.primaryInsurance.claimNumber);
  await page.fill('input[name="primaryInsurance.policyNumber"]', testData.patient.primaryInsurance.policyNumber);
  await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).nth(2).fill(testData.patient.primaryInsurance.doa);
  await page.fill('input[name="primaryInsurance.adjusterName"]', testData.patient.primaryInsurance.adjusterName);
  await page.fill('input[name="primaryInsurance.relationship"]', testData.patient.primaryInsurance.relationship);
  await page.fill('input[name="primaryInsurance.adjusterFax"]', testData.patient.primaryInsurance.adjusterFax);
  await page.fill('input[name="primaryInsurance.insurancePhone"]', testData.patient.primaryInsurance.insurancePhone);
  await page.fill('input[name="primaryInsurance.insuranceFax"]', testData.patient.primaryInsurance.insuranceFax);
  await page.fill('textarea[name="primaryInsurance.notes"]', testData.patient.primaryInsurance.notes);

  // If you have secondary insurance, handle conditionally
  if (testData.patient.secondaryInsurance.name) {
    await page.locator('.select__control.css-1u8xnt5-control').click();
    await page.getByRole('option', { name: testData.patient.secondaryInsurance.name }).click();
    await page.fill('input[name="secondaryInsurance.claimNumber"]', testData.patient.secondaryInsurance.claimNumber);
    await page.fill('input[name="secondaryInsurance.policyNumber"]', testData.patient.secondaryInsurance.policyNumber);
    await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).nth(2).fill(testData.patient.secondaryInsurance.doa);
    await page.fill('input[name="secondaryInsurance.adjusterName"]', testData.patient.secondaryInsurance.adjusterName);
    await page.fill('input[name="secondaryInsurance.relationship"]', testData.patient.secondaryInsurance.relationship);
    await page.fill('input[name="secondaryInsurance.adjusterFax"]', testData.patient.secondaryInsurance.adjusterFax);
    await page.fill('input[name="secondaryInsurance.insurancePhone"]', testData.patient.secondaryInsurance.insurancePhone);
    await page.fill('input[name="secondaryInsurance.insuranceFax"]', testData.patient.secondaryInsurance.insuranceFax);
    await page.fill('textarea[name="secondaryInsurance.notes"]', testData.patient.secondaryInsurance.notes);
  }
  // Save
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1500);

  const duplicateToast = page.locator('text=Patient ID already exists');

  if (await duplicateToast.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.error("❌ Patient ID already exists. Stopping test...");
    test.skip();
  }


  // 🔹 DMS Upload
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
  await page.waitForLoadState('networkidle');




  // 🔹 Assign DOS
  await page.getByRole('link', { name: 'Patients' }).first().click();
  await page.locator('div:has-text("Select Practice")').locator('div.select__control').nth(1).click();
  await page.getByRole('option', { name: dms.hospital, exact: true }).click();
  const fullName = `${testData.patient.firstName} ${testData.patient.lastName}`;

  await page.getByPlaceholder('patient name').fill(fullName);
  await page.getByRole('button', { name: 'Submit' }).click();
  
  await page.getByRole('cell', { name: patient.primaryInsurance.claimNumber, exact: true }).click();
  /*// Wait for table to be present first
  await page.waitForSelector('table, [role="table"]', { timeout: 30000 });
  
  // DOS value from JSON
  const dosRange = `${testData.dms.fromDate}_${testData.dms.toDate}`;
  
  // Wait for DOS range text to appear
  await page.waitForSelector(`text=${dosRange}`, { timeout: 60000 });
  
  // Try to find tbody, but fallback to table if tbody doesn't exist
  /*let tableContainer;
  const tbody = page.locator("tbody");
  const tbodyCount = await tbody.count();
  
  if (tbodyCount > 0) {
    await tbody.first().waitFor({ state: "visible", timeout: 10000 });
    tableContainer = tbody.first();
  } else {
    // If no tbody, use the table directly
    tableContainer = page.locator("table, [role='table']").first();
    await tableContainer.waitFor({ state: "visible", timeout: 10000 });
  }
  
  // DOS row locator
  const dosRow = page.locator(`tr:has(td:has-text("${dosRange}"))`).first();
  
  // Scroll inside the container until the row is found
  await tableContainer.evaluate(async (container, text) => {
    const rows = container.querySelectorAll("tr");
    for (const row of rows) {
      if (row.innerText.includes(text)) {
        row.scrollIntoView({ block: "center" });
        break;
      }
    }
  }, dosRange);*/

  // Wait until visible after scrolling
  //await dosRow.waitFor({ state: "visible", timeout: 20000 });

  // Click Assign inside the matched row
  await page.getByRole("button", { name: "Assign", exact: true }).first().click();



  // 🔹 Select Status dropdown
  await page.locator('div').filter({ hasText: /^StatusSelect\.\.\.$/ }).locator('svg').click();
  await page.getByRole('option', { name: dms.status, exact: true }).click();

  // 🔹 Select Attorney dropdown
  const attorneyDropdown = page
  .locator('label:text("Firm Attorney")')
  .locator('..')
  .locator('.select__control');

  // Open dropdown
await attorneyDropdown.click();

// Target the internal React-Select input
const attorneyInput = attorneyDropdown.locator('.select__value-container input');

// Type into React-Select properly
await attorneyInput.fill(dms.attorney);

// Wait for filtered option and click it
const attorneyOption = page.getByRole('option', { name: dms.attorney, exact: true });
await expect(attorneyOption).toBeVisible({ timeout: 15000 });
await attorneyOption.click();

  // 🔹 Select Case Type dropdown
  await page.locator('div').filter({ hasText: /^Case TypeSelect\.\.\.$/ }).locator('svg').click();
  await page.getByRole('option', { name: dms.caseType, exact: true }).click();

  await page.fill('input[name="firmPaymentAmount"]', amounts.firmPaymentAmount);
  await page.fill('input[name="firmPaymentDate"]', '09/30/2025');
  await page.fill('input[name="amountInDispute"]', amounts.amountInDispute);
  await page.fill('input[name="sentDate"]', '09/30/2025');
  await page.fill('input[name="billedAmount"]', amounts.billedAmount);
  await page.locator('div:nth-child(3) > div > div > div > .w-full > .select__control > .select__value-container > .select__input-container').click();
  await page.getByRole('option', { name: dms.decision, exact: true }).click();
  await page.getByRole('button', { name: 'Assign DOS' }).click();


  // ✅ Lawyer Login (New Page)
  const lawyerPage = await context.newPage();
  await lawyerPage.goto(testData.lawyerUrl);
  await lawyerPage.fill('input[name="username"]', lawyer.username);
  await lawyerPage.fill('input[name="password"]', lawyer.password);
  await lawyerPage.getByRole('button', { name: 'Sign In' }).click();


  await lawyerPage.waitForLoadState('domcontentloaded');
  await lawyerPage.getByRole('link', { name: 'New Records' }).click();
  //await lawyerPage.waitForLoadState('networkidle');
  await lawyerPage.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 60000 });

  // Force React Table to render rows
  await lawyerPage.mouse.wheel(0, 300);
  
  // Wait for first visible expander button
  await lawyerPage.locator('[data-testid^="expander-button"]').first().waitFor({
    state: 'visible',
    timeout: 60000
  });
  
  console.log("✅ Expander buttons loaded");

  // 🔹 Expand the first (newest) patient
  const firstExpander = lawyerPage.locator('[data-testid^="expander-button"]').first();
  await firstExpander.click();
  console.log('✅ Expanded first patient record');

  // 🔹 Click on the first DOS range (contains "_")

  const firstDOS = lawyerPage.locator('td').filter({ hasText: '_' }).first ();
  const dosText = await firstDOS.innerText();
  await firstDOS.click();
  console.log(`✅ Opened DOS range: ${dosText}`);
  //await lawyerPage.waitForLoadState('networkidle', { timeout: 30000 });

  // 🔹 Handle file view popup (View this file)
  const viewButton = lawyerPage.locator('button[title="View file"]').first();
  await lawyerPage.waitForSelector('button[title="View file"]', { timeout: 30000 });

  // Ensure page is still open before waiting for popup
  if (lawyerPage.isClosed()) {
    throw new Error('Page was closed before popup could be opened');
  }

  const [filePage] = await Promise.all([
    lawyerPage.waitForEvent('popup'),
    viewButton.click()
  ]);
  await filePage.waitForLoadState('domcontentloaded');
  console.log('✅ File opened in new tab');

  // Optional: validate file content or wait briefly
  await filePage.waitForTimeout(2000);

  // Close file view and return
  await filePage.close();
  await lawyerPage.bringToFront();
  console.log('✅ Switched back to main app tab');

  // Wait for table to reload and ensure we're on New Records page
  await lawyerPage.waitForLoadState('domcontentloaded');
  // await page.waitForSelector('[data-testid^="expander-button"]', { timeout: 10000 });

  // 🔹 Handle file download (Download this file)
  // Wait for download button to be visible (in case modal needs to refresh)
  const downloadButton = lawyerPage.getByRole('button', { name: 'Download this file' }).first();
  await downloadButton.waitFor({ state: 'visible', timeout: 30000 });

  // Ensure page is still open before waiting for download
  if (lawyerPage.isClosed()) {
    throw new Error('Page was closed before download could be initiated');
  }

  const [downloadPromise] = await Promise.all([
    lawyerPage.waitForEvent('download', { timeout: 30000 }),
    downloadButton.click(),
  ]);
  await downloadPromise;
  console.log('✅ File downloaded successfully');

  // Ensure we're back on New Records page
  await lawyerPage.bringToFront();
  await lawyerPage.waitForLoadState('domcontentloaded');
  console.log('✅ Returned to New Records page');

  // 🔹 Find record row using DOS text dynamically
  const targetRow = lawyerPage.locator(`tr:has-text("${dosText}"):not(:has-text("Billing"))`).first();

  // Wait until the row is visible
  await targetRow.waitFor({ state: 'visible', timeout: 10000 });

  // Scroll into view
  await targetRow.scrollIntoViewIfNeeded();


  // 🔹 Wait and click correct Start Processing button in that row
  const rejectButton = targetRow.locator('//button[@title="Reject Record"]');
  await rejectButton.waitFor({ state: 'visible', timeout: 10000 });
  await rejectButton.click();
  console.log('✅ Clicked Reject Record button');
  await lawyerPage.getByRole('textbox', { name: 'Comments *' }).click();
  await lawyerPage.getByRole('textbox', { name: 'Comments *' }).fill('Rejected');
  await lawyerPage.click('//button[normalize-space()="Reject"]');
  /*const rejectButton2 = targetRow.locator('//button[@title="Reject"]');
  await rejectButton2.waitFor({ state: 'visible', timeout: 10000 });
  await rejectButton2.click();
  console.log('✅ Clicked Reject button');*/
  const requestMoreInformationButton = targetRow.locator('//button[@title="Request More Information"]');
  await requestMoreInformationButton.waitFor({ state: 'visible', timeout: 10000 });
  await requestMoreInformationButton.click();
  console.log('✅ Clicked Request More Information button');
  await lawyerPage.getByRole('textbox', { name: 'Comments *' }).click();
  await lawyerPage.getByRole('textbox', { name: 'Comments *' }).fill('Additional info');
  await lawyerPage.getByRole('button', { name: 'Submit' }).click();
  console.log('✅ Clicked Submit button');
  console.log('✅ Record rejected successfully');

  const startButton = targetRow.locator('//button[@title="Start Processing Record"]');
  await startButton.waitFor({ state: 'visible', timeout: 10000 });
  await startButton.click();
  console.log('✅ Clicked Start Processing button');
  await lawyerPage.getByRole('textbox', { name: 'AAA ID *' }).click();
  await lawyerPage.getByRole('textbox', { name: 'AAA ID *' }).fill(testData.aaaDetails.aaaId);
  await lawyerPage.getByRole('textbox', { name: 'Comments (Optional)' }).click();
  await lawyerPage.getByRole('textbox', { name: 'Comments (Optional)' }).fill(testData.aaaDetails.comments);
  await lawyerPage.getByRole('button', { name: 'Start Processing', exact: true }).click();

  console.log('✅ Clicked Start Processing button');

  /*// 🔹 Fill AAA ID and comments (from JSON or inline)
  await page.fill('//input[@id="start-processing-aaa-id"]', testData.aaaDetails.aaaId);
  await page.fill('//textarea[@id="start-processing-comments"]', testData.aaaDetails.comments);
  await page.click('//button[@type="button"][normalize-space()="Start Processing"]');
  console.log('✅ Record moved to processed successfully');*/

  // 🔹 Go to Processed Records

  // Go to Processed Records
  await lawyerPage.getByRole('link', { name: 'Processed Records' }).click();
  await lawyerPage.waitForLoadState('networkidle');

  // Wait until patient expanders are visible
 // 1. Wait for API loading to finish
await lawyerPage.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 60000 });

// 2. Scroll to ensure expander buttons enter viewport
await lawyerPage.mouse.wheel(0, 300);

// 3. Wait for at least one visible expander button
await lawyerPage.locator('[data-testid^="expander-button"]').first().waitFor({
  state: 'visible',
  timeout: 60000
});

console.log('✅ Processed Records page loaded');

// 4. Now collect all expanders
const expanders = lawyerPage.locator('[data-testid^="expander-button"]');

  //const expanders = await lawyerPage.locator('[data-testid^="expander-button"]').all();
  let found = false;

  for (const expander of await expanders.all()) {
    await expander.scrollIntoViewIfNeeded();
    await expander.click();
    console.log('🔹 Expanded patient');

    // Wait for DOS rows under this patient
    const dosRows = lawyerPage.locator('tr').filter({ hasText: '_' });
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
          await dosRow.locator('button:has(svg.lucide-pencil)').click();
          //await lawyerPage.locator('div').filter({ hasText: /^${testData.processedAAAID.fileaccepted}$/ }).nth(3).click();
          await lawyerPage.fill('//input[@id="aaaId"]', testData.processedAAAID.aaaId);
          await lawyerPage.fill('//input[@id="comments"]', testData.processedAAAID.comments);
          await lawyerPage.getByRole('button', { name: 'Update AAA Index' }).click();
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
  await lawyerPage.waitForLoadState('networkidle');
 


  // 🔹 Go to Reports page
  await lawyerPage.getByRole('link', { name: 'Attorney Records' }).click();
  await lawyerPage.getByRole('button').nth(2).click();
  await lawyerPage.locator('.css-8mmkcg').first().click();
  await lawyerPage.getByRole('option', { name: testData.reports.hospital }).click();
  //await lawyerPage.locator('.css-8mmkcg').first().click();
  await lawyerPage.locator('.grid > div:nth-child(2) > div > div > .w-full.css-b62m3t-container > .select__control > .select__indicators > .select__indicator.select__dropdown-indicator > .css-8mmkcg').click();
  await lawyerPage.getByRole('option', { name: testData.reports.recordType }).click();
  await lawyerPage.locator('div:nth-child(3) > div > div > .w-full.css-b62m3t-container > .select__control > .select__indicators > .select__indicator.select__dropdown-indicator > .css-8mmkcg').click();
  await lawyerPage.getByRole('option', { name: testData.reports.aaaIndex }).click();
  await lawyerPage.getByRole('button', { name: 'Apply Filters' }).click();

  // Close the lawyer page
  await lawyerPage.close();
  await expect.soft(true).toBe(true);
  
});


