import test, { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(__dirname, 'testData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));



test.describe('Admin Tabs', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testData.adminUrl);
        await page.fill('//input[@name="username"]', testData.admin.username);
        await page.fill('//input[@name="password"]', testData.admin.password);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.getByRole('navigation').getByRole('link', { name: 'Admin' }).click();
    });

    test('Insurance', async ({ page }) => {
        await page.getByRole('navigation').getByRole('link', { name: 'Insurance' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.fill('input[name="name"]', testData.admintabs.insurance.name);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Insurance added successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search insurance..."]', testData.admintabs.insurance.name);


        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.fill('input[name="name"]', testData.admintabs.insurance.editedName);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Insurance updated successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search insurance..."]', testData.admintabs.insurance.editedName);
        await page.getByRole('button', { name: 'View' }).first().click();
        await expect(page.getByText(testData.admintabs.insurance.editedName)).toBeDisabled();
    })

    test('Insurance address', async ({ page }) => {
        await page.getByRole('navigation').getByRole('link', { name: 'Insurance address' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.fill('input[name="insuranceName"]', testData.admintabs.insurance.name);
        await page.fill('input[name="address1"]', testData.admintabs.insurance.address1);
        await page.fill('input[name="city"]', testData.admintabs.insurance.city);
        await page.fill('input[name="state"]', testData.admintabs.insurance.state);
        await page.fill('input[name="zip"]', testData.admintabs.insurance.zip);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Insurance address added successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search insurance..."]', testData.admintabs.insurance.name);
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.fill('input[name="address1"]', testData.admintabs.insurance.editedAddress1);
        await page.fill('input[name="city"]', testData.admintabs.insurance.editedCity);
        await page.fill('input[name="state"]', testData.admintabs.insurance.editedState);
        await page.fill('input[name="zip"]', testData.admintabs.insurance.editedZip);

        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Insurance address updated successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search insurance..."]', testData.admintabs.insurance.editedName);
        await page.getByRole('button', { name: 'View' }).first().click();
        await expect(page.getByText(testData.admintabs.insurance.editedName)).toBeDisabled();

    })
    test('Document Type', async ({ page }) => {
        await page.getByRole('navigation').getByRole('link', { name: 'Document Type' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.fill('//input[@id="documentType"]', testData.admintabs.documentType.documentType);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Document type added successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search document type..."]', testData.admintabs.documentType.documentType);
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.fill('//input[@id="documentType"]', testData.admintabs.documentType.editedDocumentType);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Document type updated successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search document type..."]', testData.admintabs.documentType.documentType);
        await page.getByRole('button', { name: 'View' }).first().click();
        await expect(page.getByText(testData.admintabs.documentType.documentType)).toBeDisabled();

    })
    test('Nature of Dispute', async ({ page }) => {
        await page.getByRole('navigation').getByRole('link', { name: 'Nature of Dispute' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.fill('//textarea[@id="natureOfDispute"]', testData.admintabs.natureOfDispute.natureOfDispute);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Nature of dispute added successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search nature of dispute..."]', testData.admintabs.natureOfDispute.natureOfDispute);
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.fill('//input[@id="natureOfDispute"]', testData.admintabs.natureOfDispute.editedNatureOfDispute);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Nature of dispute updated successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search nature of dispute..."]', testData.admintabs.natureOfDispute.natureOfDispute);
        await page.getByRole('button', { name: 'View' }).first().click();
        await expect(page.getByText(testData.admintabs.natureOfDispute.natureOfDispute)).toBeDisabled();
    })
    test('Case Type', async ({ page }) => {
        await page.getByRole('navigation').getByRole('link', { name: 'Case Type' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.fill('//input[@id="caseType"]', testData.admintabs.caseType.caseType);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Case type added successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search case type..."]', testData.admintabs.caseType.caseType);
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.fill('//input[@id="caseType"]', testData.admintabs.caseType.editedCaseType);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Case type updated successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search case type..."]', testData.admintabs.caseType.caseType);
        await page.getByRole('button', { name: 'View' }).first().click();
        await expect(page.getByText(testData.admintabs.caseType.caseType)).toBeDisabled();
    })
    test('Status Types', async ({ page }) => {
        await page.getByRole('navigation').getByRole('link', { name: 'Status Types' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.fill('//input[@id="currentStatus"]', testData.admintabs.statusTypes.StatusType);
        await page.fill('//input[@id="currentStatus"]', testData.admintabs.statusTypes.editedStatusType);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Status type updated successfully')).toBeVisible();

        await page.fill('//input[@placeholder="Search status type..."]', testData.admintabs.statusTypes.StatusType);
        await page.getByRole('button', { name: 'View' }).first().click();
        await expect(page.getByText(testData.admintabs.statusTypes.StatusType)).toBeDisabled();
    })

})