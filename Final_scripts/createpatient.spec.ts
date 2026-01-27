
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ✅ Load JSON Data
const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

test('Create Patient (JSON Based)', async ({ page, context }) => {

  // Extract values from JSON
  const { admin } = testData;

  await page.goto(testData.adminUrl);
await page.fill('//input[@name="username"]', admin.username);
await page.fill('//input[@name="password"]', admin.password);
await page.getByRole('button', { name: 'Sign In' }).click();

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
});