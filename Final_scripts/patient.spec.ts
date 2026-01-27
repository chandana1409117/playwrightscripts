import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load JSON Data for credentials
test.describe('Add Patient Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testData.adminUrl);
    await page.fill('input[name="username"]', admin.username);
    await page.fill('input[name="password"]', admin.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
  });
  const dataPath = path.join(__dirname, 'testData.json');
  const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { admin } = testData;


  test('Create new patient', async ({ page }) => {


    await page.getByRole('navigation').getByRole('link', { name: 'Patients' }).click();
    test('Create new patient dynamically', async ({ page }) => {

      // Navigate to Create Patient page
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
      await page.fill('input[name="primaryInsurance.notes"]', testData.patient.primaryInsurance.notes);

      // If you have secondary insurance, handle conditionally

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
      await page.fill('input[name="secondaryInsurance.notes"]', testData.patient.secondaryInsurance.notes);

      // Save
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify
      await expect(page.getByText('Patient saved successfully')).toBeVisible();
    });
  });
  test('Edit patient', async ({ page }) => {
    await page.getByRole('link', { name: 'Patients' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Patients' }).click();
    await page.locator('.select__indicator.select__dropdown-indicator.css-16i2ida-indicatorContainer').first().click();
    await page.getByRole('option', { name: testData.editPatient.practice }).click();
    await page.locator('#row-2').getByRole('button', { name: 'Edit' }).click();
    await page.fill('input[name="firstName"]', testData.editPatient.firstName);
    await page.fill('input[name="lastName"]', testData.editPatient.lastName);
    await page.fill('input[name="ssn"]', testData.editPatient.ssn);
    await page.fill('input[name="address"]', testData.editPatient.address);
    await page.fill('input[name="city"]', testData.editPatient.city);
    await page.fill('input[name="state"]', testData.editPatient.state);
    await page.fill('input[name="zip"]', testData.editPatient.zip);
    await page.fill('input[name="phone"]', testData.editPatient.phone);
    await page.fill('input[name="primaryInsurance.claimNumber"]', testData.editPatient.primaryInsurance.claimNumber);
    await page.fill('input[name="primaryInsurance.policyNumber"]', testData.editPatient.primaryInsurance.policyNumber);
    await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).nth(2).fill(testData.editPatient.primaryInsurance.doa);
    await page.fill('input[name="primaryInsurance.adjusterName"]', testData.editPatient.primaryInsurance.adjusterName);
    await page.fill('input[name="primaryInsurance.relationship"]', testData.editPatient.primaryInsurance.relationship);
    await page.fill('input[name="primaryInsurance.adjusterFax"]', testData.editPatient.primaryInsurance.adjusterFax);
    await page.fill('input[name="primaryInsurance.insurancePhone"]', testData.editPatient.primaryInsurance.insurancePhone);
    await page.fill('input[name="primaryInsurance.insuranceFax"]', testData.editPatient.primaryInsurance.insuranceFax);
    await page.fill('input[name="primaryInsurance.notes"]', testData.editPatient.primaryInsurance.notes);
    await page.fill('input[name="secondaryInsurance.claimNumber"]', testData.editPatient.secondaryInsurance.claimNumber);
    await page.fill('input[name="secondaryInsurance.policyNumber"]', testData.editPatient.secondaryInsurance.policyNumber);
    await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).nth(2).fill(testData.editPatient.secondaryInsurance.doa);
    await page.fill('input[name="secondaryInsurance.adjusterName"]', testData.editPatient.secondaryInsurance.adjusterName);
    await page.fill('input[name="secondaryInsurance.relationship"]', testData.editPatient.secondaryInsurance.relationship);
    await page.fill('input[name="secondaryInsurance.adjusterFax"]', testData.editPatient.secondaryInsurance.adjusterFax);
    await page.fill('input[name="secondaryInsurance.insurancePhone"]', testData.editPatient.secondaryInsurance.insurancePhone);
    await page.fill('input[name="secondaryInsurance.insuranceFax"]', testData.editPatient.secondaryInsurance.insuranceFax);
    await page.fill('input[name="secondaryInsurance.notes"]', testData.editPatient.secondaryInsurance.notes);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Patient updated successfully')).toBeVisible();
  });


  test('View patient', async ({ page }) => {
    await page.getByRole('link', { name: 'Patients' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Patients' }).click();
    await page.locator('.select__indicator.select__dropdown-indicator.css-16i2ida-indicatorContainer').first().click();
    await page.getByRole('option', { name: testData.editPatient.practice }).click();
    await page.locator('#row-2').getByRole('button', { name: 'View' }).click();
    await expect(page.getByText(testData.editPatient.firstName)).toBeVisible();
    await expect(page.getByText(testData.editPatient.lastName)).toBeVisible();
    await expect(page.getByText(testData.editPatient.ssn)).toBeVisible();
  });
});